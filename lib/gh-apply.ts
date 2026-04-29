import axios from "axios";

type Suggestion = {
  filePath: string;
  originalCode: string;
  suggestedCode: string;
};

type ApplyResult =
  | { success: true; prUrl: string; prNumber: number }
  | { success: false; error: string };

const ghHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
});

async function getBranchSha(
  repoFullName: string,
  branch: string,
  token: string,
): Promise<string> {
  const { data } = await axios.get(
    `https://api.github.com/repos/${repoFullName}/git/ref/heads/${branch}`,
    { headers: ghHeaders(token) },
  );
  return data.object.sha;
}

async function getFileContent(
  repoFullName: string,
  filePath: string,
  branch: string,
  token: string,
): Promise<{ content: string; sha: string }> {
  const { data } = await axios.get(
    `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
    {
      headers: ghHeaders(token),
      params: { ref: branch },
    },
  );
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha };
}

async function createBranch(
  repoFullName: string,
  branchName: string,
  fromSha: string,
  token: string,
): Promise<void> {
  await axios.post(
    `https://api.github.com/repos/${repoFullName}/git/refs`,
    { ref: `refs/heads/${branchName}`, sha: fromSha },
    { headers: ghHeaders(token) },
  );
}

async function updateFile(
  repoFullName: string,
  filePath: string,
  content: string,
  fileSha: string,
  branch: string,
  message: string,
  token: string,
): Promise<void> {
  await axios.put(
    `https://api.github.com/repos/${repoFullName}/contents/${filePath}`,
    {
      message,
      content: Buffer.from(content, "utf-8").toString("base64"),
      sha: fileSha,
      branch,
    },
    { headers: ghHeaders(token) },
  );
}

async function createPullRequest(
  repoFullName: string,
  title: string,
  body: string,
  head: string,
  base: string,
  token: string,
): Promise<{ url: string; number: number }> {
  const { data } = await axios.post(
    `https://api.github.com/repos/${repoFullName}/pulls`,
    { title, body, head, base },
    { headers: ghHeaders(token) },
  );
  return { url: data.html_url, number: data.number };
}

// ─── Normalisation helpers ────────────────────────────────────────────────────

/** Strip all whitespace so we can do a content-only comparison. */
function collapseWhitespace(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/** Split into lines and remove leading/trailing blank lines. */
function toLines(s: string): string[] {
  return s.replace(/\r\n/g, "\n").split("\n");
}

/**
 * Detect the indentation of the FIRST non-blank line in a block.
 * Returns the leading whitespace string (spaces or tabs).
 */
function detectIndent(block: string): string {
  for (const line of toLines(block)) {
    if (line.trim().length > 0) {
      const match = line.match(/^(\s+)/);
      return match ? match[1] : "";
    }
  }
  return "";
}

/**
 * Re-indent `block` to use `targetIndent` as its base indent.
 * Works out the block's own base indent and shifts every line accordingly.
 */
function reindent(block: string, targetIndent: string): string {
  const lines = toLines(block);
  const nonBlank = lines.filter((l) => l.trim().length > 0);
  if (nonBlank.length === 0) return block;

  const srcIndent = detectIndent(block);
  const srcLen = srcIndent.length;
  const tgtLen = targetIndent.length;

  return lines
    .map((line) => {
      if (line.trim().length === 0) return line; // keep blank lines as-is
      const currentIndent = (line.match(/^(\s*)/) ?? ["", ""])[1];
      const currentLen = currentIndent.length;
      const extra = Math.max(0, currentLen - srcLen);
      return targetIndent + " ".repeat(extra) + line.trimStart();
    })
    .join("\n");
}

// ─── Main replacement logic ───────────────────────────────────────────────────

/**
 * Try several strategies to locate `originalCode` inside `fileContent`
 * and replace it with `suggestedCode`.
 *
 * Strategy order (cheapest → most lenient):
 *   1. Exact match (after CRLF normalisation)
 *   2. Trimmed-line match (ignores leading/trailing blank lines in snippet)
 *   3. Whitespace-collapsed match (ignores ALL indent differences)
 *   4. Line-by-line fuzzy match on trimmed content (catches renamed vars in AI output)
 */
function applyReplacement(
  fileContent: string,
  originalCode: string,
  suggestedCode: string,
): string | null {
  const normalized = fileContent.replace(/\r\n/g, "\n");
  const normOriginal = originalCode.replace(/\r\n/g, "\n");

  // ── Strategy 1: exact ──────────────────────────────────────────────────────
  if (normalized.includes(normOriginal)) {
    return normalized.replace(normOriginal, suggestedCode.trim());
  }

  // ── Strategy 2: trim surrounding blank lines ───────────────────────────────
  const trimmedOriginal = normOriginal.trim();
  if (normalized.includes(trimmedOriginal)) {
    return normalized.replace(trimmedOriginal, suggestedCode.trim());
  }

  // ── Strategy 3: whitespace-collapsed match ─────────────────────────────────
  // Find a block of lines in the file whose collapsed text equals the snippet's.
  const snippetLines = toLines(trimmedOriginal).filter(
    (l) => l.trim().length > 0,
  );
  const fileLines = toLines(normalized);
  const snippetCollapsed = snippetLines.map(collapseWhitespace);

  for (let i = 0; i <= fileLines.length - snippetLines.length; i++) {
    const windowCollapsed = fileLines
      .slice(i, i + snippetLines.length)
      .map(collapseWhitespace);

    if (
      windowCollapsed.length === snippetCollapsed.length &&
      windowCollapsed.every((l, idx) => l === snippetCollapsed[idx])
    ) {
      // Found a match — figure out target indent from the file
      const targetIndent = detectIndent(
        fileLines.slice(i, i + snippetLines.length).join("\n"),
      );
      const reindented = reindent(suggestedCode.trim(), targetIndent);

      const before = fileLines.slice(0, i).join("\n");
      const after = fileLines.slice(i + snippetLines.length).join("\n");
      return [before, reindented, after].filter((p) => p !== "").join("\n");
    }
  }

  // ── Strategy 4: fuzzy line match (tolerates minor AI paraphrasing) ─────────
  // Each line must match after collapsing whitespace AND removing common
  // punctuation differences (trailing commas/semicolons).
  const normalize = (s: string) =>
    collapseWhitespace(s).replace(/[;,]$/, "").toLowerCase();

  const snippetNorm = snippetLines.map(normalize);

  for (let i = 0; i <= fileLines.length - snippetLines.length; i++) {
    const windowNorm = fileLines
      .slice(i, i + snippetLines.length)
      .filter((l) => l.trim().length > 0)
      .map(normalize);

    if (
      windowNorm.length === snippetNorm.length &&
      windowNorm.every((l, idx) => l === snippetNorm[idx])
    ) {
      const targetIndent = detectIndent(
        fileLines.slice(i, i + snippetLines.length).join("\n"),
      );
      const reindented = reindent(suggestedCode.trim(), targetIndent);

      const before = fileLines.slice(0, i).join("\n");
      const after = fileLines.slice(i + snippetLines.length).join("\n");
      return [before, reindented, after].filter((p) => p !== "").join("\n");
    }
  }

  return null; // all strategies exhausted
}

export async function applyAndCreatePR(
  repoFullName: string,
  baseBranch: string,
  prNumber: number,
  suggestions: Suggestion[],
  accessToken: string,
): Promise<ApplyResult> {
  try {
    const baseSha = await getBranchSha(repoFullName, baseBranch, accessToken);

    const newBranch = `d2p/pr-${prNumber}-suggestions-${Date.now()}`;
    await createBranch(repoFullName, newBranch, baseSha, accessToken);

    const byFile = new Map<string, Suggestion[]>();
    for (const s of suggestions) {
      if (!byFile.has(s.filePath)) byFile.set(s.filePath, []);
      byFile.get(s.filePath)!.push(s);
    }

    const appliedFiles: string[] = [];
    const skippedFiles: string[] = [];
    const skipReasons: Record<string, string> = {};

    for (const [filePath, fileSuggestions] of byFile) {
      try {
        let { content, sha } = await getFileContent(
          repoFullName,
          filePath,
          baseBranch,
          accessToken,
        );

        let modified = false;
        for (const s of fileSuggestions) {
          const result = applyReplacement(
            content,
            s.originalCode,
            s.suggestedCode,
          );
          if (result !== null) {
            content = result;
            modified = true;
          } else {
            console.warn(
              `[gh-apply] No match for snippet in ${filePath} (all 4 strategies failed)`,
            );
            console.warn(
              `  snippet (first 120 chars): ${s.originalCode.slice(0, 120)}`,
            );
          }
        }

        if (!modified) {
          skippedFiles.push(filePath);
          skipReasons[filePath] =
            "AI-generated snippet did not match file content (even with fuzzy matching)";
          continue;
        }

        await updateFile(
          repoFullName,
          filePath,
          content,
          sha,
          newBranch,
          `fix: apply D2P AI suggestions to ${filePath}`,
          accessToken,
        );

        appliedFiles.push(filePath);
      } catch (err: any) {
        skippedFiles.push(filePath);
        skipReasons[filePath] =
          err?.response?.data?.message ?? err?.message ?? "Unknown error";
      }
    }

    if (appliedFiles.length === 0) {
      const reasons = Object.entries(skipReasons)
        .map(([f, r]) => `• ${f}: ${r}`)
        .join("\n");
      return {
        success: false,
        error: `Could not apply any suggestions.\n${reasons}`,
      };
    }

    const appliedCount = appliedFiles.length;
    const totalCount = [...byFile.keys()].length;

    const prBody = [
      `## D2P AI Review — Applied Suggestions`,
      ``,
      `This PR applies **${appliedCount} of ${totalCount}** AI-suggested fixes from PR #${prNumber}.`,
      ``,
      `### Changed files`,
      appliedFiles.map((f) => `- \`${f}\``).join("\n"),
      skippedFiles.length > 0
        ? [
            ``,
            `### Skipped files`,
            skippedFiles
              .map((f) => `- \`${f}\`: ${skipReasons[f] ?? "unknown"}`)
              .join("\n"),
          ].join("\n")
        : "",
      ``,
      `> Generated by [D2P](https://github.com) AI code reviewer`,
    ]
      .filter(Boolean)
      .join("\n");

    const { url, number } = await createPullRequest(
      repoFullName,
      `[D2P] AI suggested fixes for PR #${prNumber}`,
      prBody,
      newBranch,
      baseBranch,
      accessToken,
    );

    return { success: true, prUrl: url, prNumber: number };
  } catch (err: any) {
    const message =
      err?.response?.data?.message ?? err?.message ?? "Unknown error";
    return { success: false, error: `GitHub API error: ${message}` };
  }
}

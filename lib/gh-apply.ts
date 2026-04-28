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

function applyReplacement(
  fileContent: string,
  originalCode: string,
  suggestedCode: string,
): string | null {
  const normalized = fileContent.replace(/\r\n/g, "\n");
  const normalizedOriginal = originalCode.replace(/\r\n/g, "\n").trim();

  if (!normalized.includes(normalizedOriginal)) {
    return null;
  }

  return normalized.replace(normalizedOriginal, suggestedCode.trim());
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

    // Filter out generated files that should not be patched
    const generatedFilePatterns = [
      /^package-lock\.json$/,
      /^yarn\.lock$/,
      /^pnpm-lock\.yaml$/,
      /^poetry\.lock$/,
      /^Gemfile\.lock$/,
      /^go\.sum$/,
      /^Cargo\.lock$/,
      /^composer\.lock$/,
    ];

    const filteredSuggestions = suggestions.filter((s) => {
      return !generatedFilePatterns.some((pattern) => pattern.test(s.filePath));
    });

    if (filteredSuggestions.length === 0) {
      return {
        success: false,
        error:
          "Could not apply any suggestions — all targeted files are auto-generated (lock files). Run dependency install commands to regenerate them.",
      };
    }

    const byFile = new Map<string, Suggestion[]>();
    for (const s of filteredSuggestions) {
      if (!byFile.has(s.filePath)) byFile.set(s.filePath, []);
      byFile.get(s.filePath)!.push(s);
    }

    const appliedFiles: string[] = [];
    const skippedFiles: string[] = [];

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
              `[github-apply] Could not find original code in ${filePath}, skipping`,
            );
          }
        }

        if (!modified) {
          skippedFiles.push(filePath);
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
      }
    }

    if (appliedFiles.length === 0) {
      return {
        success: false,
        error:
          "Could not apply any suggestions — the code may have changed since the review.",
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
        ? `\n### Skipped (code may have changed)\n${skippedFiles.map((f) => `- \`${f}\``).join("\n")}`
        : "",
      ``,
      `> Generated by [D2P](https://github.com) AI code reviewer`,
    ].join("\n");

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

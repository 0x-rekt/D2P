import axios from "axios";

export interface GitHubIssueOptions {
  title: string;
  body: string;
  labels: string[];
}

export interface GitHubCheckRunOptions {
  name: string;
  headSha: string;
  status: "completed" | "in_progress" | "queued";
  conclusion?:
    | "success"
    | "failure"
    | "neutral"
    | "cancelled"
    | "skipped"
    | "timed_out"
    | "action_required";
  title?: string;
  summary?: string;
  details?: string;
}

/**
 * Create a GitHub issue with security findings
 */
export const createSecurityIssue = async (
  accessToken: string,
  repoFullName: string,
  options: GitHubIssueOptions,
): Promise<{ id: number; number: number; html_url: string }> => {
  try {
    const [owner, repo] = repoFullName.split("/");

    const response = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues`,
      {
        title: options.title,
        body: options.body,
        labels: options.labels,
      },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/vnd.github+json",
        },
      },
    );

    return {
      id: response.data.id,
      number: response.data.number,
      html_url: response.data.html_url,
    };
  } catch (error) {
    console.error("Failed to create GitHub issue:", error);
    throw error;
  }
};

export const createCommitStatus = async (
  accessToken: string,
  repoFullName: string,
  options: GitHubCheckRunOptions & { prNumber: number },
): Promise<void> => {
  try {
    const [owner, repo] = repoFullName.split("/");

    // Set commit status (works with OAuth token, sufficient for branch protection)
    if (options.conclusion === "failure") {
      try {
        await axios.post(
          `https://api.github.com/repos/${owner}/${repo}/statuses/${options.headSha}`,
          {
            state: "failure",
            description: options.summary || "Critical security findings",
            context: "D2P/security-scan",
            target_url: `https://github.com/${owner}/${repo}/pull/${options.prNumber}`,
          },
          {
            headers: {
              authorization: `token ${accessToken}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
        );

        console.log(`[GitHub] Commit status set to failure`);
      } catch (statusError: any) {
        console.error(
          `[GitHub] Failed to create commit status (${statusError.response?.status}):`,
          statusError.response?.data?.message || statusError.message,
        );
        throw statusError;
      }
    } else if (options.conclusion === "success") {
      // Set success status
      try {
        await axios.post(
          `https://api.github.com/repos/${owner}/${repo}/statuses/${options.headSha}`,
          {
            state: "success",
            description: options.summary || "Security scan passed",
            context: "D2P/security-scan",
            target_url: `https://github.com/${owner}/${repo}/pull/${options.prNumber}`,
          },
          {
            headers: {
              authorization: `token ${accessToken}`,
              "X-GitHub-Api-Version": "2022-11-28",
            },
          },
        );

        console.log(`[GitHub] Commit status set to success`);
      } catch (statusError: any) {
        console.error(
          `[GitHub] Failed to create commit status (${statusError.response?.status}):`,
          statusError.response?.data?.message || statusError.message,
        );
        throw statusError;
      }
    }
  } catch (error) {
    console.error("Error creating commit status:", error);
    throw error;
  }
};

/**
 * Create a fix PR for secrets rotation or dependency upgrades
 */
export const createFixPR = async (
  accessToken: string,
  repoFullName: string,
  options: {
    title: string;
    description: string;
    fixType: "secret_rotation" | "dependency_upgrade";
    changes: Record<string, string>; // filePath -> newContent
    baseBranch: string;
  },
): Promise<{ number: number; html_url: string }> => {
  try {
    const [owner, repo] = repoFullName.split("/");

    // Step 1: Get the latest commit SHA
    const mainResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${options.baseBranch}`,
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const baseSha = mainResponse.data.object.sha;

    // Step 2: Get the base tree
    const commitResponse = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/git/commits/${baseSha}`,
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const baseTreeSha = commitResponse.data.tree.sha;

    // Step 3: Create a new tree with the changes
    const treeItems = Object.entries(options.changes).map(
      ([path, content]) => ({
        path,
        mode: "100644",
        type: "blob",
        content,
      }),
    );

    const treeResponse = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/trees`,
      {
        base_tree: baseTreeSha,
        tree: treeItems,
      },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    // Step 4: Create a new commit
    const newCommitResponse = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/commits`,
      {
        message: options.title,
        tree: treeResponse.data.sha,
        parents: [baseSha],
      },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    // Step 5: Create the fix branch
    const fixBranchName = `d2p/fix-${options.fixType}-${Date.now()}`;
    await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/git/refs`,
      {
        ref: `refs/heads/${fixBranchName}`,
        sha: newCommitResponse.data.sha,
      },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    // Step 6: Create a PR
    const prResponse = await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls`,
      {
        title: options.title,
        body: options.description,
        head: fixBranchName,
        base: options.baseBranch,
        draft: true, // Create as draft for review
      },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    console.log(`[GitHub] Fix PR created: ${prResponse.data.number}`);

    return {
      number: prResponse.data.number,
      html_url: prResponse.data.html_url,
    };
  } catch (error) {
    console.error("Failed to create fix PR:", error);
    throw error;
  }
};

/**
 * Request changes on a PR review (blocks merge if reviews are required)
 * Note: Can only be used on PRs not created by the authenticated user
 */
export const requestChangesOnPR = async (
  accessToken: string,
  repoFullName: string,
  prNumber: number,
  headSha: string,
  body: string,
): Promise<void> => {
  try {
    const [owner, repo] = repoFullName.split("/");

    await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}/reviews`,
      {
        commit_id: headSha,
        body: body,
        event: "REQUEST_CHANGES",
      },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
          Accept: "application/vnd.github+json",
        },
      },
    );

    console.log(
      `[GitHub] Review with requested changes posted on PR ${prNumber}`,
    );
  } catch (error: any) {
    // Handle 422 - typically means PR author is the authenticated user
    if (error.response?.status === 422) {
      const errorMsg =
        error.response?.data?.errors?.[0] ||
        error.response?.data?.message ||
        "";
      if (errorMsg.includes("your own pull request")) {
        console.log(
          `[GitHub] Skipping review request on self-authored PR (will rely on commit status)`,
        );
        return;
      }
    }

    // Log other errors but don't throw - this is a best-effort operation
    const errorDetails =
      error.response?.data?.errors ||
      error.response?.data?.message ||
      error.message;
    console.warn(`[GitHub] Failed to request changes:`, errorDetails);
  }
};

/**
 * Post a comment on a PR with security findings
 */
export const postSecurityComment = async (
  accessToken: string,
  repoFullName: string,
  prNumber: number,
  body: string,
): Promise<void> => {
  try {
    const [owner, repo] = repoFullName.split("/");

    await axios.post(
      `https://api.github.com/repos/${owner}/${repo}/issues/${prNumber}/comments`,
      { body },
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    console.log(`[GitHub] Comment posted on PR ${prNumber}`);
  } catch (error) {
    console.error("Failed to post comment:", error);
    throw error;
  }
};

/**
 * Format security findings for GitHub issue body
 */
export const formatSecurityFindingsForGitHub = (findings: {
  critical: number;
  high: number;
  medium: number;
  low: number;
  details: any;
}): string => {
  let body = `# 🔒 Security Scan Results\n\n`;
  body += `| Severity | Count |\n`;
  body += `|----------|-------|\n`;
  body += `| 🔴 Critical | ${findings.critical} |\n`;
  body += `| 🟠 High | ${findings.high} |\n`;
  body += `| 🟡 Medium | ${findings.medium} |\n`;
  body += `| 🟢 Low | ${findings.low} |\n\n`;

  if (findings.details.secrets && findings.details.secrets.length > 0) {
    body += `## 🔑 Hardcoded Secrets\n\n`;
    findings.details.secrets.forEach((secret: any) => {
      body += `- **${secret.type}** (Line ${secret.lineNumber}): ${secret.description}\n`;
      body += `  - File: \`${secret.filePath}\`\n`;
    });
    body += `\n`;
  }

  if (findings.details.cves && findings.details.cves.length > 0) {
    body += `## 📦 Vulnerable Dependencies\n\n`;
    findings.details.cves.forEach((cve: any) => {
      body += `- **${cve.title}** (CVSS: ${cve.cvssScore || "N/A"})\n`;
      body += `  - ${cve.description}\n`;
    });
    body += `\n`;
  }

  if (
    findings.details.owaslPatterns &&
    findings.details.owaslPatterns.length > 0
  ) {
    body += `## ⚠️ OWASP Vulnerabilities\n\n`;
    findings.details.owaslPatterns.forEach((pattern: any) => {
      body += `- **${pattern.title}** (Line ${pattern.lineNumber})\n`;
      body += `  - ${pattern.description}\n`;
      if (pattern.suggestions && pattern.suggestions.length > 0) {
        body += `  - Suggestions:\n`;
        pattern.suggestions.forEach((suggestion: string) => {
          body += `    - ${suggestion}\n`;
        });
      }
    });
  }

  body += `\n---\nScanned by [D2P Security Scanner](https://github.com/ai-review/d2p)`;

  return body;
};

/**
 * Generate severity labels for GitHub issue
 */
export const generateSeverityLabels = (findings: {
  critical: number;
  high: number;
  medium: number;
  low: number;
}): string[] => {
  const labels = ["security"];

  if (findings.critical > 0) labels.push("severity/critical");
  if (findings.high > 0) labels.push("severity/high");
  if (findings.medium > 0) labels.push("severity/medium");
  if (findings.low > 0) labels.push("severity/low");

  return labels;
};

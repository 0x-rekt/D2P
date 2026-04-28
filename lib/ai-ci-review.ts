import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import prisma from "@/lib/prisma";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_REGION!,
  googleAuthOptions: {
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY || "{}"),
  },
});

type CiPatch = {
  filePath: string;
  originalCode: string;
  suggestedCode: string;
};

type CiDiagnosis = {
  rootCause: string;
  diagnosis: string;
  fixSummary: string;
  patches: CiPatch[];
};

// ─── GitHub log fetching ──────────────────────────────────────────────────────

async function fetchWorkflowLogs(
  repoFullName: string,
  runId: number | bigint,
  accessToken: string,
): Promise<string> {
  try {
    const { data, headers } = await axios.get(
      `https://api.github.com/repos/${repoFullName}/actions/runs/${runId}/logs`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        responseType: "arraybuffer",
        maxContentLength: 5_000_000,
        validateStatus: (s) => s < 400,
      },
    );

    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(Buffer.from(data));
    const entries = zip.getEntries();

    const logParts: string[] = [];
    let totalChars = 0;
    const MAX_CHARS = 80_000;

    for (const entry of entries) {
      if (entry.isDirectory) continue;
      if (!entry.entryName.endsWith(".txt")) continue;

      const text = entry.getData().toString("utf-8");
      const trimmed = text.slice(0, 15_000); // cap per file
      logParts.push(`=== ${entry.entryName} ===\n${trimmed}`);
      totalChars += trimmed.length;
      if (totalChars >= MAX_CHARS) break;
    }

    return logParts.join("\n\n");
  } catch (err: any) {
    const { data } = await axios.get(
      `https://api.github.com/repos/${repoFullName}/actions/runs/${runId}/jobs`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const failedJobs = (data.jobs as any[]).filter(
      (j) => j.conclusion === "failure",
    );

    return failedJobs
      .map((job) => {
        const failedSteps = job.steps.filter(
          (s: any) => s.conclusion === "failure",
        );
        return [
          `Job: ${job.name}`,
          ...failedSteps.map(
            (s: any) => `  Failed step: ${s.name}\n  ${s.conclusion}`,
          ),
        ].join("\n");
      })
      .join("\n\n");
  }
}

async function fetchChangedFiles(
  repoFullName: string,
  commitSha: string,
  accessToken: string,
): Promise<{ filename: string; patch?: string }[]> {
  try {
    const { data } = await axios.get(
      `https://api.github.com/repos/${repoFullName}/commits/${commitSha}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );
    return (data.files ?? []).map((f: any) => ({
      filename: f.filename,
      patch: f.patch,
    }));
  } catch {
    return [];
  }
}

async function diagnoseCiFailureWithAI(
  logs: string,
  changedFiles: { filename: string; patch?: string }[],
  repoFullName: string,
  workflowName: string,
  branch: string,
): Promise<CiDiagnosis> {
  const changedFilesSummary = changedFiles
    .map(
      (f) =>
        `File: ${f.filename}\n${f.patch ? `Diff:\n${f.patch.slice(0, 3000)}` : "(no diff available)"}`,
    )
    .join("\n\n---\n\n");

  const prompt = `You are an expert DevOps engineer and CI/CD specialist. A GitHub Actions workflow has failed. Analyze the failure and return a JSON object with your diagnosis and fix.

Repository: ${repoFullName}
Workflow: ${workflowName}
Branch: ${branch}

## Failure Logs
${logs.slice(0, 60_000)}

## Files Changed in This Commit
${changedFilesSummary.slice(0, 15_000)}

Diagnose the root cause and provide concrete fixes where possible. Return ONLY valid JSON with no markdown fences:

{
  "rootCause": "One-line summary of the root cause (e.g. 'Type error in src/api.ts line 42', 'Missing env variable DATABASE_URL', 'Flaky test in UserService.test.ts')",
  "diagnosis": "Detailed explanation of what went wrong, why it failed, and what the error means (2-4 sentences)",
  "fixSummary": "Concise description of what needs to be changed to fix the failure",
  "patches": [
    {
      "filePath": "path/to/file.ts",
      "originalCode": "exact snippet that needs changing",
      "suggestedCode": "the corrected replacement"
    }
  ]
}

Rules:
- patches array can be empty [] if the fix requires env changes, infra changes, or is non-code (e.g. secret rotation)
- For flaky tests, suggest adding retry logic or fixing the assertion
- For type errors, provide the exact corrected types
- For missing deps, suggest the exact install command in fixSummary
- originalCode must be the exact string from the file (so it can be automatically applied)
- Maximum 5 patches`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: { temperature: 0.1 },
  });

  const text = response.text ?? "";
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      rootCause: parsed.rootCause ?? "Unknown root cause",
      diagnosis: parsed.diagnosis ?? "Could not diagnose failure",
      fixSummary: parsed.fixSummary ?? "Manual investigation required",
      patches: Array.isArray(parsed.patches) ? parsed.patches : [],
    };
  } catch {
    return {
      rootCause: "AI parsing failed",
      diagnosis:
        "The AI returned an unparseable response. Check the logs manually.",
      fixSummary: "Manual investigation required",
      patches: [],
    };
  }
}

async function getAccessToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, providerId: "github" },
    select: { accessToken: true },
  });
  return account?.accessToken ?? null;
}

export async function analyzeCiFailureWithAI(
  ciFailureId: string,
  userId: string,
): Promise<void> {
  await prisma.ciFailure.update({
    where: { id: ciFailureId },
    data: { analysisStatus: "analyzing" },
  });

  try {
    const ciFailure = await prisma.ciFailure.findUnique({
      where: { id: ciFailureId },
      include: { repository: true },
    });

    if (!ciFailure) return;

    const accessToken = await getAccessToken(userId);
    if (!accessToken) throw new Error(`No GitHub token for user ${userId}`);

    const [logs, changedFiles] = await Promise.all([
      fetchWorkflowLogs(
        ciFailure.repository.fullName,
        ciFailure.workflowRunId,
        accessToken,
      ),
      fetchChangedFiles(
        ciFailure.repository.fullName,
        ciFailure.commitSha,
        accessToken,
      ),
    ]);

    const diagnosis = await diagnoseCiFailureWithAI(
      logs,
      changedFiles,
      ciFailure.repository.fullName,
      ciFailure.workflowName,
      ciFailure.branch,
    );

    await prisma.ciFailure.update({
      where: { id: ciFailureId },
      data: {
        rootCause: diagnosis.rootCause,
        diagnosis: diagnosis.diagnosis,
        fixSummary: diagnosis.fixSummary,
        suggestedPatch:
          diagnosis.patches.length > 0
            ? JSON.stringify(diagnosis.patches)
            : null,
        analysisStatus: "diagnosed",
      },
    });
  } catch (err) {
    console.error("[analyzeCiFailureWithAI] error:", err);
    await prisma.ciFailure.update({
      where: { id: ciFailureId },
      data: { analysisStatus: "failed" },
    });
  }
}

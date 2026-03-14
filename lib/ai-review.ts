import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import prisma from "@/lib/prisma";

const ai = new GoogleGenAI({
  vertexai: true,
  project: process.env.GCP_PROJECT_ID!,
  location: process.env.GCP_REGION!,
});

type AISuggestion = {
  filePath: string;
  startLine: number;
  endLine: number;
  type: "bug" | "security" | "performance" | "style" | "refactor";
  severity: "critical" | "major" | "minor";
  comment: string;
  originalCode: string;
  suggestedCode: string;
};

const fetchDiff = async (
  accessToken: string,
  repoFullName: string,
  prNumber: number,
): Promise<string> => {
  const { data } = await axios.get<string>(
    `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`,
    {
      headers: {
        authorization: `token ${accessToken}`,
        accept: "application/vnd.github.v3.diff",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      maxContentLength: 500000,
    },
  );

  return data;
};

const getAccessToken = async (userId: string): Promise<string | null> => {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  return account?.accessToken || null;
};

const reviewDiffWithAI = async (
  diff: string,
  repoFullName: string,
  prTitle: string,
): Promise<AISuggestion[]> => {
  const prompt = `You are an expert code reviewer. Analyze the git diff below and return a JSON array of specific, actionable suggestions.

Repository: ${repoFullName}
PR Title: ${prTitle}

Rules:
- Return ONLY a valid JSON array with no markdown fences, no explanation outside the array
- Each suggestion must reference exact code from the diff
- Focus on real issues: bugs, security vulnerabilities, performance problems, meaningful refactors
- Ignore pure formatting or whitespace-only changes
- Maximum 10 suggestions

Each object in the array must have exactly these fields:
{
  "filePath": "path/to/file.ts",
  "startLine": <number>,
  "endLine": <number>,
  "type": "bug" | "security" | "performance" | "style" | "refactor",
  "severity": "critical" | "major" | "minor",
  "comment": "Clear explanation of the issue and why the fix is better",
  "originalCode": "exact snippet from the diff",
  "suggestedCode": "the improved replacement"
}

Git Diff:
${diff.slice(0, 100_000)}`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      temperature: 0.2,
    },
  });

  const text = response.text ?? "";

  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed as AISuggestion[];
    } else {
      console.error("AI response is not an array:", parsed);
      return [];
    }
  } catch (err) {
    console.error(
      "[ai-review] Failed to parse Gemini response:",
      cleaned.slice(0, 500),
    );
    return [];
  }
};

export const analyzePullRequestWithAI = async (
  pullRequestId: string,
  userId: string,
): Promise<void> => {
  await prisma.pullRequest.update({
    where: { id: pullRequestId },
    data: { reviewStatus: "reviewing" },
  });

  try {
    const pr = await prisma.pullRequest.findUnique({
      where: { id: pullRequestId },
      include: {
        repository: true,
      },
    });

    if (!pr) {
      console.error("Pull request not found:", pullRequestId);
      return;
    }

    const accessToken = await getAccessToken(userId);
    if (!accessToken) throw new Error(`No GitHub token for user ${userId}`);

    console.log(
      `[ai-review] Fetching diff for PR #${pr.prNumber} — ${pr.repository.fullName}`,
    );
    const diff = await fetchDiff(
      accessToken,
      pr.repository.fullName,
      pr.prNumber,
    );

    if (!diff || diff.trim().length === 0) {
      console.log(`[ai-review] Empty diff, skipping`);
      await prisma.pullRequest.update({
        where: { id: pullRequestId },
        data: { reviewStatus: "reviewed", reviewedAt: new Date() },
      });
      return;
    }

    console.log(
      `[ai-review] Sending diff to Gemini 2.5 Flash (${diff.length} chars)`,
    );
    const suggestions = await reviewDiffWithAI(
      diff,
      pr.repository.fullName,
      pr.title,
    );
    console.log(`[ai-review] Got ${suggestions.length} suggestions`);

    await prisma.suggestion.deleteMany({ where: { pullRequestId } });

    if (suggestions.length > 0) {
      await prisma.suggestion.createMany({
        data: suggestions.map((s) => ({
          pullRequestId,
          filePath: s.filePath,
          startLine: s.startLine,
          endLine: s.endLine,
          type: s.type,
          severity: s.severity,
          comment: s.comment,
          originalCode: s.originalCode,
          suggestedCode: s.suggestedCode,
          status: "pending",
        })),
      });
    }

    await prisma.pullRequest.update({
      where: { id: pullRequestId },
      data: { reviewStatus: "reviewed", reviewedAt: new Date() },
    });

    console.log(`[ai-review] Review complete for PR ${pullRequestId}`);
  } catch (err) {
    console.error(`[ai-review] Review failed for PR ${pullRequestId}:`, err);
    await prisma.pullRequest.update({
      where: { id: pullRequestId },
      data: { reviewStatus: "failed" },
    });
  }
};

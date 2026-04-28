"use server";

import { analyzeCiFailureWithAI } from "@/lib/ai-ci-review";
import { applyAndCreatePR } from "@/lib/gh-apply";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const getCiFailures = async (
  repositoryId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return {
      success: false,
      error: "Unauthorized",
      failures: [],
      total: 0,
      page,
      limit,
    };

  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, userId: session.user.id },
    select: { id: true, fullName: true, htmlUrl: true, name: true },
  });

  if (!repo)
    return {
      success: false,
      error: "Repository not found",
      failures: [],
      total: 0,
      page,
      limit,
    };

  const total = await prisma.ciFailure.count({
    where: { repositoryId: repo.id },
  });
  const skip = (page - 1) * limit;

  const failures = await prisma.ciFailure.findMany({
    where: { repositoryId: repo.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      workflowName: true,
      branch: true,
      commitSha: true,
      conclusion: true,
      htmlUrl: true,
      rootCause: true,
      fixSummary: true,
      analysisStatus: true,
      appliedUrl: true,
      createdAt: true,
    },
    skip,
    take: limit,
  });

  return { success: true, repo, failures, total, page, limit };
};

export const getCiFailureById = async (ciFailureId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return { success: false, error: "Unauthorized", failure: null };

  const failure = await prisma.ciFailure.findFirst({
    where: {
      id: ciFailureId,
      repository: { userId: session.user.id },
    },
    include: {
      repository: {
        select: { fullName: true, name: true, htmlUrl: true, id: true },
      },
    },
  });

  if (!failure)
    return { success: false, error: "CI failure not found", failure: null };

  return { success: true, failure };
};

export const retriggerCiAnalysis = async (
  ciFailureId: string,
): Promise<{ success: boolean; error?: string }> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const failure = await prisma.ciFailure.findFirst({
    where: {
      id: ciFailureId,
      repository: { userId: session.user.id },
    },
    select: {
      id: true,
      analysisStatus: true,
      repository: { select: { userId: true } },
    },
  });

  if (!failure) return { success: false, error: "CI failure not found" };
  if (failure.analysisStatus === "analyzing")
    return { success: false, error: "Analysis already in progress" };

  await prisma.ciFailure.update({
    where: { id: ciFailureId },
    data: { analysisStatus: "pending" },
  });

  analyzeCiFailureWithAI(ciFailureId, failure.repository.userId).catch(
    (err) => {
      console.error("[retriggerCiAnalysis]", err);
    },
  );

  return { success: true };
};

export const applyCiPatch = async (
  ciFailureId: string,
): Promise<{
  success: boolean;
  prUrl?: string;
  prNumber?: number;
  error?: string;
}> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const failure = await prisma.ciFailure.findFirst({
    where: {
      id: ciFailureId,
      repository: { userId: session.user.id },
    },
    include: { repository: true },
  });

  if (!failure) return { success: false, error: "CI failure not found" };
  if (!failure.suggestedPatch)
    return { success: false, error: "No patch available to apply" };

  let patches: {
    filePath: string;
    originalCode: string;
    suggestedCode: string;
  }[];
  try {
    patches = JSON.parse(failure.suggestedPatch);
  } catch {
    return { success: false, error: "Invalid patch data" };
  }

  if (patches.length === 0)
    return { success: false, error: "No code patches to apply" };

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "github" },
    select: { accessToken: true },
  });

  if (!account?.accessToken)
    return {
      success: false,
      error: "GitHub token not found. Please re-authenticate.",
    };

  const result = await applyAndCreatePR(
    failure.repository.fullName,
    failure.repository.defaultBranch,
    Number(failure.workflowRunId),
    patches,
    account.accessToken,
  );

  if (!result.success) return result;

  await prisma.ciFailure.update({
    where: { id: ciFailureId },
    data: { appliedUrl: result.prUrl },
  });

  return { success: true, prUrl: result.prUrl, prNumber: result.prNumber };
};

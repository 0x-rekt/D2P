"use server";

import { analyzePullRequestWithAI } from "@/lib/ai-review";
import { auth } from "@/lib/auth";
import { applyAndCreatePR } from "@/lib/gh-apply";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

type ApplySuggestionResult =
  | { success: true; prUrl: string; prNumber: number }
  | { success: false; error: string };

export const getPullRequests = async (
  repositoryId: string,
  page: number = 1,
  limit: number = 10,
) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user)
    return {
      success: false,
      error: "Unauthorized",
      pulls: [],
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
      pulls: [],
      total: 0,
      page,
      limit,
    };

  const total = await prisma.pullRequest.count({
    where: { repositoryId: repo.id },
  });

  const skip = (page - 1) * limit;

  const pulls = await prisma.pullRequest.findMany({
    where: { repositoryId: repo.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      prNumber: true,
      title: true,
      state: true,
      reviewStatus: true,
      authorLogin: true,
      baseBranch: true,
      headBranch: true,
      prUrl: true,
      createdAt: true,
      reviewedAt: true,
      _count: { select: { suggestions: true } },
    },
    skip,
    take: limit,
  });

  return { success: true, repo, pulls, total, page, limit };
};

export const getPullRequestWithSuggestions = async (pullId: string) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user)
    return { success: false, error: "Unauthorized", pull: null };

  const pull = await prisma.pullRequest.findFirst({
    where: {
      id: pullId,
      repository: { userId: session.user.id },
    },
    include: {
      repository: {
        select: { fullName: true, name: true, htmlUrl: true },
      },
      suggestions: {
        orderBy: [{ filePath: "asc" }, { startLine: "asc" }],
      },
    },
  });

  if (!pull)
    return { success: false, error: "Pull request not found", pull: null };

  return { success: true, pull };
};

export const updateSuggestionStatus = async (
  suggestionId: string,
  status: "accepted" | "rejected",
) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const suggestion = await prisma.suggestion.findFirst({
    where: {
      id: suggestionId,
      pullRequest: { repository: { userId: session.user.id } },
    },
  });

  if (!suggestion) return { success: false, error: "Suggestion not found" };

  await prisma.suggestion.update({
    where: { id: suggestionId },
    data: { status },
  });

  return { success: true };
};

export const applyAcceptedSuggestions = async (
  pullRequestId: string,
): Promise<ApplySuggestionResult> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const pr = await prisma.pullRequest.findFirst({
    where: {
      id: pullRequestId,
      repository: { userId: session.user.id },
    },
    include: {
      repository: true,
      suggestions: {
        where: { status: "accepted" },
      },
    },
  });

  if (!pr) return { success: false, error: "Pull request not found" };

  if (pr.suggestions.length === 0) {
    return { success: false, error: "No accepted suggestions to apply." };
  }

  const account = await prisma.account.findFirst({
    where: { userId: session.user.id, providerId: "github" },
    select: { accessToken: true },
  });

  if (!account?.accessToken) {
    return {
      success: false,
      error: "GitHub token not found. Please re-authenticate.",
    };
  }

  const result = await applyAndCreatePR(
    pr.repository.fullName,
    pr.baseBranch,
    pr.prNumber,
    pr.suggestions.map((s) => ({
      filePath: s.filePath,
      originalCode: s.originalCode,
      suggestedCode: s.suggestedCode,
    })),
    account.accessToken,
  );

  if (!result.success) return result;

  try {
    await prisma.pullRequest.update({
      where: { id: pullRequestId },
      data: { appliedPrUrl: result.prUrl },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    if (!message.includes("Unknown argument `appliedPrUrl`")) {
      throw error;
    }

    console.warn(
      "Skipping appliedPrUrl persistence because generated Prisma client is stale.",
      { pullRequestId },
    );
  }

  return { success: true, prUrl: result.prUrl, prNumber: result.prNumber };
};

export const retriggerReview = async (
  pullRequestId: string,
): Promise<{ success: boolean; error?: string }> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return { success: false, error: "Unauthorized" };

  const pr = await prisma.pullRequest.findFirst({
    where: {
      id: pullRequestId,
      repository: { userId: session.user.id },
    },
    select: {
      id: true,
      reviewStatus: true,
      repository: { select: { userId: true } },
    },
  });

  if (!pr) return { success: false, error: "Pull request not found" };

  if (pr.reviewStatus === "reviewing") {
    return { success: false, error: "Review already in progress" };
  }

  await prisma.pullRequest.update({
    where: { id: pullRequestId },
    data: { reviewStatus: "pending", reviewedAt: null },
  });

  analyzePullRequestWithAI(pullRequestId, pr.repository.userId).catch((err) => {
    console.error("[retriggerReview] error:", err);
  });

  return { success: true };
};

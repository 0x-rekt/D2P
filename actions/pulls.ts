import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

export const getPullRequests = async (repositoryId: string) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user)
    return { success: false, error: "Unauthorized", pulls: [] };

  const repo = await prisma.repository.findFirst({
    where: { id: repositoryId, userId: session.user.id },
    select: { id: true, fullName: true, htmlUrl: true, name: true },
  });

  if (!repo)
    return { success: false, error: "Repository not found", pulls: [] };

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
  });

  return { success: true, repo, pulls };
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

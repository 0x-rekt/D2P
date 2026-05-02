"use server";

import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const getSecurityFindings = async (repoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const findings = await prisma.securityFinding.findMany({
      where: {
        repositoryId: repoId,
        repository: {
          userId: session.user.id,
        },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
      include: {
        pullRequest: {
          select: {
            id: true,
            prNumber: true,
            title: true,
          },
        },
      },
    });

    return findings;
  } catch (error) {
    console.error("Error fetching security findings:", error);
    throw error;
  }
};

export const getSecurityFindingsForPR = async (
  repoId: string,
  prNumber: number,
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const findings = await prisma.securityFinding.findMany({
      where: {
        repositoryId: repoId,
        prNumber,
        repository: {
          userId: session.user.id,
        },
      },
      orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
    });

    return findings;
  } catch (error) {
    console.error("Error fetching PR security findings:", error);
    throw error;
  }
};

export const updateSecurityFindingStatus = async (
  findingId: string,
  status: "open" | "fixed" | "ignored" | "false_positive",
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const finding = await prisma.securityFinding.findUnique({
      where: { id: findingId },
      include: {
        repository: {
          select: { userId: true },
        },
      },
    });

    if (!finding || finding.repository.userId !== session.user.id) {
      throw new Error("Not found or unauthorized");
    }

    const updated = await prisma.securityFinding.update({
      where: { id: findingId },
      data: { status },
    });

    return updated;
  } catch (error) {
    console.error("Error updating security finding status:", error);
    throw error;
  }
};

export const getRepositorySecurityTrend = async (repoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify user owns the repository
    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      throw new Error("Repository not found");
    }

    const scores = await prisma.repositorySecurityScore.findMany({
      where: { repositoryId: repoId },
      orderBy: { scoredAt: "desc" },
      take: 30,
    });

    return scores.reverse();
  } catch (error) {
    console.error("Error fetching security trends:", error);
    throw error;
  }
};

export const getCurrentSecurityScore = async (repoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    // Verify user owns the repository
    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      throw new Error("Repository not found");
    }

    const score = await prisma.repositorySecurityScore.findFirst({
      where: { repositoryId: repoId },
      orderBy: { scoredAt: "desc" },
    });

    return score;
  } catch (error) {
    console.error("Error fetching current security score:", error);
    throw error;
  }
};

export const getSecurityFindingsSummary = async (repoId: string) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      throw new Error("Repository not found");
    }

    const openFindings = await prisma.securityFinding.groupBy({
      by: ["findingType", "severity"],
      where: {
        repositoryId: repoId,
        status: "open",
      },
      _count: true,
    });

    const summary = {
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
      byFix: {
        fixable: 0,
        requiresReview: 0,
      },
    };

    for (const group of openFindings) {
      summary.byType[group.findingType] =
        (summary.byType[group.findingType] || 0) + group._count;

      summary.bySeverity[group.severity] =
        (summary.bySeverity[group.severity] || 0) + group._count;
    }

    const fixableCount = await prisma.securityFinding.count({
      where: {
        repositoryId: repoId,
        status: "open",
        fixable: true,
      },
    });

    const nonFixableCount =
      openFindings.reduce((acc, group) => acc + group._count, 0) - fixableCount;

    summary.byFix.fixable = fixableCount;
    summary.byFix.requiresReview = nonFixableCount;

    return summary;
  } catch (error) {
    console.error("Error fetching security findings summary:", error);
    throw error;
  }
};

export const markFixableSecurityFindingsAsFixed = async (
  repoId: string,
  fixType: "secret_rotation" | "dependency_upgrade",
) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      throw new Error("Unauthorized");
    }

    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      throw new Error("Repository not found");
    }

    const updated = await prisma.securityFinding.updateMany({
      where: {
        repositoryId: repoId,
        fixType,
        status: "open",
      },
      data: { status: "fixed" },
    });

    return updated;
  } catch (error) {
    console.error("Error marking findings as fixed:", error);
    throw error;
  }
};

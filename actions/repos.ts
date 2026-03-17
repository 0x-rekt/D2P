"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import axios from "axios";
import { randomBytes } from "crypto";

type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  language: string | null;
  updated_at: string;
  default_branch: string;
};

type RepositoryWithConnection = GithubRepo & {
  isConnected: boolean;
  connectedRepoId: string | null;
};

type GetRepositoriesResponse = {
  success: boolean;
  repositories?: RepositoryWithConnection[];
  error?: string;
  count?: number;
  total?: number;
  page?: number;
  limit?: number;
};

type ConnectRepositoryResponse = {
  success: boolean;
  error?: string;
};

type CheckRepositoryConnectionResponse = {
  success: boolean;
  isConnected: boolean;
  error?: string;
};

export const getRepositories = async (
  page: number = 1,
  limit: number = 12,
): Promise<GetRepositoriesResponse> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  const user = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  if (!user || !user.accessToken)
    return { success: false, error: "Unauthorized" };

  try {
    const response = await axios.get<any[]>(
      "https://api.github.com/user/repos?sort=updated&direction=desc&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.data) {
      if (response.status === 401) {
        return { success: false, error: "Unauthorized" };
      }
      return { success: false, error: "Failed to fetch repositories" };
    }

    const filteredRepos: GithubRepo[] = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      full_name: repo.full_name,
      description: repo.description,
      private: repo.private,
      html_url: repo.html_url,
      language: repo.language,
      updated_at: repo.updated_at,
      default_branch: repo.default_branch,
    }));

    const connectedRepos = await prisma.repository.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        repoGithubId: true,
      },
    });

    const connectedRepoIds = new Map(
      connectedRepos.map((repo) => [repo.repoGithubId, repo.id]),
    );

    const repositoriesWithStatus: RepositoryWithConnection[] =
      filteredRepos.map((repo) => ({
        ...repo,
        isConnected: connectedRepoIds.has(repo.id),
        connectedRepoId: connectedRepoIds.get(repo.id) ?? null,
      }));

    const total = repositoriesWithStatus.length;
    const skip = (page - 1) * limit;
    const paginatedRepos = repositoriesWithStatus.slice(skip, skip + limit);

    return {
      success: true,
      repositories: paginatedRepos,
      count: paginatedRepos.length,
      total,
      page,
      limit,
    };
  } catch (error) {
    return { success: false, error: "Failed to fetch repositories" };
  }
};

export const connectRepository = async (
  repoId: number,
): Promise<ConnectRepositoryResponse> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  const user = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  if (!user || !user.accessToken)
    return { success: false, error: "Unauthorized" };

  const existing = await prisma.repository.findFirst({
    where: {
      repoGithubId: repoId,
      userId: session.user.id,
    },
  });

  if (existing) {
    return { success: false, error: "Repository already connected" };
  }

  try {
    const response = await axios.get(
      `https://api.github.com/repositories/${repoId}`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    );

    if (!response.data) {
      if (response.status === 401) {
        return { success: false, error: "Unauthorized" };
      }
      return { success: false, error: "Failed to fetch repository details" };
    }

    const repoData: GithubRepo = response.data;
    const [owner, repo] = repoData.full_name.split("/");

    const webhookSecret = randomBytes(32).toString("hex");
    const webhookUrl = `${process.env.WEBHOOK_BASE_URL}/api/webhooks/github`;

    let webhhookId: number | null = null;

    try {
      const { data: webhook } = await axios.post(
        `https://api.github.com/repos/${owner}/${repo}/hooks`,
        {
          name: "web",
          active: true,
          events: ["pull_request"],
          config: {
            url: webhookUrl,
            content_type: "json",
            secret: webhookSecret,
            insecure_ssl: "0",
          },
        },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      webhhookId = webhook.id;
    } catch (error) {
      return { success: false, error: "Failed to create webhook" };
    }

    await prisma.repository.create({
      data: {
        repoGithubId: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        private: repoData.private,
        htmlUrl: repoData.html_url,
        userId: session.user.id,
        webhookId: webhhookId,
        webhookSecret,
      },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to connect repository" };
  }
};

export const checkRepositoryConnection = async (
  repoId: number,
): Promise<CheckRepositoryConnectionResponse> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return { success: false, isConnected: false, error: "Unauthorized" };
  }

  try {
    const repository = await prisma.repository.findFirst({
      where: {
        repoGithubId: repoId,
        userId: session.user.id,
      },
    });

    return {
      success: true,
      isConnected: !!repository,
    };
  } catch (error) {
    return {
      success: false,
      isConnected: false,
      error: "Failed to check repository connection",
    };
  }
};

export const disconnectRepository = async (
  repoId: number,
): Promise<ConnectRepositoryResponse> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return { success: false, error: "Unauthorized" };

  const user = await prisma.account.findFirst({
    where: {
      userId: session.user.id,
      providerId: "github",
    },
    select: {
      accessToken: true,
    },
  });

  if (!user || !user.accessToken)
    return { success: false, error: "Unauthorized" };

  const repo = await prisma.repository.findFirst({
    where: {
      repoGithubId: repoId,
      userId: session.user.id,
    },
  });

  if (!repo) return { success: false, error: "Repository not found" };

  if (repo.webhookId) {
    const [owner, repoName] = repo.fullName.split("/");

    await axios
      .delete(
        `https://api.github.com/repos/${owner}/${repoName}/hooks/${repo.webhookId}`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      )
      .catch((err) => {
        console.log(`Failed to delete webhook: ${err}`);
      });
  }

  await prisma.repository.delete({
    where: {
      id: repo.id,
    },
  });

  return { success: true };
};

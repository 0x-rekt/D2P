"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import axios from "axios";

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

type GetRepositoriesResponse = {
  success: boolean;
  repositories?: GithubRepo[];
  error?: string;
  count?: number;
};

type ConnectRepositoryResponse = {
  success: boolean;
  error?: string;
};

export const getRepositories = async (): Promise<GetRepositoriesResponse> => {
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
      "https://api.github.com/user/repos",
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

    return {
      success: true,
      repositories: filteredRepos,
      count: filteredRepos.length,
    };
  } catch (error) {
    console.log(error);
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

    const repoData = response.data;

    await prisma.repository.create({
      data: {
        repoGithubId: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        private: repoData.private,
        htmlUrl: repoData.html_url,
        userId: session.user.id,
      },
    });

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false, error: "Failed to connect repository" };
  }
};

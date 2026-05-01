import prisma from "@/lib/prisma";

/**
 * Get GitHub access token for a user
 */
export const getGitHubAccessToken = async (
  userId: string,
): Promise<string | null> => {
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

/**
 * Refresh GitHub access token if needed
 */
export const refreshGitHubAccessToken = async (
  userId: string,
): Promise<string | null> => {
  const account = await prisma.account.findFirst({
    where: {
      userId,
      providerId: "github",
    },
  });

  if (!account || !account.accessToken) {
    return null;
  }

  // GitHub personal access tokens don't expire, so just return the existing one
  // If using OAuth apps with refresh tokens, handle refresh logic here
  return account.accessToken;
};

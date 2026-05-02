import prisma from "@/lib/prisma";

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
  return account.accessToken;
};

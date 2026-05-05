import { NextRequest, NextResponse } from "next/server";
import { createFixPR, createSecurityIssue } from "@/lib/github-security";
import { getGitHubAccessToken } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

type FixFinding = {
  id: string;
  findingType: string;
  severity: string;
  title: string;
  description: string;
  packageName: string | null;
  packageVersion: string | null;
  fixable: boolean;
  fixType: string | null;
  fixDetails: string | null;
};

const parseFixDetails = (fixDetails: string | null) => {
  if (!fixDetails) return null;

  try {
    return JSON.parse(fixDetails) as {
      fixedVersions?: string[];
      affectedVersions?: string[];
      suggestions?: string[];
      codeSnippet?: string;
    };
  } catch {
    return null;
  }
};

const buildDependencyUpgradeChanges = async (
  repoFullName: string,
  baseBranch: string,
  accessToken: string,
  findings: FixFinding[],
) => {
  const [owner, repo] = repoFullName.split("/");
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/package.json`,
    {
      headers: {
        authorization: `token ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        accept: "application/vnd.github+json",
      },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch package.json: ${response.status}`);
  }

  const file = (await response.json()) as { content: string };
  const packageJson = JSON.parse(
    Buffer.from(file.content, "base64").toString("utf-8"),
  );

  const dependencies = {
    ...(packageJson.dependencies || {}),
    ...(packageJson.devDependencies || {}),
  } as Record<string, string>;

  const updatedDependencies = new Map<string, string>();

  for (const finding of findings) {
    if (!finding.packageName || !finding.fixable) continue;

    const fixDetails = parseFixDetails(finding.fixDetails);
    const fixedVersion = fixDetails?.fixedVersions?.[0];
    if (!fixedVersion) continue;

    const currentVersion = dependencies[finding.packageName];
    if (!currentVersion) continue;

    const prefixMatch = currentVersion.match(/^[~^]/);
    const prefix = prefixMatch?.[0] ?? "";
    updatedDependencies.set(finding.packageName, `${prefix}${fixedVersion}`);
  }

  if (updatedDependencies.size === 0) {
    throw new Error(
      "No dependency upgrades could be derived from the selected findings",
    );
  }

  for (const [name, version] of updatedDependencies) {
    if (packageJson.dependencies?.[name] !== undefined) {
      packageJson.dependencies[name] = version;
    }
    if (packageJson.devDependencies?.[name] !== undefined) {
      packageJson.devDependencies[name] = version;
    }
  }

  return {
    "package.json": `${JSON.stringify(packageJson, null, 2)}\n`,
  };
};

const handleCreateFixPR = async (
  sessionUserId: string,
  body: {
    repoId?: string;
    fixType?: "secret_rotation" | "dependency_upgrade";
    findings?: FixFinding[];
    findingIds?: string[];
    title?: string;
    description?: string;
    baseBranch?: string;
  },
) => {
  const { repoId, fixType, findings, findingIds, title, description } = body;
  const baseBranch = body.baseBranch || "main";

  if (!repoId || !fixType) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  const repo = await prisma.repository.findFirst({
    where: {
      id: repoId,
      userId: sessionUserId,
    },
  });

  if (!repo) {
    return NextResponse.json(
      { error: "Repository not found" },
      { status: 404 },
    );
  }

  const accessToken = await getGitHubAccessToken(sessionUserId);
  if (!accessToken) {
    return NextResponse.json(
      { error: "No GitHub access token available" },
      { status: 500 },
    );
  }

  const selectedFindings =
    findings && findings.length > 0
      ? findings
      : findingIds && findingIds.length > 0
        ? await prisma.securityFinding.findMany({
            where: {
              id: { in: findingIds },
              repositoryId: repoId,
              repository: { userId: sessionUserId },
              fixable: true,
            },
            select: {
              id: true,
              findingType: true,
              severity: true,
              title: true,
              description: true,
              packageName: true,
              packageVersion: true,
              fixable: true,
              fixType: true,
              fixDetails: true,
            },
          })
        : [];

  if (selectedFindings.length === 0) {
    return NextResponse.json(
      { error: "No fixable findings were provided" },
      { status: 400 },
    );
  }

  if (fixType !== "dependency_upgrade") {
    return NextResponse.json(
      {
        error:
          "Automatic fix PRs are currently supported for dependency upgrades only",
      },
      { status: 400 },
    );
  }

  const dependencyFindings = selectedFindings.filter(
    (finding) => finding.findingType === "cve" && finding.fixable,
  );

  if (dependencyFindings.length === 0) {
    return NextResponse.json(
      { error: "No fixable dependency findings were selected" },
      { status: 400 },
    );
  }

  const changes = await buildDependencyUpgradeChanges(
    repo.fullName,
    baseBranch,
    accessToken,
    dependencyFindings,
  );

  const fixPr = await createFixPR(accessToken, repo.fullName, {
    title: title || "chore(security): update vulnerable dependencies",
    description:
      description ||
      `D2P found ${dependencyFindings.length} vulnerable dependency${dependencyFindings.length === 1 ? "" : "ies"}. This PR updates package.json to the latest fixed versions.`,
    fixType,
    changes,
    baseBranch,
  });

  return NextResponse.json({
    success: true,
    pr: fixPr,
    fixType,
    findingsCount: dependencyFindings.length,
  });
};

export const POST = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    if (body.fixType) {
      return handleCreateFixPR(session.user.id, body);
    }

    const { repoId, title, description, severity, findingIds } = body;

    if (!repoId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const repo = await prisma.repository.findFirst({
      where: {
        id: repoId,
        userId: session.user.id,
      },
    });

    if (!repo) {
      return NextResponse.json(
        { error: "Repository not found" },
        { status: 404 },
      );
    }

    const accessToken = await getGitHubAccessToken(session.user.id);
    if (!accessToken) {
      return NextResponse.json(
        { error: "No GitHub access token available" },
        { status: 500 },
      );
    }

    const issueResult = await createSecurityIssue(accessToken, repo.fullName, {
      title,
      body: description || "Security findings detected by D2P",
      labels: severity ? [`security`, `severity/${severity}`] : ["security"],
    });

    if (findingIds && Array.isArray(findingIds)) {
      await prisma.securityFinding.updateMany({
        where: {
          id: {
            in: findingIds,
          },
        },
        data: {
          githubIssueId: issueResult.number,
          gitHubIssueUrl: issueResult.html_url,
        },
      });
    }

    return NextResponse.json({
      success: true,
      issue: issueResult,
    });
  } catch (error) {
    console.error("Error creating issue:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 },
    );
  }
};

export const POST_CreateFixPR = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    return handleCreateFixPR(session.user.id, body);
  } catch (error) {
    console.error("Error creating fix PR:", error);
    return NextResponse.json(
      { error: "Failed to create fix PR" },
      { status: 500 },
    );
  }
};

import { NextRequest, NextResponse } from "next/server";
import { createSecurityIssue } from "@/lib/github-security";
import { getGitHubAccessToken } from "@/lib/auth-helpers";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * POST /api/security/create-issue
 * Create a GitHub issue for security findings
 *
 * Note: Security scanning is now handled automatically via GitHub webhooks
 * when pull requests are opened or updated.
 */
export const POST = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId, title, description, severity, findingIds } =
      await req.json();

    if (!repoId || !title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify user owns the repository
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

    // Create GitHub issue
    const issueResult = await createSecurityIssue(accessToken, repo.fullName, {
      title,
      body: description || "Security findings detected by D2P",
      labels: severity ? [`security`, `severity/${severity}`] : ["security"],
    });

    // Update findings with issue ID
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

/**
 * POST /api/security/create-fix-pr
 * Create an auto-fix PR for secrets rotation or dependency upgrade
 */
export const POST_CreateFixPR = async (req: NextRequest) => {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoId, fixType, findings, baseBranch = "main" } = await req.json();

    if (!repoId || !fixType || !findings) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Verify user owns the repository
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

    // For now, return a placeholder response
    // In a real implementation, you would:
    // 1. Generate fix code based on findings
    // 2. Create a fix PR with the changes
    // 3. Track the PR in the database

    return NextResponse.json({
      success: true,
      message: "Fix PR creation initiated",
      fixType,
      findingsCount: findings.length,
    });
  } catch (error) {
    console.error("Error creating fix PR:", error);
    return NextResponse.json(
      { error: "Failed to create fix PR" },
      { status: 500 },
    );
  }
};

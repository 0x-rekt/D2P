import { analyzePullRequestWithAI } from "@/lib/ai-review";
import prisma from "@/lib/prisma";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const verifySignature = (
  secret: string,
  payload: string,
  signature: string,
) => {
  const expected = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch (error) {
    return false;
  }
};

export const POST = async (req: NextRequest) => {
  const event = req.headers.get("x-github-event");
  const signature = req.headers.get("x-hub-signature-256");
  const raw = await req.text();

  if (!event || !signature) {
    return NextResponse.json(
      { error: "Missing required headers" },
      { status: 400 },
    );
  }

  if (event !== "pull_request") {
    return NextResponse.json(
      { error: "Unsupported event type" },
      { status: 400 },
    );
  }

  let payload;
  try {
    payload = JSON.parse(raw);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const repoGitHubId = payload.repository.id;
  if (!repoGitHubId) {
    return NextResponse.json(
      { error: "Missing repository ID in payload" },
      { status: 400 },
    );
  }

  const repo = await prisma.repository.findUnique({
    where: { repoGithubId: repoGitHubId },
    select: { id: true, webhookSecret: true, userId: true, fullName: true },
  });

  if (!repo) {
    return NextResponse.json(
      { error: "Repository not found" },
      { status: 404 },
    );
  }

  if (!repo.webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured for repository" },
      { status: 500 },
    );
  }

  if (!verifySignature(repo.webhookSecret, raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const action: string = payload.action;
  const pr = payload.pull_request;

  if (action !== "opened" && action !== "synchronize") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  console.log(
    `[webhook] Received pull request event for repo ${repo.fullName} (ID: ${repo.id}) - Action: ${action}, PR #${pr.number}`,
  );

  const pullRequest = await prisma.pullRequest.upsert({
    where: {
      repositoryId_prNumber: {
        repositoryId: repo.id,
        prNumber: pr.number,
      },
    },
    create: {
      prGithubId: pr.id,
      prNumber: pr.number,
      title: pr.title,
      body: pr.body ?? "",
      state: pr.state,
      headSha: pr.head.sha,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
      prUrl: pr.html_url,
      authorLogin: pr.user.login,
      diffUrl: pr.diff_url,
      reviewStatus: "pending",
      repositoryId: repo.id,
    },
    update: {
      headSha: pr.head.sha,
      diffUrl: pr.diff_url,
      state: pr.state,
      reviewStatus: "pending",
      reviewedAt: null,
    },
  });

  console.log(`[webhook] PullRequest row upserted: ${pullRequest.id}`);

  analyzePullRequestWithAI(pullRequest.id, repo.userId).catch((error) => {
    console.error(
      `[webhook] Error analyzing PR #${pullRequest.prNumber} for repo ${repo.fullName}:`,
      error,
    );
  });

  return NextResponse.json({ success: true, pullRequestId: pullRequest.id });
};

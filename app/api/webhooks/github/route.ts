import { analyzePullRequestWithAI } from "@/lib/ai-review";
import { runSecurityScan } from "@/lib/security-scanner";
import {
  createCommitStatus,
  postSecurityComment,
  requestChangesOnPR,
  formatSecurityFindingsForGitHub,
  generateSeverityLabels,
} from "@/lib/github-security";
import { getGitHubAccessToken } from "@/lib/auth-helpers";
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

  if (!pr) {
    return NextResponse.json(
      { error: "Missing pull request data in payload" },
      { status: 400 },
    );
  }

  if (action === "closed") {
    const newState = pr.merged ? "merged" : "closed";

    await prisma.pullRequest.updateMany({
      where: { repositoryId: repo.id, prNumber: pr.number },
      data: { state: newState },
    });

    return NextResponse.json({ success: true, message: "Pull request closed" });
  }

  if (action !== "opened" && action !== "synchronize") {
    return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
  }

  if (pr.head.ref.startsWith("d2p/")) {
    try {
      const accessToken = await getGitHubAccessToken(repo.userId);
      if (accessToken) {
        await createCommitStatus(accessToken, repo.fullName, {
          name: "D2P Security Scan",
          headSha: pr.head.sha,
          status: "completed",
          conclusion: "success",
          title: "D2P Fix PR - Auto Passed",
          summary:
            "This PR applies D2P AI suggestions and is exempt from security scanning",
          details:
            "D2P-generated PRs apply reviewed fixes and do not require additional scanning.",
          prNumber: pr.number,
        }).catch((error) => {
          console.error("Error creating commit status for D2P PR:", error);
        });
      }
    } catch (error) {
      console.error("Error processing D2P PR:", error);
    }
    return NextResponse.json({ success: true, message: "D2P PR processed" });
  }

  let shouldResetReview = true;
  if (action === "synchronize") {
    const existingPr = await prisma.pullRequest.findUnique({
      where: {
        repositoryId_prNumber: {
          repositoryId: repo.id,
          prNumber: pr.number,
        },
      },
      select: { id: true },
    });

    if (existingPr) {
      const acceptedCount = await prisma.suggestion.count({
        where: {
          pullRequestId: existingPr.id,
          status: "accepted",
        },
      });
      if (acceptedCount > 0) {
        shouldResetReview = false;
      }
    }
  }

  const pullRequest = await prisma.pullRequest.upsert({
    where: {
      repositoryId_prNumber: {
        repositoryId: repo.id,
        prNumber: pr.number,
      },
    },
    create: {
      prGithubId: BigInt(pr.id),
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
      ...(shouldResetReview
        ? { reviewStatus: "pending", reviewedAt: null }
        : {}),
    },
  });

  (async () => {
    try {
      await analyzePullRequestWithAI(pullRequest.id, repo.userId).catch(
        (error) => {
          console.error("Error analyzing pull request:", error);
        },
      );
    } catch (error) {
      console.error("Unexpected error in analyzePullRequestWithAI:", error);
    }
  })();

  (async () => {
    try {
      const accessToken = await getGitHubAccessToken(repo.userId);
      if (accessToken) {
        const securityResult = await runSecurityScan(
          repo.id,
          pr.number,
          accessToken,
          repo.fullName,
        );

        if (securityResult.shouldBlockMerge) {
          const findingsBody = formatSecurityFindingsForGitHub({
            critical: securityResult.criticalFindings,
            high: securityResult.highFindings,
            medium: securityResult.mediumFindings,
            low: securityResult.lowFindings,
            details: securityResult.findings,
          });

          await requestChangesOnPR(
            accessToken,
            repo.fullName,
            pr.number,
            pr.head.sha,
            findingsBody,
          ).catch((error) => {
            console.error("Error requesting changes:", error);
          });

          await createCommitStatus(accessToken, repo.fullName, {
            name: "D2P Security Scan",
            headSha: pr.head.sha,
            status: "completed",
            conclusion: "failure",
            title: "Security Findings Detected",
            summary: `Found ${securityResult.criticalFindings} critical, ${securityResult.highFindings} high, ${securityResult.mediumFindings} medium findings`,
            details: findingsBody,
            prNumber: pr.number,
          }).catch((error) => {
            console.error("Error creating commit status:", error);
          });

          await postSecurityComment(
            accessToken,
            repo.fullName,
            pr.number,
            findingsBody,
          ).catch((error) => {
            console.error("Error posting security comment:", error);
          });
        } else {
          // Report success status when no critical findings
          await createCommitStatus(accessToken, repo.fullName, {
            name: "D2P Security Scan",
            headSha: pr.head.sha,
            status: "completed",
            conclusion: "success",
            title: "Security Scan Passed",
            summary: `Scan complete: ${securityResult.criticalFindings} critical, ${securityResult.highFindings} high, ${securityResult.mediumFindings} medium findings`,
            details: "Security scan completed successfully",
            prNumber: pr.number,
          }).catch((error) => {
            console.error("Error creating success commit status:", error);
          });
        }
      }
    } catch (error) {
      console.error("Error running security scan in background:", error);
    }
  })();

  return NextResponse.json({ success: true, pullRequestId: pullRequest.id });
};

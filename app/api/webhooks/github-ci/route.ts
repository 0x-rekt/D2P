import { analyzeCiFailureWithAI } from "@/lib/ai-ci-review";
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
  } catch {
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

  if (event !== "workflow_run") {
    return NextResponse.json(
      { error: "Unsupported event type" },
      { status: 400 },
    );
  }

  let payload: any;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  if (payload.action !== "completed") {
    return NextResponse.json(
      { message: "Ignored: not completed" },
      { status: 200 },
    );
  }

  const run = payload.workflow_run;
  if (!run) {
    return NextResponse.json(
      { error: "Missing workflow_run" },
      { status: 400 },
    );
  }

  const conclusion: string = run.conclusion ?? "";
  if (!["failure", "timed_out"].includes(conclusion)) {
    return NextResponse.json(
      { message: `Ignored: conclusion=${conclusion}` },
      { status: 200 },
    );
  }

  const repoGithubId: number = payload.repository?.id;
  if (!repoGithubId) {
    return NextResponse.json(
      { error: "Missing repository ID" },
      { status: 400 },
    );
  }

  const repo = await prisma.repository.findUnique({
    where: { repoGithubId },
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
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  if (!verifySignature(repo.webhookSecret, raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const ciFailure = await prisma.ciFailure.upsert({
    where: { workflowRunId: BigInt(run.id) },
    create: {
      workflowRunId: BigInt(run.id),
      workflowName: run.name ?? run.workflow_id?.toString() ?? "Unknown",
      branch: run.head_branch ?? "unknown",
      commitSha: run.head_sha ?? "",
      conclusion,
      logsUrl: run.logs_url ?? "",
      htmlUrl: run.html_url ?? "",
      analysisStatus: "pending",
      repositoryId: repo.id,
    },
    update: {
      conclusion,
      analysisStatus: "pending",
    },
  });

  analyzeCiFailureWithAI(ciFailure.id, repo.userId).catch((err) => {
    console.error("[ci-webhook] analysis error:", err);
  });

  return NextResponse.json({ success: true, ciFailureId: ciFailure.id });
};

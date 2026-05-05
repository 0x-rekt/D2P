import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ repoId: string }> },
) {
  const { repoId } = await params;
  const sinceParam = req.nextUrl.searchParams.get("since");
  const since = sinceParam ? new Date(sinceParam) : null;
  const sinceTime =
    since && !Number.isNaN(since.getTime()) ? since.getTime() : null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let isClosed = false;

      const closeController = () => {
        if (!isClosed) {
          isClosed = true;
          try {
            controller.close();
          } catch {

          }
        }
      };

      const send = (data: object) => {
        if (isClosed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          isClosed = true;
        }
      };

      const POLL_INTERVAL = 3000;
      const MAX_DURATION = 5 * 60 * 1000;
      const startTime = Date.now();

      const poll = async () => {
        if (isClosed) return;

        try {
          if (Date.now() - startTime > MAX_DURATION) {
            send({ status: "timeout" });
            closeController();
            return;
          }

          const latestScore = await prisma.repositorySecurityScore.findFirst({
            where: { repositoryId: repoId },
            orderBy: { scoredAt: "desc" },
            select: { scoredAt: true },
          });

          if (!latestScore) {
            send({ status: "scanning", scoredAt: null });
            if (!isClosed) {
              setTimeout(poll, POLL_INTERVAL);
            }
            return;
          }

          const latestTime = latestScore.scoredAt.getTime();
          const hasNewScore =
            sinceTime === null ? true : latestTime > sinceTime;

          send({
            status: hasNewScore ? "updated" : "scanning",
            scoredAt: latestScore.scoredAt.toISOString(),
          });

          if (hasNewScore) {
            closeController();
            return;
          }

          if (!isClosed) {
            setTimeout(poll, POLL_INTERVAL);
          }
        } catch {
          closeController();
        }
      };

      poll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

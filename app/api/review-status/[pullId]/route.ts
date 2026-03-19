import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ pullId: string }> },
) {
  const { pullId } = await params;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: object) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      const POLL_INTERVAL = 3000;
      const MAX_DURATION = 5 * 60 * 1000;
      const startTime = Date.now();

      const poll = async () => {
        try {
          if (Date.now() - startTime > MAX_DURATION) {
            send({ status: "timeout", suggestionCount: 0 });
            controller.close();
            return;
          }

          const pull = await prisma.pullRequest.findUnique({
            where: { id: pullId },
            select: {
              reviewStatus: true,
              _count: { select: { suggestions: true } },
            },
          });

          if (!pull) {
            send({ status: "not_found", suggestionCount: 0 });
            controller.close();
            return;
          }

          const data = {
            status: pull.reviewStatus,
            suggestionCount: pull._count.suggestions,
          };

          send(data);

          if (
            pull.reviewStatus === "reviewed" ||
            pull.reviewStatus === "failed"
          ) {
            controller.close();
            return;
          }

          setTimeout(poll, POLL_INTERVAL);
        } catch {
          controller.close();
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

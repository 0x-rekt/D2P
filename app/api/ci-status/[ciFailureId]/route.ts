import prisma from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ciFailureId: string }> },
) {
  const { ciFailureId } = await params;
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
            // Controller already closed or closing, ignore
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

          const failure = await prisma.ciFailure.findUnique({
            where: { id: ciFailureId },
            select: { analysisStatus: true },
          });

          if (!failure) {
            send({ status: "not_found" });
            closeController();
            return;
          }

          send({ status: failure.analysisStatus });

          if (
            failure.analysisStatus === "diagnosed" ||
            failure.analysisStatus === "failed"
          ) {
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

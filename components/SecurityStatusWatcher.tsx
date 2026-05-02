"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SecurityStatusWatcherProps = {
  repoId: string;
  initialScoredAt?: string | null;
};

export function SecurityStatusWatcher({
  repoId,
  initialScoredAt,
}: SecurityStatusWatcherProps) {
  const router = useRouter();

  useEffect(() => {
    const sinceQuery = initialScoredAt
      ? `?since=${encodeURIComponent(initialScoredAt)}`
      : "";
    const es = new EventSource(`/api/security-status/${repoId}${sinceQuery}`);

    es.onmessage = (event) => {
      try {
        const { status } = JSON.parse(event.data);

        if (
          status === "updated" ||
          status === "timeout" ||
          status === "not_found"
        ) {
          es.close();
          if (status === "updated") {
            router.refresh();
          }
        }
      } catch {
        // Ignore malformed SSE payloads.
      }
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [initialScoredAt, repoId, router]);

  return null;
}

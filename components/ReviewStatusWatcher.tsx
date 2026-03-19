"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function ReviewStatusWatcher({ pullId }: { pullId: string }) {
  const router = useRouter();

  useEffect(() => {
    const es = new EventSource(`/api/review-status/${pullId}`);

    es.onmessage = (event) => {
      try {
        const { status } = JSON.parse(event.data);

        if (status === "reviewed" || status === "failed") {
          es.close();
          router.refresh();
        }
      } catch {}
    };

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
  }, [pullId, router]);

  return null;
}

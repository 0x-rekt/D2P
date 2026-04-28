"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function CiStatusWatcher({ ciFailureId }: { ciFailureId: string }) {
  const router = useRouter();

  useEffect(() => {
    const es = new EventSource(`/api/ci-status/${ciFailureId}`);

    es.onmessage = (event) => {
      try {
        const { status } = JSON.parse(event.data);
        if (status === "diagnosed" || status === "failed") {
          es.close();
          router.refresh();
        }
      } catch {}
    };

    es.onerror = () => es.close();

    return () => es.close();
  }, [ciFailureId, router]);

  return null;
}

"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { retriggerReview } from "@/actions/pulls";

export function RetriggerButton({ pullRequestId }: { pullRequestId: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleRetrigger = () => {
    startTransition(async () => {
      const result = await retriggerReview(pullRequestId);
      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <Button
      onClick={handleRetrigger}
      disabled={isPending}
      className="gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60"
    >
      {isPending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          Triggering…
        </>
      ) : (
        <>
          <RefreshCw size={14} />
          Retry Review
        </>
      )}
    </Button>
  );
}

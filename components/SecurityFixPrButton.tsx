"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type SecurityFixPrButtonProps = {
  repoId: string;
  findingIds: string[];
};

export function SecurityFixPrButton({
  repoId,
  findingIds,
}: SecurityFixPrButtonProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId,
          fixType: "dependency_upgrade",
          findingIds,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create fix PR");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create fix PR");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 backdrop-blur-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-white">
            Auto-fix dependencies
          </h3>
          <p className="mt-1 text-xs text-blue-100/70">
            Create a draft PR for fixable vulnerable dependencies.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          disabled={isCreating || findingIds.length === 0}
          className="inline-flex items-center justify-center rounded-full border border-blue-400/30 bg-blue-500/20 px-4 py-2 text-xs font-semibold text-blue-100 transition-all hover:bg-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? "Creating..." : `Create Fix PR (${findingIds.length})`}
        </button>
      </div>

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}

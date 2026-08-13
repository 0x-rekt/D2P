"use client";

import { connectRepository, disconnectRepository } from "@/actions/repos";
import { useState, useTransition } from "react";
import { CheckCircle2, Loader2, Unplug, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConnectButtonProps {
  repoId: number;
  initialConnected: boolean;
}

const ConnectButton = ({ repoId, initialConnected }: ConnectButtonProps) => {
  const [connected, setConnected] = useState(initialConnected);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleConnect = async () => {
    setError(null);
    startTransition(async () => {
      const result = await connectRepository(repoId);
      if (result.success) {
        setConnected(true);
        router.refresh();
      } else setError(result.error || "Failed to connect repository");
    });
  };

  const handleDisconnect = () => {
    setError(null);
    startTransition(async () => {
      const result = await disconnectRepository(repoId);
      if (result.success) {
        setConnected(false);
        router.refresh();
      } else setError(result.error || "Failed to disconnect repository");
    });
  };

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            {/* Connected status pill */}
            <div
              className="flex flex-1 items-center gap-1.5 rounded-lg px-3 py-1.5"
              style={{
                border: "1px solid rgba(34,211,166,0.2)",
                backgroundColor: "rgba(34,211,166,0.08)",
              }}
            >
              <CheckCircle2 size={12} className="shrink-0" style={{ color: "#22D3A6" }} />
              <span className="text-xs font-semibold" style={{ color: "#22D3A6" }}>
                Connected
              </span>
            </div>
            {/* Disconnect icon button */}
            <button
              onClick={handleDisconnect}
              disabled={isPending}
              title="Disconnect"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg transition-all disabled:opacity-50 cursor-pointer"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                backgroundColor: "rgba(255,255,255,0.03)",
                color: "#8D8A9C",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(239,68,68,0.3)";
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(239,68,68,0.08)";
                (e.currentTarget as HTMLButtonElement).style.color = "#F87171";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor =
                  "rgba(255,255,255,0.07)";
                (e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "rgba(255,255,255,0.03)";
                (e.currentTarget as HTMLButtonElement).style.color = "#8D8A9C";
              }}
            >
              {isPending ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Unplug size={12} />
              )}
            </button>
          </>
        ) : (
          <button
            onClick={handleConnect}
            disabled={isPending}
            className="btn-gradient-teal flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Zap size={12} />
                Connect
              </>
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] leading-snug" style={{ color: "#F87171" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default ConnectButton;

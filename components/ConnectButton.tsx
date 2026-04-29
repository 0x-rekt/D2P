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
            <div className="flex flex-1 items-center gap-1.5 rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-1.5">
              <CheckCircle2 size={12} className="shrink-0 text-green-400" />
              <span className="text-xs font-semibold text-green-400">Connected</span>
            </div>
            {/* Disconnect icon button */}
            <button
              onClick={handleDisconnect}
              disabled={isPending}
              title="Disconnect"
              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-gray-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all disabled:opacity-50 cursor-pointer"
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
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-3 py-1.5 text-xs font-semibold text-white hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-60 cursor-pointer shadow-lg shadow-blue-600/20"
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
        <p className="text-[11px] leading-snug text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ConnectButton;

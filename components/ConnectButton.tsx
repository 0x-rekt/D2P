"use client";

import { connectRepository } from "@/actions/repos";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Unplug, Zap } from "lucide-react";

interface ConnectButtonProps {
  repoId: number;
  initialConnected: boolean;
}

const ConnectButton = ({ repoId, initialConnected }: ConnectButtonProps) => {
  const [connected, setConnected] = useState(initialConnected);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleConnect = async () => {
    setError(null);
    startTransition(async () => {
      const result = await connectRepository(repoId);
      if (result.success) setConnected(true);
      else setError(result.error || "Failed to connect repository");
    });
  };

  const handleDisconnect = () => {
    setConnected(false);
  };

  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <div className="flex flex-1 items-center gap-1.5 rounded-md border border-green-500/20 bg-green-500/10 px-3 py-1.5">
              <CheckCircle2 size={13} className="shrink-0 text-green-400" />
              <span className="text-xs font-semibold text-green-400">
                Connected
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDisconnect}
              disabled={isPending}
              title="Disconnect"
              className="h-8 border border-white/10 px-2.5 text-gray-500 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
            >
              {isPending ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <Unplug size={13} />
              )}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            onClick={handleConnect}
            disabled={isPending}
            className="flex-1 bg-blue-600 font-semibold hover:bg-blue-700 disabled:opacity-60"
          >
            {isPending ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Connecting…
              </>
            ) : (
              <>
                <Zap size={13} />
                Connect
              </>
            )}
          </Button>
        )}
      </div>
      {error && (
        <p className="text-[11px] leading-snug text-red-400">{error}</p>
      )}
    </div>
  );
};

export default ConnectButton;

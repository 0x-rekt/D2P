"use client";

import Link from "next/link";
import {
  Activity,
  GitBranch,
  Clock,
  Zap,
  ExternalLink,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CiFailureCardProps {
  id: string;
  repoId: string;
  workflowName: string;
  branch: string;
  commitSha: string;
  createdAt: Date;
  rootCause: string | null;
  appliedUrl: string | null;
  conclusion: string;
  analysisStatus: string;
}

const analysisStatusConfig = {
  pending: {
    label: "Queued",
    icon: Clock,
    class: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  },
  analyzing: {
    label: "Analyzing",
    icon: Loader2,
    class: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    spin: true,
  },
  diagnosed: {
    label: "Diagnosed",
    icon: CheckCircle2,
    class: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    class: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

const conclusionConfig = {
  failure: {
    label: "Failed",
    class: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  timed_out: {
    label: "Timed Out",
    class: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  },
};

export function CiFailureCard({
  id,
  repoId,
  workflowName,
  branch,
  commitSha,
  createdAt,
  rootCause,
  appliedUrl,
  conclusion,
  analysisStatus,
}: CiFailureCardProps) {
  const statusCfg =
    analysisStatusConfig[analysisStatus as keyof typeof analysisStatusConfig] ??
    analysisStatusConfig.pending;
  const conclusionCfg =
    conclusionConfig[conclusion as keyof typeof conclusionConfig] ??
    conclusionConfig.failure;
  const StatusIcon = statusCfg.icon;

  return (
    <div className="group flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-3 sm:p-4 md:p-5 backdrop-blur-sm transition-all hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10 md:flex-row md:items-center md:gap-4">
      <Link
        href={`/dashboard/repos/${repoId}/ci/${id}`}
        className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3 md:gap-4"
      >
        <div className="mt-0.5 shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-1.5">
          <Activity size={16} className="text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-semibold text-white group-hover:text-red-400 transition-colors text-sm sm:text-base">
            {workflowName}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3">
            <span className="flex items-center gap-1 truncate">
              <GitBranch size={12} className="shrink-0" />
              <span className="truncate">{branch}</span>
            </span>
            <span className="font-mono text-gray-600 truncate">
              {commitSha.slice(0, 7)}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="shrink-0" />
              {createdAt.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
            {rootCause && (
              <span className="flex items-center gap-1 text-amber-400/80 max-w-50 truncate">
                <Zap size={12} className="shrink-0" />
                <span className="truncate">{rootCause}</span>
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="shrink-0 flex items-center gap-2 self-end md:self-center">
        <Badge variant="outline" className={`text-xs ${conclusionCfg.class}`}>
          {conclusionCfg.label}
        </Badge>
        <Badge
          variant="outline"
          className={`gap-1 text-xs md:gap-1.5 ${statusCfg.class}`}
        >
          <StatusIcon
            size={10}
            className={(statusCfg as any).spin ? "animate-spin" : ""}
          />
          <span className="hidden sm:inline">{statusCfg.label}</span>
        </Badge>
        {appliedUrl && (
          <a
            href={appliedUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-1 text-xs text-green-400 border border-green-500/30 bg-green-500/10 rounded px-2 py-0.5 hover:bg-green-500/20"
          >
            <ExternalLink size={10} />
            PR
          </a>
        )}
      </div>
    </div>
  );
}

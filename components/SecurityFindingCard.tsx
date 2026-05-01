"use client";

import Link from "next/link";
import {
  Shield,
  Lock,
  Package,
  AlertTriangle,
  ExternalLink,
  GitPullRequest,
  Calendar,
} from "lucide-react";

interface SecurityFindingCardProps {
  id: string;
  repoId: string;
  findingType: "secret" | "cve" | "owasp";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  cveId?: string;
  cvssScore?: number;
  status: "open" | "fixed" | "ignored" | "false_positive";
  createdAt: Date;
  pullRequestId?: string;
  pullRequest?: {
    prNumber: number;
    title: string;
  };
}

const severityConfig = {
  critical: {
    color: "border-red-500/30 bg-red-500/10 text-red-400",
    label: "Critical",
    emoji: "🔴",
  },
  high: {
    color: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    label: "High",
    emoji: "🟠",
  },
  medium: {
    color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    label: "Medium",
    emoji: "🟡",
  },
  low: {
    color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    label: "Low",
    emoji: "🟢",
  },
};

const findingTypeConfig = {
  secret: {
    label: "Hardcoded Secret",
    icon: Lock,
    color: "text-purple-400",
  },
  cve: {
    label: "Vulnerable Dependency",
    icon: Package,
    color: "text-green-400",
  },
  owasp: {
    label: "OWASP Vulnerability",
    icon: AlertTriangle,
    color: "text-yellow-400",
  },
};

const statusConfig = {
  open: {
    label: "Open",
    class: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  fixed: {
    label: "Fixed",
    class: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  ignored: {
    label: "Ignored",
    class: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  },
  false_positive: {
    label: "False Positive",
    class: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  },
};

export function SecurityFindingCard({
  id,
  repoId,
  findingType,
  severity,
  title,
  description,
  filePath,
  lineNumber,
  cveId,
  cvssScore,
  status,
  createdAt,
  pullRequest,
}: SecurityFindingCardProps) {
  const severityCfg = severityConfig[severity];
  const typeCfg = findingTypeConfig[findingType];
  const statusCfg = statusConfig[status];
  const TypeIcon = typeCfg.icon;

  return (
    <Link
      href={
        pullRequest
          ? `/dashboard/repos/${repoId}/pulls/${pullRequest.prNumber}`
          : "#"
      }
    >
      <div
        className={`group rounded-2xl border ${severityCfg.color} p-5 backdrop-blur-sm transition-all hover:border-opacity-100 hover:shadow-lg cursor-pointer`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {/* Header with type and severity */}
            <div className="flex items-center gap-2 mb-2">
              <TypeIcon size={16} className={typeCfg.color} />
              <span className="text-xs font-medium text-gray-400">
                {typeCfg.label}
              </span>
              <span className="text-sm">{severityCfg.emoji}</span>
              <span
                className={`text-xs font-semibold ${severityCfg.color.split(" ").pop()}`}
              >
                {severityCfg.label}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-sm font-semibold text-white mb-1 truncate">
              {title}
            </h3>

            {/* Description */}
            <p className="text-xs text-gray-300 mb-3 line-clamp-2">
              {description}
            </p>

            {/* Details row */}
            <div className="flex flex-wrap items-center gap-2">
              {filePath && (
                <code className="text-[10px] bg-black/30 px-2 py-1 rounded font-mono text-gray-400 truncate max-w-xs">
                  {filePath}
                  {lineNumber && `:${lineNumber}`}
                </code>
              )}

              {cveId && (
                <code className="text-[10px] bg-black/30 px-2 py-1 rounded font-mono text-red-400">
                  {cveId}
                </code>
              )}

              {cvssScore && (
                <span className="text-[10px] bg-black/30 px-2 py-1 rounded text-orange-400 font-semibold">
                  CVSS {cvssScore.toFixed(1)}
                </span>
              )}

              {pullRequest && (
                <div className="flex items-center gap-1 text-[10px] bg-black/30 px-2 py-1 rounded text-blue-400">
                  <GitPullRequest size={10} />
                  PR #{pullRequest.prNumber}
                </div>
              )}

              <div className="flex items-center gap-1 text-[10px] bg-black/30 px-2 py-1 rounded text-gray-400 ml-auto">
                <Calendar size={10} />
                {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <div className="shrink-0">
            <div
              className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-[10px] font-semibold whitespace-nowrap ${statusCfg.class}`}
            >
              <Shield size={10} />
              {statusCfg.label}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

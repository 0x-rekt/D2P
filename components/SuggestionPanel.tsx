"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  AlertTriangle,
  Zap,
  Code2,
  RefreshCw,
  Shield,
} from "lucide-react";

type Suggestion = {
  id: string;
  filePath: string;
  startLine: number;
  endLine: number;
  type: string;
  severity: string;
  comment: string;
  originalCode: string;
  suggestedCode: string;
  status: string;
};

const typeConfig: Record<string, { icon: any; label: string; color: string }> =
  {
    bug: {
      icon: AlertTriangle,
      label: "Bug",
      color: "border-red-500/30 bg-red-500/10 text-red-400",
    },
    security: {
      icon: Shield,
      label: "Security",
      color: "border-orange-500/30 bg-orange-500/10 text-orange-400",
    },
    performance: {
      icon: Zap,
      label: "Performance",
      color: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    },
    style: {
      icon: Code2,
      label: "Style",
      color: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    },
    refactor: {
      icon: RefreshCw,
      label: "Refactor",
      color: "border-purple-500/30 bg-purple-500/10 text-purple-400",
    },
  };

const severityConfig: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-300",
  major: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  minor: "border-gray-500/40 bg-gray-500/10 text-gray-400",
};

function SuggestionCard({ suggestion }: { suggestion: Suggestion }) {
  const [status, setStatus] = useState(suggestion.status);
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handle = (newStatus: "accepted" | "rejected") => {
    startTransition(async () => {
      // const result = await updateSuggestionStatus(suggestion.id, newStatus);
      // if (result.success) setStatus(newStatus);
    });
  };

  const type = typeConfig[suggestion.type] ?? typeConfig.refactor;
  const TypeIcon = type.icon;

  return (
    <div
      className={`rounded-xl border backdrop-blur-sm transition-all ${
        status === "accepted"
          ? "border-green-500/30 bg-green-500/5"
          : status === "rejected"
            ? "border-white/5 bg-white/2 opacity-60"
            : "border-white/10 bg-linear-to-b from-gray-900/50 to-black/50"
      }`}
    >
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <TypeIcon
            size={15}
            className={
              type.color.split(" ").find((c) => c.startsWith("text-")) ??
              "text-gray-400"
            }
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-[10px] ${type.color}`}>
                {type.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] ${severityConfig[suggestion.severity] ?? severityConfig.minor}`}
              >
                {suggestion.severity}
              </Badge>
              <span className="truncate text-xs font-mono text-gray-400">
                {suggestion.filePath}
                <span className="text-gray-600"> :{suggestion.startLine}</span>
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-300 line-clamp-1">
              {suggestion.comment}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 ml-3">
          {status === "accepted" && (
            <CheckCircle2 size={16} className="text-green-400" />
          )}
          {status === "rejected" && (
            <XCircle size={16} className="text-gray-500" />
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-4 pt-0 mt-0">
          <p className="mb-4 mt-4 text-sm leading-relaxed text-gray-300">
            {suggestion.comment}
          </p>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-red-400">
                Before
              </p>
              <pre className="overflow-x-auto no-scrollbar rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-xs leading-relaxed text-gray-300 font-mono">
                <code>{suggestion.originalCode}</code>
              </pre>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-green-400">
                After
              </p>
              <pre className="overflow-x-auto no-scrollbar rounded-lg border border-green-500/20 bg-green-500/5 p-3 text-xs leading-relaxed text-gray-300 font-mono">
                <code>{suggestion.suggestedCode}</code>
              </pre>
            </div>
          </div>

          {status === "pending" && (
            <div className="mt-4 flex gap-2">
              <Button
                size="sm"
                onClick={() => handle("accepted")}
                disabled={isPending}
                className="gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60"
              >
                <CheckCircle2 size={13} />
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handle("rejected")}
                disabled={isPending}
                className="gap-1.5 border border-white/10 text-gray-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
              >
                <XCircle size={13} />
                Reject
              </Button>
            </div>
          )}
          {status === "accepted" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-green-400">
              <CheckCircle2 size={12} /> Accepted
            </p>
          )}
          {status === "rejected" && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-500">
              <XCircle size={12} /> Rejected
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export function SuggestionPanel({
  suggestions,
}: {
  suggestions: Suggestion[];
}) {
  const [filter, setFilter] = useState<string>("all");

  const counts = {
    all: suggestions.length,
    pending: suggestions.filter((s) => s.status === "pending").length,
    accepted: suggestions.filter((s) => s.status === "accepted").length,
    rejected: suggestions.filter((s) => s.status === "rejected").length,
  };

  const filtered =
    filter === "all"
      ? suggestions
      : suggestions.filter((s) => s.status === filter);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-400" />
          <span className="font-semibold text-white">
            {suggestions.length} AI Suggestion
            {suggestions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="flex gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
          {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors ${
                filter === f
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
            No {filter} suggestions.
          </p>
        ) : (
          filtered.map((s) => <SuggestionCard key={s.id} suggestion={s} />)
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import {
  applyAcceptedSuggestions,
  updateSuggestionStatus,
} from "@/actions/pulls";
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
  GitPullRequest,
  Loader2,
  ExternalLink,
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

const typeConfig: Record<
  string,
  { icon: any; label: string; textColor: string; badgeClass: string }
> = {
  bug: {
    icon: AlertTriangle,
    label: "Bug",
    textColor: "text-red-400",
    badgeClass: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  security: {
    icon: Shield,
    label: "Security",
    textColor: "text-orange-400",
    badgeClass: "border-orange-500/30 bg-orange-500/10 text-orange-400",
  },
  performance: {
    icon: Zap,
    label: "Performance",
    textColor: "text-yellow-400",
    badgeClass: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
  },
  style: {
    icon: Code2,
    label: "Style",
    textColor: "text-violet-400",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  },
  refactor: {
    icon: RefreshCw,
    label: "Refactor",
    textColor: "text-purple-400",
    badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
};

const severityClass: Record<string, string> = {
  critical: "border-red-500/40 bg-red-500/10 text-red-300",
  major: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  minor: "border-white/10 bg-white/5 text-[#8D8A9C]",
};

function SuggestionCard({
  suggestion,
  onStatusChange,
}: {
  suggestion: Suggestion;
  onStatusChange: (id: string, status: "accepted" | "rejected") => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const [isPending, startTransition] = useTransition();

  const handle = (newStatus: "accepted" | "rejected") => {
    startTransition(async () => {
      const result = await updateSuggestionStatus(suggestion.id, newStatus);
      if (result.success) onStatusChange(suggestion.id, newStatus);
    });
  };

  const type = typeConfig[suggestion.type] ?? typeConfig.refactor;
  const TypeIcon = type.icon;
  const status = suggestion.status;

  return (
    <div
      className="rounded-xl backdrop-blur-sm transition-all"
      style={{
        border:
          status === "accepted"
            ? "1px solid rgba(34,211,166,0.3)"
            : status === "rejected"
            ? "1px solid rgba(255,255,255,0.04)"
            : "1px solid rgba(255,255,255,0.08)",
        backgroundColor:
          status === "accepted"
            ? "rgba(34,211,166,0.04)"
            : status === "rejected"
            ? "rgba(0,0,0,0.3)"
            : "#141220",
        opacity: status === "rejected" ? 0.6 : 1,
      }}
    >
      <div
        className="flex cursor-pointer flex-col items-start justify-between gap-2 p-3 sm:p-4 sm:flex-row sm:items-center"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
          <TypeIcon size={30} className={`${type.textColor} shrink-0`} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1 sm:gap-2">
              <Badge
                variant="outline"
                className={`text-[9px] sm:text-[10px] ${type.badgeClass}`}
              >
                {type.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[9px] sm:text-[10px] ${severityClass[suggestion.severity] ?? severityClass.minor}`}
              >
                {suggestion.severity}
              </Badge>
              <span className="truncate font-mono text-xs" style={{ color: "#8D8A9C" }}>
                {suggestion.filePath}
                <span style={{ color: "#4B4866" }}>:{suggestion.startLine}</span>
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-xs sm:text-sm" style={{ color: "#F8F7FA" }}>
              {suggestion.comment}
            </p>
          </div>
        </div>
        <div className="ml-0 flex shrink-0 items-center gap-1 sm:ml-3 sm:gap-2">
          {status === "accepted" && (
            <CheckCircle2 size={20} style={{ color: "#22D3A6" }} />
          )}
          {status === "rejected" && (
            <XCircle size={20} style={{ color: "#8D8A9C" }} />
          )}
          {expanded ? (
            <ChevronUp size={20} style={{ color: "#8D8A9C" }} />
          ) : (
            <ChevronDown size={20} style={{ color: "#8D8A9C" }} />
          )}
        </div>
      </div>

      {expanded && (
        <div
          className="p-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
        >
          <p className="mb-4 text-sm leading-relaxed" style={{ color: "#8D8A9C" }}>
            {suggestion.comment}
          </p>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-[10px] font-semibold sm:mb-1.5 sm:text-xs" style={{ color: "#F87171" }}>
                Before
              </p>
              <pre
                className="no-scrollbar max-h-40 overflow-auto rounded-lg p-2 font-mono text-[10px] leading-relaxed sm:p-3 sm:text-xs"
                style={{
                  border: "1px solid rgba(239,68,68,0.2)",
                  backgroundColor: "rgba(239,68,68,0.04)",
                  color: "#8D8A9C",
                }}
              >
                <code>{suggestion.originalCode}</code>
              </pre>
            </div>
            <div>
              <p className="mb-1 text-[10px] font-semibold sm:mb-1.5 sm:text-xs" style={{ color: "#22D3A6" }}>
                After
              </p>
              <pre
                className="no-scrollbar max-h-40 overflow-auto rounded-lg p-2 font-mono text-[10px] leading-relaxed sm:p-3 sm:text-xs"
                style={{
                  border: "1px solid rgba(34,211,166,0.2)",
                  backgroundColor: "rgba(34,211,166,0.04)",
                  color: "#8D8A9C",
                }}
              >
                <code>{suggestion.suggestedCode}</code>
              </pre>
            </div>
          </div>

          {status === "pending" && (
            <div className="mt-3 flex flex-col gap-2 sm:mt-4 sm:flex-row">
              <Button
                size="sm"
                onClick={() => handle("accepted")}
                disabled={isPending}
                className="gap-1.5 disabled:opacity-60"
                style={{
                  background: "linear-gradient(135deg, #22D3A6, #A3E635)",
                  color: "#0B0A12",
                  fontWeight: 700,
                }}
              >
                <CheckCircle2 size={13} />
                Accept
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handle("rejected")}
                disabled={isPending}
                className="gap-1.5 transition-all"
                style={{
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#8D8A9C",
                }}
              >
                <XCircle size={13} />
                Reject
              </Button>
            </div>
          )}
          {status === "accepted" && (
            <div className="mt-2 flex flex-col items-start gap-1 sm:mt-3 sm:flex-row sm:items-center sm:gap-2">
              <p className="flex items-center gap-1 text-xs sm:gap-1.5" style={{ color: "#22D3A6" }}>
                <CheckCircle2 size={11} /> Accepted
              </p>
              <button
                onClick={() => handle("rejected")}
                disabled={isPending}
                className="text-xs underline"
                style={{ color: "#4B4866" }}
              >
                undo
              </button>
            </div>
          )}
          {status === "rejected" && (
            <div className="mt-2 flex flex-col items-start gap-1 sm:mt-3 sm:flex-row sm:items-center sm:gap-2">
              <p className="flex items-center gap-1 text-xs sm:gap-1.5" style={{ color: "#8D8A9C" }}>
                <XCircle size={11} /> Rejected
              </p>
              <button
                onClick={() => handle("accepted")}
                disabled={isPending}
                className="text-xs underline"
                style={{ color: "#4B4866" }}
              >
                undo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ApplyButton({
  pullRequestId,
  acceptedCount,
  initialPrUrl,
}: {
  pullRequestId: string;
  acceptedCount: number;
  initialPrUrl?: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [prUrl, setPrUrl] = useState<string | null>(initialPrUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    setError(null);
    startTransition(async () => {
      const result = await applyAcceptedSuggestions(pullRequestId);
      if (result.success) {
        setPrUrl(result.prUrl);
      } else {
        setError(result.error);
      }
    });
  };

  if (prUrl) {
    return (
      <div
        className="flex flex-col items-start gap-2 rounded-xl px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4"
        style={{
          border: "1px solid rgba(34,211,166,0.2)",
          backgroundColor: "rgba(34,211,166,0.05)",
        }}
      >
        <CheckCircle2 size={30} className="shrink-0" style={{ color: "#22D3A6" }} />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium sm:text-sm" style={{ color: "#22D3A6" }}>
            Changes applied successfully
          </p>
          <p className="mt-0.5 text-xs" style={{ color: "#8D8A9C" }}>
            A new pull request has been created with your accepted suggestions
          </p>
        </div>
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors sm:gap-1.5 sm:px-3"
          style={{
            border: "1px solid rgba(34,211,166,0.3)",
            backgroundColor: "rgba(34,211,166,0.1)",
            color: "#22D3A6",
          }}
        >
          <GitPullRequest size={14} />
          <span className="hidden sm:inline">View PR</span>
          <span className="sm:hidden">PR</span>
          <ExternalLink size={14} />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2 flex flex-col gap-2">
      <div
        className="flex flex-col items-start justify-between gap-2 rounded-xl px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          backgroundColor: "rgba(255,255,255,0.04)",
        }}
      >
        <div>
          <p className="text-xs font-medium sm:text-sm" style={{ color: "#F8F7FA" }}>
            {acceptedCount} suggestion{acceptedCount !== 1 ? "s" : ""} accepted
          </p>
          <p className="text-xs mt-0.5" style={{ color: "#8D8A9C" }}>
            {acceptedCount > 0
              ? "Apply all accepted changes and create a new PR on GitHub"
              : "Accept at least one suggestion before applying"}
          </p>
        </div>
        <button
          onClick={handleApply}
          disabled={isPending || acceptedCount === 0}
          className="btn-gradient-teal shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating PR…
            </>
          ) : (
            <>
              <GitPullRequest size={14} />
              Apply &amp; Create PR
            </>
          )}
        </button>
      </div>
      {error && (
        <p
          className="rounded-lg px-3 py-2 text-xs"
          style={{
            border: "1px solid rgba(239,68,68,0.2)",
            backgroundColor: "rgba(239,68,68,0.05)",
            color: "#F87171",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}

export function SuggestionPanel({
  suggestions: initialSuggestions,
  pullRequestId,
  initialPrUrl,
}: {
  suggestions: Suggestion[];
  pullRequestId: string;
  initialPrUrl?: string | null;
}) {
  const [suggestions, setSuggestions] = useState(initialSuggestions);
  const [filter, setFilter] = useState<
    "all" | "pending" | "accepted" | "rejected"
  >("all");

  const handleStatusChange = (id: string, status: "accepted" | "rejected") => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s)),
    );
  };

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
    <div className="space-y-4">
      <ApplyButton
        pullRequestId={pullRequestId}
        acceptedCount={counts.accepted}
        initialPrUrl={initialPrUrl}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} style={{ color: "#C084FC" }} />
          <span className="font-semibold" style={{ color: "#F8F7FA" }}>
            {suggestions.length} AI Suggestion
            {suggestions.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div
          className="flex gap-1 rounded-lg p-1"
          style={{
            border: "1px solid rgba(255,255,255,0.08)",
            backgroundColor: "#141220",
          }}
        >
          {(["all", "pending", "accepted", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors"
              style={
                filter === f
                  ? {
                      background:
                        "linear-gradient(135deg, #7C3AED, #A855F7)",
                      color: "#F8F7FA",
                    }
                  : { color: "#8D8A9C" }
              }
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm" style={{ color: "#8D8A9C" }}>
            No {filter} suggestions.
          </p>
        ) : (
          filtered.map((s) => (
            <SuggestionCard
              key={s.id}
              suggestion={s}
              onStatusChange={handleStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

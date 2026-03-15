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
    textColor: "text-blue-400",
    badgeClass: "border-blue-500/30 bg-blue-500/10 text-blue-400",
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
  minor: "border-gray-500/40 bg-gray-500/10 text-gray-400",
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
      className={`rounded-xl border backdrop-blur-sm transition-all ${
        status === "accepted"
          ? "border-green-500/30 bg-green-500/5"
          : status === "rejected"
            ? "border-white/5 bg-black/30 opacity-60"
            : "border-white/10 bg-linear-to-b from-gray-900/50 to-black/50"
      }`}
    >
      {/* Header */}
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex min-w-0 items-center gap-3">
          <TypeIcon size={15} className={type.textColor} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className={`text-[10px] ${type.badgeClass}`}
              >
                {type.label}
              </Badge>
              <Badge
                variant="outline"
                className={`text-[10px] ${severityClass[suggestion.severity] ?? severityClass.minor}`}
              >
                {suggestion.severity}
              </Badge>
              <span className="truncate font-mono text-xs text-gray-400">
                {suggestion.filePath}
                <span className="text-gray-600">:{suggestion.startLine}</span>
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-gray-300">
              {suggestion.comment}
            </p>
          </div>
        </div>
        <div className="ml-3 flex shrink-0 items-center gap-2">
          {status === "accepted" && (
            <CheckCircle2 size={15} className="text-green-400" />
          )}
          {status === "rejected" && (
            <XCircle size={15} className="text-gray-500" />
          )}
          {expanded ? (
            <ChevronUp size={15} className="text-gray-500" />
          ) : (
            <ChevronDown size={15} className="text-gray-500" />
          )}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t border-white/5 p-4">
          <p className="mb-4 text-sm leading-relaxed text-gray-300">
            {suggestion.comment}
          </p>

          {/* Side-by-side diff */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 text-xs font-semibold text-red-400">
                Before
              </p>
              <pre className="no-scrollbar overflow-x-auto rounded-lg border border-red-500/20 bg-red-500/5 p-3 font-mono text-xs leading-relaxed text-gray-300">
                <code>{suggestion.originalCode}</code>
              </pre>
            </div>
            <div>
              <p className="mb-1.5 text-xs font-semibold text-green-400">
                After
              </p>
              <pre className="no-scrollbar overflow-x-auto rounded-lg border border-green-500/20 bg-green-500/5 p-3 font-mono text-xs leading-relaxed text-gray-300">
                <code>{suggestion.suggestedCode}</code>
              </pre>
            </div>
          </div>

          {/* Actions */}
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
            <div className="mt-3 flex items-center gap-2">
              <p className="flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 size={12} /> Accepted
              </p>
              <button
                onClick={() => handle("rejected")}
                disabled={isPending}
                className="text-xs text-gray-600 hover:text-gray-400 underline"
              >
                undo
              </button>
            </div>
          )}
          {status === "rejected" && (
            <div className="mt-3 flex items-center gap-2">
              <p className="flex items-center gap-1.5 text-xs text-gray-500">
                <XCircle size={12} /> Rejected
              </p>
              <button
                onClick={() => handle("accepted")}
                disabled={isPending}
                className="text-xs text-gray-600 hover:text-gray-400 underline"
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

// ─── Apply button ─────────────────────────────────────────────────────────────
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
      <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3">
        <CheckCircle2 size={16} className="shrink-0 text-green-400" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-400">
            Changes applied successfully
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            A new pull request has been created with your accepted suggestions
          </p>
        </div>
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors"
        >
          <GitPullRequest size={13} />
          View PR
          <ExternalLink size={11} />
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">
            {acceptedCount} suggestion{acceptedCount !== 1 ? "s" : ""} accepted
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {acceptedCount > 0
              ? "Apply all accepted changes and create a new PR on GitHub"
              : "Accept at least one suggestion before applying"}
          </p>
        </div>
        <Button
          onClick={handleApply}
          disabled={isPending || acceptedCount === 0}
          className="shrink-0 gap-2 bg-blue-600 font-semibold hover:bg-blue-700 disabled:opacity-40"
        >
          {isPending ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              Creating PR…
            </>
          ) : (
            <>
              <GitPullRequest size={14} />
              Apply & Create PR
            </>
          )}
        </Button>
      </div>
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
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
      {/* Apply button — always visible at the top */}
      <ApplyButton
        pullRequestId={pullRequestId}
        acceptedCount={counts.accepted}
        initialPrUrl={initialPrUrl}
      />

      {/* Filter tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-blue-400" />
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

      {/* Cards */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-gray-500">
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

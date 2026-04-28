"use client";

import { useState, useTransition } from "react";
import { applyCiPatch } from "@/actions/ci";
import {
  AlertTriangle,
  CheckCircle2,
  Code2,
  ExternalLink,
  GitPullRequest,
  Loader2,
  Stethoscope,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type Patch = {
  filePath: string;
  originalCode: string;
  suggestedCode: string;
};

interface CiDiagnosisPanelProps {
  ciFailureId: string;
  rootCause: string;
  diagnosis: string;
  fixSummary: string;
  patches: Patch[];
  initialPrUrl: string | null;
}

function PatchCard({ patch }: { patch: Patch }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between gap-3 p-3 sm:p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <Code2 size={14} className="shrink-0 text-blue-400" />
          <span className="font-mono text-xs sm:text-sm text-gray-300 truncate">
            {patch.filePath}
          </span>
        </div>
        <span className="shrink-0 text-xs text-gray-500">
          {expanded ? "collapse" : "expand"}
        </span>
      </button>

      {expanded && (
        <div className="border-t border-white/5 p-3 sm:p-4">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[10px] sm:text-xs font-semibold text-red-400">
                Before
              </p>
              <pre className="no-scrollbar max-h-48 overflow-auto rounded-lg border border-red-500/20 bg-red-500/5 p-2 sm:p-3 font-mono text-[10px] sm:text-xs leading-relaxed text-gray-300">
                <code>{patch.originalCode}</code>
              </pre>
            </div>
            <div>
              <p className="mb-1.5 text-[10px] sm:text-xs font-semibold text-green-400">
                After
              </p>
              <pre className="no-scrollbar max-h-48 overflow-auto rounded-lg border border-green-500/20 bg-green-500/5 p-2 sm:p-3 font-mono text-[10px] sm:text-xs leading-relaxed text-gray-300">
                <code>{patch.suggestedCode}</code>
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ApplyCiPatchButton({
  ciFailureId,
  hasPatch,
  initialPrUrl,
}: {
  ciFailureId: string;
  hasPatch: boolean;
  initialPrUrl: string | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [prUrl, setPrUrl] = useState<string | null>(initialPrUrl);
  const [error, setError] = useState<string | null>(null);

  const handleApply = () => {
    setError(null);
    startTransition(async () => {
      const result = await applyCiPatch(ciFailureId);
      if (result.success && result.prUrl) {
        setPrUrl(result.prUrl);
      } else {
        setError(result.error ?? "Failed to apply patch");
      }
    });
  };

  if (prUrl) {
    return (
      <div className="flex flex-col items-start gap-2 rounded-xl border border-green-500/20 bg-green-500/5 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
        <CheckCircle2 size={24} className="shrink-0 text-green-400" />
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-green-400 sm:text-sm">
            Fix applied — PR created
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Review and merge the fix PR to resolve this CI failure
          </p>
        </div>
        <a
          href={prUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-green-500/30 bg-green-500/10 px-2 py-1.5 text-xs font-semibold text-green-400 hover:bg-green-500/20 transition-colors sm:px-3"
        >
          <GitPullRequest size={13} />
          View PR
          <ExternalLink size={12} />
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-col items-start justify-between gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4">
        <div>
          <p className="text-xs font-medium text-white sm:text-sm">
            {hasPatch ? "Code patch available" : "No automated patch available"}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasPatch
              ? "Apply the AI-suggested fix and open a PR automatically"
              : "This fix requires manual changes (env vars, infra, secrets, etc.)"}
          </p>
        </div>
        {hasPatch && (
          <Button
            onClick={handleApply}
            disabled={isPending}
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
                Apply Fix & Create PR
              </>
            )}
          </Button>
        )}
      </div>
      {error && (
        <p className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

export function CiDiagnosisPanel({
  ciFailureId,
  rootCause,
  diagnosis,
  fixSummary,
  patches,
  initialPrUrl,
}: CiDiagnosisPanelProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Apply / PR status bar */}
      <ApplyCiPatchButton
        ciFailureId={ciFailureId}
        hasPatch={patches.length > 0}
        initialPrUrl={initialPrUrl}
      />

      {/* Root cause */}
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-400" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
              Root Cause
            </p>
            <p className="text-sm sm:text-base font-medium text-white">
              {rootCause}
            </p>
          </div>
        </div>
      </div>

      {/* Diagnosis */}
      <div className="rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <Stethoscope size={16} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-400">
            Diagnosis
          </p>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{diagnosis}</p>
      </div>

      {/* Fix summary */}
      <div className="rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-4 sm:p-5">
        <div className="flex items-start gap-3 mb-3">
          <Wrench size={16} className="mt-0.5 shrink-0 text-purple-400" />
          <p className="text-xs font-semibold uppercase tracking-wider text-purple-400">
            Recommended Fix
          </p>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">{fixSummary}</p>
      </div>

      {/* Code patches */}
      {patches.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap size={15} className="text-green-400" />
            <span className="font-semibold text-white text-sm sm:text-base">
              {patches.length} Code {patches.length === 1 ? "Patch" : "Patches"}
            </span>
          </div>
          {patches.map((patch, i) => (
            <PatchCard key={i} patch={patch} />
          ))}
        </div>
      )}
    </div>
  );
}

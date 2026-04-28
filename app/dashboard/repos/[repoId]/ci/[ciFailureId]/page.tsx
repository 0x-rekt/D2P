import { getCiFailureById } from "@/actions/ci";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  GitBranch,
  Clock,
  Loader2,
  Activity,
  ExternalLink,
} from "lucide-react";
import { CiDiagnosisPanel } from "@/components/CiDiagnosisPanel";
import { CiStatusWatcher } from "@/components/CiStatusWatcher";

type PageProps = {
  params: Promise<{ repoId: string; ciFailureId: string }>;
};

const CiFailureDetailPage = async ({ params }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId, ciFailureId } = await params;
  const { success, failure, error } = await getCiFailureById(ciFailureId);

  if (!success || !failure) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={24} />
          <p className="text-gray-400">{error ?? "CI failure not found"}</p>
          <Link
            href={`/dashboard/repos/${repoId}/ci`}
            className="mt-4 inline-block text-sm text-blue-400 hover:underline"
          >
            ← Back to CI Failures
          </Link>
        </div>
      </section>
    );
  }

  const isAnalyzing =
    failure.analysisStatus === "analyzing" ||
    failure.analysisStatus === "pending";

  const patches = failure.suggestedPatch
    ? (() => {
        try {
          return JSON.parse(failure.suggestedPatch);
        } catch {
          return [];
        }
      })()
    : [];

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-16">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-150 -translate-x-1/2 rounded-full bg-red-500/8 blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 sm:mb-6">
          <Link href="/dashboard" className="hover:text-gray-300">
            Dashboard
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/repos/${repoId}`}
            className="hover:text-gray-300"
          >
            {failure.repository.name}
          </Link>
          <span>/</span>
          <Link
            href={`/dashboard/repos/${repoId}/ci`}
            className="hover:text-gray-300"
          >
            CI Failures
          </Link>
          <span>/</span>
          <span className="text-gray-300 truncate max-w-30">
            {failure.workflowName}
          </span>
        </div>

        <div className="mb-6 rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-4 sm:p-6 backdrop-blur-sm sm:mb-8">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
            <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
              <div className="mt-0.5 shrink-0 rounded-lg border border-red-500/20 bg-red-500/10 p-2">
                <Activity size={20} className="text-red-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-white sm:text-xl">
                  {failure.workflowName}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-4">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <GitBranch size={14} className="shrink-0" />
                    <span className="text-gray-300">{failure.branch}</span>
                  </span>
                  <span className="font-mono text-gray-500">
                    {failure.commitSha.slice(0, 7)}
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Clock size={14} className="shrink-0" />
                    {new Date(failure.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${
                      failure.conclusion === "timed_out"
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {failure.conclusion === "timed_out"
                      ? "Timed Out"
                      : "Failed"}
                  </span>
                </div>
              </div>
            </div>
            <a
              href={failure.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-white sm:px-3"
            >
              <ExternalLink size={12} />
              View Run
            </a>
          </div>
        </div>

        {/* Body */}
        {isAnalyzing ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/5 py-20 text-center">
            <Loader2 className="mb-4 animate-spin text-blue-400" size={36} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              AI Diagnosis in Progress
            </h2>
            <p className="text-sm text-gray-500">
              Fetching logs and diagnosing the root cause…
            </p>
            <CiStatusWatcher ciFailureId={ciFailureId} />
          </div>
        ) : failure.analysisStatus === "failed" ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-20 text-center">
            <AlertCircle className="mb-4 text-red-400" size={36} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              Diagnosis Failed
            </h2>
            <p className="mb-6 text-sm text-gray-500">
              Something went wrong while analyzing the CI failure.
            </p>
          </div>
        ) : (
          <CiDiagnosisPanel
            ciFailureId={failure.id}
            rootCause={failure.rootCause ?? ""}
            diagnosis={failure.diagnosis ?? ""}
            fixSummary={failure.fixSummary ?? ""}
            patches={patches}
            initialPrUrl={failure.appliedUrl ?? null}
          />
        )}
      </div>
    </section>
  );
};

export default CiFailureDetailPage;

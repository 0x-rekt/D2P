import { getPullRequestWithSuggestions } from "@/actions/pulls";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  GitPullRequest,
  GitBranch,
  Clock,
  Loader2,
} from "lucide-react";
import { SuggestionPanel } from "@/components/SuggestionPanel";

type PageProps = { params: Promise<{ repoId: string; pullId: string }> };

export default async function PullRequestPage({ params }: PageProps) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId, pullId } = await params;
  const { success, pull, error } = await getPullRequestWithSuggestions(pullId);

  if (!success || !pull) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <p className="text-gray-400">{error ?? "Pull request not found"}</p>
          <Link
            href={`/dashboard/repos/${repoId}`}
            className="mt-4 inline-block text-sm text-blue-400 hover:underline"
          >
            ← Back to repository
          </Link>
        </div>
      </section>
    );
  }

  const isReviewing =
    pull.reviewStatus === "reviewing" || pull.reviewStatus === "pending";

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-16">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-150 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

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
            {pull.repository.name}
          </Link>
          <span>/</span>
          <span className="text-gray-300">PR #{pull.prNumber}</span>
        </div>

        {/* PR header */}
        <div className="mb-6 rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-4 sm:p-6 backdrop-blur-sm sm:mb-8\">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-start">
            <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3">
              <GitPullRequest
                size={30}
                className="mt-0.5 shrink-0 text-green-400"
              />
              <div className="min-w-0 flex-1">
                <h1 className="text-lg font-bold text-white sm:text-xl">
                  {pull.title}
                  <span className="ml-1 text-sm font-normal text-gray-500 sm:ml-2 sm:text-base">
                    #{pull.prNumber}
                  </span>
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-4">
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <GitBranch size={20} className="shrink-0" />
                    <span className="truncate text-gray-300">
                      {pull.headBranch}
                    </span>
                    <span className="shrink-0">→</span>
                    <span className="truncate text-gray-300">
                      {pull.baseBranch}
                    </span>
                  </span>
                  <span className="hidden line-clamp-1 sm:inline">
                    by <span className="text-gray-300">{pull.authorLogin}</span>
                  </span>
                  <span className="flex items-center gap-1 sm:gap-1.5">
                    <Clock size={14} className="shrink-0" />
                    {new Date(pull.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                {pull.body && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400 sm:mt-3 sm:line-clamp-none sm:text-sm">
                    {pull.body}
                  </p>
                )}
              </div>
            </div>
            <a
              href={pull.prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-white sm:px-3"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* Suggestions or status */}
        {isReviewing ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-blue-500/20 bg-blue-500/5 py-20 text-center">
            <Loader2 className="mb-4 animate-spin text-blue-400" size={36} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              AI Review in Progress
            </h2>
            <p className="text-sm text-gray-500">
              Gemini is analyzing the diff. Refresh in a moment.
            </p>
          </div>
        ) : pull.reviewStatus === "failed" ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-red-500/20 bg-red-500/5 py-20 text-center">
            <AlertCircle className="mb-4 text-red-400" size={36} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              Review Failed
            </h2>
            <p className="text-sm text-gray-500">
              Something went wrong during the AI review. Push a new commit to
              retry.
            </p>
          </div>
        ) : pull.suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 py-20 text-center">
            <GitPullRequest className="mb-4 text-gray-600" size={36} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              No Suggestions
            </h2>
            <p className="text-sm text-gray-500">
              Gemini found no issues with this pull request. Looks good!
            </p>
          </div>
        ) : (
          <SuggestionPanel
            suggestions={pull.suggestions}
            pullRequestId={pull.id}
            initialPrUrl={(pull as any).appliedPrUrl ?? null}
          />
        )}
      </div>
    </section>
  );
}

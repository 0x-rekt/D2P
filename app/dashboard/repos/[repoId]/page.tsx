import { getPullRequests } from "@/actions/pulls";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  GitPullRequest,
  Clock,
  GitBranch,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type PageProps = {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const reviewStatusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    class: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  },
  reviewing: {
    label: "Reviewing",
    icon: Loader2,
    class: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  reviewed: {
    label: "Reviewed",
    icon: CheckCircle2,
    class: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    class: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};

const RepoPage = async ({ params, searchParams }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const limit = 10;

  const { success, repo, pulls, error, total } = await getPullRequests(
    repoId,
    page,
    limit,
  );

  if (!success || !repo) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={14} />
          <p className="text-gray-400">{error ?? "Repository not found"}</p>
          <Link
            href="/dashboard"
            className="mt-4 inline-block text-sm text-blue-400 hover:underline"
          >
            ← Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  const totalPages = total ? Math.ceil(total / limit) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-16">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-150 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <Link
            href="/dashboard"
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-300"
          >
            ← Dashboard
          </Link>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {repo.name}
              </h1>
              <p className="mt-1 truncate text-xs sm:text-sm text-gray-500">
                {repo.fullName}
              </p>
            </div>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* PR list */}
        {pulls.length === 0 && total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 py-24 text-center">
            <GitPullRequest className="mb-4 text-gray-600" size={14} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              No pull requests yet
            </h2>
            <p className="text-sm text-gray-500">
              Open a PR on this repository and AI will automatically review it.
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <p className="mb-3 text-xs sm:mb-4 sm:text-sm text-gray-500">
              {total} pull {total === 1 ? "request" : "requests"}
            </p>
            {pulls.map((pr) => {
              const status =
                reviewStatusConfig[
                  pr.reviewStatus as keyof typeof reviewStatusConfig
                ] ?? reviewStatusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Link
                  key={pr.id}
                  href={`/dashboard/repos/${repoId}/pulls/${pr.id}`}
                  className="group flex flex-col items-start justify-between gap-3 rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-3 sm:p-4 md:p-5 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 md:flex-row md:items-center md:gap-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-2 sm:gap-3 md:gap-4">
                    <GitPullRequest
                      size={30}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-semibold text-white group-hover:text-blue-400 transition-colors text-sm sm:text-base">
                        {pr.title}
                        <span className="ml-2 text-xs font-normal text-gray-500 sm:text-sm">
                          #{pr.prNumber}
                        </span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3">
                        <span className="flex items-center gap-1 truncate">
                          <GitBranch size={14} className="shrink-0" />
                          <span className="truncate">{pr.headBranch}</span>
                          <span className="shrink-0">→</span>
                          <span className="truncate">{pr.baseBranch}</span>
                        </span>
                        <span className="hidden line-clamp-1 sm:inline">
                          by {pr.authorLogin}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} className="shrink-0" />
                          {new Date(pr.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {pr._count.suggestions > 0 && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Sparkles size={14} className="shrink-0" />
                            <span className="hidden sm:inline">
                              {pr._count.suggestions} suggestion
                              {pr._count.suggestions !== 1 ? "s" : ""}
                            </span>
                            <span className="sm:hidden">
                              {pr._count.suggestions}
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 self-end md:self-center">
                    <Badge
                      variant="outline"
                      className={`gap-1 text-xs md:gap-1.5 md:text-sm ${status.class}`}
                    >
                      <StatusIcon
                        size={10}
                        className={`md:size-11 ${
                          pr.reviewStatus === "reviewing" ? "animate-spin" : ""
                        }`}
                      />
                      <span className="hidden sm:inline">{status.label}</span>
                    </Badge>
                  </div>
                </Link>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
                {hasPrevPage && (
                  <Link
                    href={`?page=${page - 1}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm sm:w-auto text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </Link>
                )}

                <span className="text-xs sm:text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>

                {hasNextPage && (
                  <Link
                    href={`?page=${page + 1}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm sm:w-auto text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ChevronRight size={14} />
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default RepoPage;

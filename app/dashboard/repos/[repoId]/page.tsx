import { getPullRequests } from "@/actions/pulls";
import { getCiFailures } from "@/actions/ci";
import { getSecurityFindings } from "@/actions/security";
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
  Activity,
  ExternalLink,
  Shield,
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

const stateConfig = {
  open: {
    label: "Open",
    class: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  closed: {
    label: "Closed",
    class: "border-red-500/30 bg-red-500/10 text-red-400",
  },
  merged: {
    label: "Merged",
    class: "border-purple-500/30 bg-purple-500/10 text-purple-400",
  },
};

const RepoPage = async ({ params, searchParams }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const limit = 10;

  const [prResult, ciResult, securityResult] = await Promise.all([
    getPullRequests(repoId, page, limit),
    getCiFailures(repoId, 1, 1),
    getSecurityFindings(repoId).catch(() => []),
  ]);

  const { success, repo, pulls, error, total } = prResult;
  const ciTotal = ciResult.total ?? 0;
  const securityTotal = (securityResult as any[]).length ?? 0;

  if (!success || !repo) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <AlertCircle className="text-red-400" size={22} />
          </div>
          <p className="text-gray-400 text-sm">
            {error ?? "Repository not found"}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ChevronLeft size={13} />
            Back to dashboard
          </Link>
        </div>
      </section>
    );
  }

  const totalPages = total ? Math.ceil(total / limit) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] py-14 sm:py-20">
      {/* Background glows — matches home page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-blue-600 to-indigo-600 opacity-[0.15] blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[800px] rounded-full bg-gradient-to-t from-purple-600 to-pink-600 opacity-[0.08] blur-[130px]" />
      </div>

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={13} />
          Dashboard
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-2xl font-black tracking-tight text-white sm:text-3xl">
              {repo.name}
            </h1>
            <p className="mt-1 truncate text-xs text-gray-600">
              {repo.fullName}
            </p>
          </div>
          <a
            href={repo.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ExternalLink size={12} />
            View on GitHub
          </a>
        </div>

        {/* Tab navigation */}
        <div className="mb-8 flex items-center gap-2 border-b border-white/[0.06] pb-4 overflow-x-auto">
          <span className="flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 whitespace-nowrap">
            <GitPullRequest size={13} />
            Pull Requests
            {total != null && (
              <span className="ml-0.5 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-300">
                {total}
              </span>
            )}
          </span>
          <Link
            href={`/dashboard/repos/${repoId}/ci`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-xs font-medium text-gray-500 hover:border-red-500/30 hover:bg-red-500/[0.08] hover:text-red-400 transition-all whitespace-nowrap"
          >
            <Activity size={13} />
            CI Failures
            {ciTotal > 0 && (
              <span className="ml-0.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                {ciTotal}
              </span>
            )}
          </Link>
          <Link
            href={`/dashboard/repos/${repoId}/security`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-xs font-medium text-gray-500 hover:border-blue-500/30 hover:bg-blue-500/[0.08] hover:text-blue-400 transition-all whitespace-nowrap"
          >
            <Shield size={13} />
            Security
            {securityTotal > 0 && (
              <span className="ml-0.5 rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-400">
                {securityTotal}
              </span>
            )}
          </Link>
        </div>

        {/* PR list */}
        {pulls.length === 0 && total === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
              <GitPullRequest className="text-gray-600" size={22} />
            </div>
            <h2 className="mb-2 text-base font-semibold text-white">
              No pull requests yet
            </h2>
            <p className="text-xs text-gray-500 max-w-xs">
              Open a PR on this repository and AI will automatically review it.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="mb-4 text-xs text-gray-600">
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
                  className="group flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/50 to-black/50 p-4 backdrop-blur-sm transition-all duration-200 hover:border-blue-500/25 hover:shadow-lg hover:shadow-blue-500/[0.07] md:flex-row md:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 shrink-0 flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/20 bg-green-500/10">
                      <GitPullRequest size={15} className="text-green-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                        {pr.title}
                        <span className="ml-2 text-xs font-normal text-gray-600">
                          #{pr.prNumber}
                        </span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1 truncate">
                          <GitBranch size={11} className="shrink-0" />
                          <span className="truncate">{pr.headBranch}</span>
                          <span>→</span>
                          <span className="truncate">{pr.baseBranch}</span>
                        </span>
                        <span className="hidden sm:inline">
                          by {pr.authorLogin}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(pr.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {pr._count.suggestions > 0 && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Sparkles size={11} />
                            {pr._count.suggestions} suggestion
                            {pr._count.suggestions !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-medium ${(stateConfig[pr.state as keyof typeof stateConfig] ?? stateConfig.open).class}`}
                    >
                      {
                        (
                          stateConfig[pr.state as keyof typeof stateConfig] ??
                          stateConfig.open
                        ).label
                      }
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`gap-1 text-[10px] font-medium ${status.class}`}
                    >
                      <StatusIcon
                        size={10}
                        className={
                          pr.reviewStatus === "reviewing" ? "animate-spin" : ""
                        }
                      />
                      {status.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-3 pt-4">
                {hasPrevPage ? (
                  <Link
                    href={`?page=${page - 1}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    <ChevronLeft size={13} />
                    Previous
                  </Link>
                ) : (
                  <div className="w-24" />
                )}
                <span className="text-xs text-gray-600">
                  {page} / {totalPages}
                </span>
                {hasNextPage ? (
                  <Link
                    href={`?page=${page + 1}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Next
                    <ChevronRight size={13} />
                  </Link>
                ) : (
                  <div className="w-16" />
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

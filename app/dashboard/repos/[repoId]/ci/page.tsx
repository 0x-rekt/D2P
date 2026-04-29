import { getCiFailures } from "@/actions/ci";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CiFailureCard } from "@/components/CiFailureCard";
import {
  AlertCircle,
  CheckCircle2,
  Activity,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  GitPullRequest,
} from "lucide-react";

type PageProps = {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ page?: string }>;
};

const CiFailuresPage = async ({ params, searchParams }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const limit = 10;

  const { success, repo, failures, error, total } = await getCiFailures(
    repoId,
    page,
    limit,
  );

  if (!success || !repo) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <AlertCircle className="text-red-400" size={22} />
          </div>
          <p className="text-gray-400 text-sm">{error ?? "Repository not found"}</p>
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
      <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-red-600 to-red-900 opacity-10 blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[800px] rounded-full bg-gradient-to-t from-red-600 to-purple-600 opacity-[0.07] blur-[130px]" />

      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Link
          href={`/dashboard/repos/${repoId}`}
          className="mb-6 inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={13} />
          Pull Requests
        </Link>

        {/* Header */}
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10">
                <Activity size={15} className="text-red-400" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                CI Failures
              </h1>
            </div>
            <p className="mt-1 truncate text-xs text-gray-600 pl-10">{repo.fullName}</p>
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
        <div className="mb-8 flex items-center gap-2 border-b border-white/[0.06] pb-4">
          <Link
            href={`/dashboard/repos/${repoId}`}
            className="flex items-center gap-1.5 rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-xs font-medium text-gray-500 hover:border-blue-500/30 hover:bg-blue-500/[0.08] hover:text-blue-400 transition-all"
          >
            <GitPullRequest size={13} />
            Pull Requests
          </Link>
          <span className="flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-semibold text-red-400">
            <Activity size={13} />
            CI Failures
            {(total ?? 0) > 0 && (
              <span className="ml-0.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                {total}
              </span>
            )}
          </span>
        </div>

        {/* Content */}
        {failures.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
              <CheckCircle2 className="text-green-400" size={22} />
            </div>
            <h2 className="mb-2 text-base font-semibold text-white">All Green!</h2>
            <p className="text-xs text-gray-500 max-w-xs">
              No CI failures detected for this repository yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-4 text-xs text-gray-600">
              {total} CI {total === 1 ? "failure" : "failures"} detected
            </p>

            {failures.map((failure) => (
              <CiFailureCard
                key={failure.id}
                id={failure.id}
                repoId={repoId}
                workflowName={failure.workflowName}
                branch={failure.branch}
                commitSha={failure.commitSha}
                createdAt={failure.createdAt}
                rootCause={failure.rootCause}
                appliedUrl={failure.appliedUrl}
                conclusion={failure.conclusion}
                analysisStatus={failure.analysisStatus}
              />
            ))}

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
                ) : <div className="w-24" />}
                <span className="text-xs text-gray-600">{page} / {totalPages}</span>
                {hasNextPage ? (
                  <Link
                    href={`?page=${page + 1}`}
                    className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
                  >
                    Next
                    <ChevronRight size={13} />
                  </Link>
                ) : <div className="w-16" />}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default CiFailuresPage;

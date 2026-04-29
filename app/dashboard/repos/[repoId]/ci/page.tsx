import { getCiFailures } from "@/actions/ci";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CiFailureCard } from "@/components/CiFailureCard";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Activity,
  ChevronLeft,
  ChevronRight,
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
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={24} />
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
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-150 -translate-x-1/2 rounded-full bg-red-500/8 blur-[120px]" />

      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <Link
            href={`/dashboard/repos/${repoId}`}
            className="mb-4 sm:mb-6 inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-gray-300"
          >
            ← Pull Requests
          </Link>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={20} className="text-red-400 shrink-0" />
                <h1 className="truncate text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  CI Failures
                </h1>
              </div>
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

        {failures.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 py-24 text-center">
            <CheckCircle2 className="mb-4 text-green-500" size={48} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              All Green!
            </h2>
            <p className="text-sm text-gray-500">
              No CI failures detected for this repository yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            <p className="mb-3 text-xs sm:mb-4 sm:text-sm text-gray-500">
              {total} CI {total === 1 ? "failure" : "failures"} detected
            </p>

            {failures.map((failure) => {
              return (
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
              );
            })}

            {totalPages > 1 && (
              <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:mt-8 sm:flex-row">
                {hasPrevPage && (
                  <Link
                    href={`?page=${page - 1}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm sm:w-auto text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                  >
                    <ChevronLeft size={14} />
                    <span>Previous</span>
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
                    <span>Next</span>
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

export default CiFailuresPage;

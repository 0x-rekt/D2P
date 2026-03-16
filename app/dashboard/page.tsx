import { getRepositories } from "@/actions/repos";
import { RepoCard } from "@/components/RepoCard";
import { Badge } from "@/components/ui/badge";
import { Github, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

const Dashboard = async ({ searchParams }: PageProps) => {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const limit = 9;
  const { success, repositories, error, count, total } = await getRepositories(
    page,
    limit,
  );

  if (error) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-black py-24">
        <div className="absolute left-1/2 top-0 -z-10 h-150 w-250 -translate-x-1/2 rounded-full bg-red-500/10 blur-[120px]" />
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <AlertCircle className="mb-4 text-red-500" size={48} />
            <h1 className="mb-4 text-3xl font-bold text-white">Error</h1>
            <p className="text-gray-400">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-black py-24">
        <div className="absolute left-1/2 top-0 -z-10 h-150 w-250 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center text-center">
            <Github className="mb-4 text-gray-600" size={64} />
            <h1 className="mb-4 text-3xl font-bold text-white">
              No Repositories Found
            </h1>
            <p className="text-gray-400">
              You don't have any repositories yet. Create one on GitHub to get
              started.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const totalPages = total ? Math.ceil(total / limit) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-16 sm:py-24">
      <div className="absolute left-1/2 top-0 -z-10 h-150 w-250 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:mb-12">
          <div className="mb-6 flex justify-center">
            <Badge
              variant="outline"
              className="gap-2 border-blue-500/30 bg-blue-500/5 px-3 py-1 text-xs sm:px-4 sm:py-1.5 sm:text-sm text-blue-400 backdrop-blur-sm"
            >
              <Github size={14} />
              <span>GitHub Repositories</span>
            </Badge>
          </div>
          <h1 className="mb-3 bg-linear-to-b from-white to-gray-500 bg-clip-text text-3xl font-extrabold tracking-tighter text-transparent sm:mb-4 sm:text-4xl lg:text-5xl">
            Your Repositories
          </h1>
          <p className="text-base text-gray-400 sm:text-lg">
            {total} {total === 1 ? "repository" : "repositories"} found
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {repositories.map((repo) => (
            <RepoCard
              key={repo.id}
              repo={repo}
              isConnected={repo.isConnected}
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:mt-12 sm:flex-row">
            {hasPrevPage && (
              <Link
                href={`/dashboard?page=${page - 1}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm sm:w-auto text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronLeft size={16} />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
              </Link>
            )}

            <span className="text-xs sm:text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            {hasNextPage && (
              <Link
                href={`/dashboard?page=${page + 1}`}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs sm:text-sm sm:w-auto text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ChevronRight size={16} />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

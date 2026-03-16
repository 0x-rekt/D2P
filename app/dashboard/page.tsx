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
  const limit = 12;

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

      <div className="container mx-auto px-6">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <Badge
              variant="outline"
              className="gap-2 border-blue-500/30 bg-blue-500/5 px-4 py-1.5 text-blue-400 backdrop-blur-sm"
            >
              <Github size={14} />
              <span>GitHub Repositories</span>
            </Badge>
          </div>
          <h1 className="mb-4 bg-linear-to-b from-white to-gray-500 bg-clip-text text-4xl font-extrabold tracking-tighter text-transparent sm:text-5xl">
            Your Repositories
          </h1>
          <p className="text-lg text-gray-400">
            {total} {total === 1 ? "repository" : "repositories"} found
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
          <div className="mt-12 flex items-center justify-center gap-3">
            {hasPrevPage && (
              <Link
                href={`/dashboard?page=${page - 1}`}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                <ChevronLeft size={18} />
                Previous
              </Link>
            )}

            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            {hasNextPage && (
              <Link
                href={`/dashboard?page=${page + 1}`}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              >
                Next
                <ChevronRight size={18} />
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

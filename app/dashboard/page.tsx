import { getRepositories } from "@/actions/repos";
import { RepoCard } from "@/components/RepoCard";
import { auth } from "@/lib/auth";
import {
  Github,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ page?: string }>;
};

const Dashboard = async ({ searchParams }: PageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    return redirect("/");
  }
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || "1", 10));
  const limit = 9;
  const { repositories, error, total } = await getRepositories(page, limit);

  if (error) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] flex items-center justify-center">
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-red-600 to-red-900 opacity-10 blur-[140px]" />
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
            <AlertCircle className="text-red-400" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="text-gray-500 text-sm max-w-sm">{error}</p>
        </div>
      </section>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] flex items-center justify-center">
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-blue-600 to-indigo-600 opacity-15 blur-[140px]" />
        <div className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
            <Github className="text-gray-500" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">No Repositories Found</h1>
          <p className="text-gray-500 text-sm max-w-sm">
            You don&apos;t have any repositories yet. Create one on GitHub to get started.
          </p>
        </div>
      </section>
    );
  }

  const totalPages = total ? Math.ceil(total / limit) : 1;
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return (
    <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] py-16 sm:py-20">
      {/* Background glows — matches home page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-blue-600 to-indigo-600 opacity-[0.15] blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[800px] rounded-full bg-gradient-to-t from-purple-600 to-pink-600 opacity-[0.08] blur-[130px]" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
            <Github size={13} />
            GitHub Repositories
          </div>
          <h1 className="mb-3 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-4xl font-black tracking-tight text-transparent sm:text-5xl">
            Your Repositories
          </h1>
          <p className="text-sm text-gray-500">
            {total} {total === 1 ? "repository" : "repositories"} found
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 lg:gap-6">
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
          <div className="mt-10 flex items-center justify-center gap-3">
            {hasPrevPage ? (
              <Link
                href={`/dashboard?page=${page - 1}`}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                <ChevronLeft size={14} />
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
                href={`/dashboard?page=${page + 1}`}
                className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-gray-400 hover:bg-white/10 hover:text-white transition-all"
              >
                Next
                <ChevronRight size={14} />
              </Link>
            ) : (
              <div className="w-20" />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;

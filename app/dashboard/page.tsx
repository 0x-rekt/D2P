import { getRepositories } from "@/actions/repos";
import { RepoCard } from "@/components/RepoCard";
import { auth } from "@/lib/auth";
import {
  Github,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
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
      <section
        className="relative min-h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "#0B0A12" }}
      >
        <div
          className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(239,68,68,0.1), transparent 70%)",
            filter: "blur(120px)",
          }}
        />
        <div className="text-center space-y-4">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              border: "1px solid rgba(239,68,68,0.2)",
              backgroundColor: "rgba(239,68,68,0.08)",
            }}
          >
            <AlertCircle style={{ color: "#F87171" }} size={28} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#F8F7FA" }}>
            Something went wrong
          </h1>
          <p className="text-sm max-w-sm" style={{ color: "#8D8A9C" }}>
            {error}
          </p>
        </div>
      </section>
    );
  }

  if (!repositories || repositories.length === 0) {
    return (
      <section
        className="relative min-h-screen overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: "#0B0A12" }}
      >
        <div
          className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(124,58,237,0.15), transparent 70%)",
            filter: "blur(140px)",
          }}
        />
        <div className="text-center space-y-4">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.04)",
            }}
          >
            <Github style={{ color: "#8D8A9C" }} size={28} />
          </div>
          <h1 className="text-2xl font-bold" style={{ color: "#F8F7FA" }}>
            No Repositories Found
          </h1>
          <p className="text-sm max-w-sm" style={{ color: "#8D8A9C" }}>
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
    <section
      className="relative min-h-screen overflow-hidden py-16 sm:py-20"
      style={{ backgroundColor: "#0B0A12" }}
    >
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(124,58,237,0.18), rgba(168,85,247,0.08) 50%, transparent 70%)",
            filter: "blur(140px)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[800px] rounded-full"
          style={{
            background: "radial-gradient(ellipse, rgba(192,38,211,0.12), transparent 70%)",
            filter: "blur(130px)",
          }}
        />
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 sm:mb-14 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium"
            style={{
              border: "1px solid rgba(168,85,247,0.3)",
              backgroundColor: "rgba(168,85,247,0.08)",
              color: "#C084FC",
            }}
          >
            <Github size={13} />
            GitHub Repositories
          </div>
          <h1
            className="mb-3 text-4xl font-black tracking-tight sm:text-5xl gradient-text-primary"
          >
            Your Repositories
          </h1>
          <p className="text-sm" style={{ color: "#8D8A9C" }}>
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
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-all"
                style={{
                  border: "1px solid rgba(168,85,247,0.2)",
                  backgroundColor: "rgba(168,85,247,0.06)",
                  color: "#8D8A9C",
                }}
              >
                <ChevronLeft size={14} />
                Previous
              </Link>
            ) : (
              <div className="w-24" />
            )}
            <span className="text-xs" style={{ color: "#4B4866" }}>
              {page} / {totalPages}
            </span>
            {hasNextPage ? (
              <Link
                href={`/dashboard?page=${page + 1}`}
                className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs transition-all"
                style={{
                  border: "1px solid rgba(168,85,247,0.2)",
                  backgroundColor: "rgba(168,85,247,0.06)",
                  color: "#8D8A9C",
                }}
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

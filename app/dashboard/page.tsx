import { getRepositories } from "@/actions/repos";
import { RepoCard } from "@/components/RepoCard";
import { Badge } from "@/components/ui/badge";
import { Github, AlertCircle } from "lucide-react";

const Dashboard = async () => {
  const { success, repositories, error, count } = await getRepositories();

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
            {count} {count === 1 ? "repository" : "repositories"} found
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
      </div>
    </section>
  );
};

export default Dashboard;

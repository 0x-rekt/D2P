import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GitBranch, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import ConnectButton from "./ConnectButton";

type GithubRepo = {
  id: number;
  name: string;
  full_name: string;
  description: string;
  private: boolean;
  html_url: string;
  language: string | null;
  updated_at: string;
  default_branch: string;
  connectedRepoId: string | null;
};

interface RepoCardProps {
  repo: GithubRepo;
  isConnected: boolean;
}

const getLanguageColor = (language: string | null) => {
  const colors: Record<string, string> = {
    JavaScript: "bg-yellow-400",
    TypeScript: "bg-blue-500",
    Python: "bg-blue-400",
    Java: "bg-red-500",
    "C++": "bg-pink-500",
    Ruby: "bg-red-600",
    Go: "bg-cyan-400",
    Rust: "bg-orange-500",
    "Jupyter Notebook": "bg-orange-400",
  };
  return colors[language || ""] || "bg-gray-400";
};

export const RepoCard = ({ repo, isConnected }: RepoCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-4 sm:p-5 md:p-6 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="mb-3 sm:mb-4">
        <div className="mb-1 flex items-start justify-between gap-2 sm:mb-2">
          <h3 className="truncate text-base font-bold text-white group-hover:text-blue-400 transition-colors sm:text-lg md:text-xl">
            {repo.name}
          </h3>
          <Badge
            variant="outline"
            className={`shrink-0 text-xs ${
              repo.private
                ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                : "border-green-500/30 bg-green-500/10 text-green-400"
            }`}
          >
            {repo.private ? "Private" : "Public"}
          </Badge>
        </div>
        <p className="truncate text-xs text-gray-500 sm:text-sm">
          {repo.full_name}
        </p>
      </div>

      <p className="mb-4 line-clamp-2 min-h-8 text-xs leading-relaxed text-gray-400 sm:mb-5 sm:line-clamp-3 sm:min-h-10 sm:text-sm md:mb-6">
        {repo.description || "No description provided"}
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-gray-500 sm:gap-3 sm:mb-5 md:mb-6">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className={`h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}
            ></span>
            <span>{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{formatDate(repo.updated_at)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <GitBranch size={12} />
          <span>{repo.default_branch}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3">
        <ConnectButton repoId={repo.id} initialConnected={isConnected} />
        <div className="flex flex-wrap items-center gap-2">
          {isConnected && repo.connectedRepoId && (
            <Button
              size="sm"
              variant="outline"
              className="border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 hover:text-blue-300"
              asChild
            >
              <Link href={`/dashboard/repos/${repo.connectedRepoId}`}>
                Open dashboard
              </Link>
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
            asChild
          >
            <a
              href={repo.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
};

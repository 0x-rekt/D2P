import { Badge } from "@/components/ui/badge";
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

const languageColors: Record<string, string> = {
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

const getLanguageColor = (language: string | null) =>
  languageColors[language || ""] || "bg-gray-500";

export const RepoCard = ({ repo, isConnected }: RepoCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-gradient-to-b from-zinc-900/60 to-black/60 p-5 backdrop-blur-sm transition-all duration-300 hover:border-blue-500/25 hover:shadow-xl hover:shadow-blue-500/[0.08]">
      {/* Subtle top glow on hover */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3 className="truncate text-base font-bold text-white group-hover:text-blue-300 transition-colors">
          {repo.name}
        </h3>
        <Badge
          variant="outline"
          className={`shrink-0 text-[10px] font-medium ${
            repo.private
              ? "border-yellow-500/25 bg-yellow-500/10 text-yellow-400"
              : "border-green-500/25 bg-green-500/10 text-green-400"
          }`}
        >
          {repo.private ? "Private" : "Public"}
        </Badge>
      </div>

      <p className="mb-1 truncate text-[11px] text-gray-600">{repo.full_name}</p>

      {/* Description */}
      <p className="mb-4 line-clamp-2 min-h-[36px] flex-1 text-xs leading-relaxed text-gray-400">
        {repo.description || "No description provided"}
      </p>

      {/* Meta */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] text-gray-600">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${getLanguageColor(repo.language)}`} />
            {repo.language}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Clock size={11} />
          {formatDate(repo.updated_at)}
        </div>
        <div className="flex items-center gap-1">
          <GitBranch size={11} />
          {repo.default_branch}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <ConnectButton repoId={repo.id} initialConnected={isConnected} />

        <div className="flex items-center gap-2">
          {isConnected && repo.connectedRepoId && (
            <Link
              href={`/dashboard/repos/${repo.connectedRepoId}`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-500/25 bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-400 hover:bg-blue-500/20 hover:text-blue-300 transition-all"
            >
              Open Dashboard
            </Link>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-gray-400 hover:bg-white/10 hover:text-white transition-all"
          >
            <ExternalLink size={12} />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

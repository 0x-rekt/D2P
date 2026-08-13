"use client";

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
  JavaScript: "#F59E0B",
  TypeScript: "#6366F1",
  Python: "#22D3EE",
  Java: "#F87171",
  "C++": "#F472B6",
  Ruby: "#EF4444",
  Go: "#22D3A6",
  Rust: "#FB923C",
  "Jupyter Notebook": "#F59E0B",
};

const getLanguageColor = (language: string | null) =>
  languageColors[language || ""] || "#8D8A9C";

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
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl p-5 backdrop-blur-sm transition-all duration-300"
      style={{
        border: "1px solid rgba(255,255,255,0.06)",
        backgroundColor: "#141220",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(168,85,247,0.25)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 8px 40px rgba(168,85,247,0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.border =
          "1px solid rgba(255,255,255,0.06)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Subtle top glow on hover */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(168,85,247,0.5), rgba(236,72,153,0.3), transparent)",
        }}
      />

      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-2">
        <h3
          className="truncate text-base font-bold transition-colors group-hover:text-violet-300"
          style={{ color: "#F8F7FA" }}
        >
          {repo.name}
        </h3>
        <Badge
          variant="outline"
          className={`shrink-0 text-[10px] font-medium ${
            repo.private
              ? "border-yellow-500/25 bg-yellow-500/10 text-yellow-400"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
          }`}
        >
          {repo.private ? "Private" : "Public"}
        </Badge>
      </div>

      <p className="mb-1 truncate text-[11px]" style={{ color: "#4B4866" }}>
        {repo.full_name}
      </p>

      {/* Description */}
      <p
        className="mb-4 line-clamp-2 min-h-[36px] flex-1 text-xs leading-relaxed"
        style={{ color: "#8D8A9C" }}
      >
        {repo.description || "No description provided"}
      </p>

      {/* Meta */}
      <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px]" style={{ color: "#4B4866" }}>
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: getLanguageColor(repo.language) }}
            />
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
              href={`/dashboard/repos/${repo.connectedRepoId}/security`}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
              style={{
                border: "1px solid rgba(168,85,247,0.25)",
                backgroundColor: "rgba(168,85,247,0.08)",
                color: "#C084FC",
              }}
            >
              Open Dashboard
            </Link>
          )}
          <a
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              border: "1px solid rgba(255,255,255,0.07)",
              backgroundColor: "rgba(255,255,255,0.03)",
              color: "#8D8A9C",
            }}
          >
            <ExternalLink size={12} />
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
};

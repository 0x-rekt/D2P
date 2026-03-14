import { getPullRequests } from "@/actions/pulls";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  GitPullRequest,
  Clock,
  GitBranch,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Loader2,
  XCircle,
} from "lucide-react";

type PageProps = { params: Promise<{ repoId: string }> };

const reviewStatusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    class: "border-gray-500/30 bg-gray-500/10 text-gray-400",
  },
  reviewing: {
    label: "Reviewing",
    icon: Loader2,
    class: "border-blue-500/30 bg-blue-500/10 text-blue-400",
  },
  reviewed: {
    label: "Reviewed",
    icon: CheckCircle2,
    class: "border-green-500/30 bg-green-500/10 text-green-400",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    class: "border-red-500/30 bg-red-500/10 text-red-400",
  },
};
const RepoPage = async ({ params }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId } = await params;
  const { success, repo, pulls, error } = await getPullRequests(repoId);

  if (!success || !repo) {
    return (
      <section className="flex min-h-screen items-center justify-center bg-black">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
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

  return (
    <section className="relative min-h-screen overflow-hidden bg-black py-16">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-150 -translate-x-1/2 rounded-full bg-blue-500/10 blur-[120px]" />

      <div className="container mx-auto max-w-4xl px-6">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300"
          >
            ← Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white">
                {repo.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">{repo.fullName}</p>
            </div>
            <a
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-400 hover:bg-white/10 hover:text-white"
            >
              View on GitHub ↗
            </a>
          </div>
        </div>

        {/* PR list */}
        {pulls.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 py-24 text-center">
            <GitPullRequest className="mb-4 text-gray-600" size={48} />
            <h2 className="mb-2 text-lg font-semibold text-white">
              No pull requests yet
            </h2>
            <p className="text-sm text-gray-500">
              Open a PR on this repository and AI will automatically review it.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="mb-4 text-sm text-gray-500">
              {pulls.length} pull {pulls.length === 1 ? "request" : "requests"}
            </p>
            {pulls.map((pr) => {
              const status =
                reviewStatusConfig[
                  pr.reviewStatus as keyof typeof reviewStatusConfig
                ] ?? reviewStatusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <Link
                  key={pr.id}
                  href={`/dashboard/repos/${repoId}/pulls/${pr.id}`}
                  className="group flex items-center justify-between rounded-xl border border-white/10 bg-linear-to-b from-gray-900/50 to-black/50 p-5 backdrop-blur-sm transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
                >
                  <div className="flex items-start gap-4">
                    <GitPullRequest
                      size={20}
                      className="mt-0.5 shrink-0 text-green-400"
                    />
                    <div>
                      <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {pr.title}
                        <span className="ml-2 text-sm font-normal text-gray-500">
                          #{pr.prNumber}
                        </span>
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <GitBranch size={11} />
                          {pr.headBranch} → {pr.baseBranch}
                        </span>
                        <span>by {pr.authorLogin}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(pr.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {pr._count.suggestions > 0 && (
                          <span className="flex items-center gap-1 text-blue-400">
                            <Sparkles size={11} />
                            {pr._count.suggestions} suggestion
                            {pr._count.suggestions !== 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={`gap-1.5 ${status.class}`}
                    >
                      <StatusIcon
                        size={11}
                        className={
                          pr.reviewStatus === "reviewing" ? "animate-spin" : ""
                        }
                      />
                      {status.label}
                    </Badge>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default RepoPage;

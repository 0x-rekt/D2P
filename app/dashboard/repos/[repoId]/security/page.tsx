import {
  getSecurityFindings,
  getCurrentSecurityScore,
} from "@/actions/security";
import { SecurityFixPrButton } from "@/components/SecurityFixPrButton";
import { SecurityStatusWatcher } from "@/components/SecurityStatusWatcher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SecurityFindingCard } from "@/components/SecurityFindingCard";
import {
  Shield,
  ChevronLeft,
  ExternalLink,
  GitPullRequest,
  Activity,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

type PageProps = {
  params: Promise<{ repoId: string }>;
  searchParams: Promise<{ status?: string; sort?: string }>;
};

interface SecurityFinding {
  id: string;
  findingType: "secret" | "cve" | "owasp";
  severity: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  filePath?: string;
  lineNumber?: number;
  cveId?: string;
  cvssScore?: number;
  status: "open" | "fixed" | "ignored" | "false_positive";
  createdAt: Date;
  pullRequestId?: string;
  fixable?: boolean;
  fixType?: string | null;
  fixDetails?: string | null;
  packageName?: string | null;
  packageVersion?: string | null;
  pullRequest?: {
    prNumber: number;
    title: string;
  };
}

interface SecurityScore {
  overallScore: number;
  secretScore: number;
  cveScore: number;
  owaslScore: number;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  scoredAt: Date;
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "border-red-500/30 bg-red-500/10 text-red-400";
    case "high":
      return "border-orange-500/30 bg-orange-500/10 text-orange-400";
    case "medium":
      return "border-yellow-500/30 bg-yellow-500/10 text-yellow-400";
    case "low":
      return "border-blue-500/30 bg-blue-500/10 text-blue-400";
    default:
      return "border-gray-500/30 bg-gray-500/10 text-gray-400";
  }
};

const SecurityInsightsPage = async ({ params, searchParams }: PageProps) => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  const { repoId } = await params;
  const { status: statusFilter = "all", sort: sortBy = "severity" } =
    await searchParams;

  try {
    const [findingsData, scoreData] = await Promise.all([
      getSecurityFindings(repoId).catch(() => []),
      getCurrentSecurityScore(repoId).catch(() => null),
    ]);

    const findings = (findingsData as SecurityFinding[]) || [];
    const score = (scoreData as SecurityScore | null) || null;
    const fixableDependencyFindingIds = findings
      .filter((finding) => finding.findingType === "cve" && finding.fixable)
      .map((finding) => finding.id);

    // Get repo info from first finding or fallback
    const repoName = findings[0]?.pullRequest?.title || "Repository";

    // Filter findings
    const filteredFindings = findings
      .filter(
        (f) =>
          statusFilter === "all" ||
          (statusFilter === "open" && f.status === "open") ||
          (statusFilter === "fixed" && f.status === "fixed"),
      )
      .sort((a, b) => {
        if (sortBy === "severity") {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const orderA =
            severityOrder[a.severity as keyof typeof severityOrder] || 4;
          const orderB =
            severityOrder[b.severity as keyof typeof severityOrder] || 4;
          return orderA - orderB;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });

    // Count by type
    const findingsByType = {
      secret: findings.filter((f) => f.findingType === "secret").length,
      cve: findings.filter((f) => f.findingType === "cve").length,
      owasp: findings.filter((f) => f.findingType === "owasp").length,
    };

    return (
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] py-14 sm:py-20">
        <SecurityStatusWatcher
          repoId={repoId}
          initialScoredAt={
            score?.scoredAt ? new Date(score.scoredAt).toISOString() : null
          }
        />
        {/* Background glows */}
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-blue-600 to-blue-900 opacity-10 blur-[140px]" />
        <div className="pointer-events-none absolute bottom-1/4 right-1/4 -z-10 h-[500px] w-[800px] rounded-full bg-gradient-to-t from-blue-600 to-purple-600 opacity-[0.07] blur-[130px]" />

        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <Link
            href={`/dashboard/repos/${repoId}`}
            className="mb-6 inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors"
          >
            <ChevronLeft size={13} />
            Repository
          </Link>

          {/* Header */}
          <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                  <Shield size={15} className="text-blue-400" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Security Insights
                </h1>
              </div>
              <p className="mt-1 truncate text-xs text-gray-600 pl-10">
                Security analysis and vulnerability findings
              </p>
            </div>
          </div>

          {fixableDependencyFindingIds.length > 0 && (
            <div className="mb-8">
              <SecurityFixPrButton
                repoId={repoId}
                findingIds={fixableDependencyFindingIds}
              />
            </div>
          )}

          {/* Security Score Cards */}
          {score && (
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Overall Score */}
              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-medium text-gray-400">
                    Overall Score
                  </h3>
                  <TrendingUp size={14} className="text-blue-400" />
                </div>
                <div className="text-4xl font-black text-white mb-1">
                  {score.overallScore}
                </div>
                <div className="text-xs text-gray-500">
                  {score.overallScore >= 80
                    ? "Excellent"
                    : score.overallScore >= 60
                      ? "Good"
                      : "Needs Attention"}
                </div>
              </div>

              {/* Secrets Score */}
              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="text-xs font-medium text-gray-400 mb-3">
                  🔑 Secrets
                </div>
                <div className="text-4xl font-black text-white mb-1">
                  {score.secretScore}
                </div>
                <div className="text-[10px] text-gray-500">
                  {findingsByType.secret} potential leaks
                </div>
              </div>

              {/* CVE Score */}
              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="text-xs font-medium text-gray-400 mb-3">
                  📦 Dependencies
                </div>
                <div className="text-4xl font-black text-white mb-1">
                  {score.cveScore}
                </div>
                <div className="text-[10px] text-gray-500">
                  {findingsByType.cve} CVE findings
                </div>
              </div>

              {/* OWASP Score */}
              <div className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
                <div className="text-xs font-medium text-gray-400 mb-3">
                  ⚠️ OWASP Issues
                </div>
                <div className="text-4xl font-black text-white mb-1">
                  {score.owaslScore}
                </div>
                <div className="text-[10px] text-gray-500">
                  {findingsByType.owasp} code issues
                </div>
              </div>
            </div>
          )}

          {/* Severity Summary */}
          <div className="mb-10 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-white mb-4">
              Findings by Severity
            </h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-red-400 mb-1">
                  {findings.filter((f) => f.severity === "critical").length}
                </div>
                <div className="text-xs text-red-600">Critical 🔴</div>
              </div>
              <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">
                  {findings.filter((f) => f.severity === "high").length}
                </div>
                <div className="text-xs text-orange-600">High 🟠</div>
              </div>
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">
                  {findings.filter((f) => f.severity === "medium").length}
                </div>
                <div className="text-xs text-yellow-600">Medium 🟡</div>
              </div>
              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">
                  {findings.filter((f) => f.severity === "low").length}
                </div>
                <div className="text-xs text-blue-600">Low 🟢</div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Filter:</span>
              <div className="flex gap-2 flex-wrap">
                {["all", "open", "fixed"].map((s) => (
                  <Link
                    key={s}
                    href={`?status=${s}&sort=${sortBy}`}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      statusFilter === s
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        : "border-white/10 bg-white/[0.05] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Sort:</span>
              <div className="flex gap-2">
                {["severity", "date"].map((s) => (
                  <Link
                    key={s}
                    href={`?status=${statusFilter}&sort=${s}`}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                      sortBy === s
                        ? "border-blue-500/30 bg-blue-500/10 text-blue-400"
                        : "border-white/10 bg-white/[0.05] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    {s === "severity" ? "Severity" : "Date"}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Findings List */}
          {filteredFindings.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.02] py-24 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                <CheckCircle2 className="text-green-400" size={22} />
              </div>
              <h2 className="mb-2 text-base font-semibold text-white">
                All Secure!
              </h2>
              <p className="text-xs text-gray-500 max-w-xs">
                {statusFilter === "all"
                  ? "No security findings detected for this repository."
                  : `No ${statusFilter} findings to display.`}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-gray-600 mb-4">
                {filteredFindings.length} finding
                {filteredFindings.length !== 1 ? "s" : ""} found
              </p>

              {filteredFindings.map((finding) => (
                <SecurityFindingCard
                  key={finding.id}
                  {...finding}
                  repoId={repoId}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    );
  } catch (error) {
    console.error("Error loading security insights:", error);
    return (
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#030303] via-[#0a0e27] to-[#030303] py-14 sm:py-20">
        <div className="pointer-events-none absolute left-1/4 top-0 -z-10 h-[600px] w-[900px] rounded-full bg-gradient-to-b from-blue-600 to-blue-900 opacity-10 blur-[140px]" />
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10 py-24 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-red-500/20 bg-red-500/10">
              <AlertCircle className="text-red-400" size={22} />
            </div>
            <p className="text-gray-400 text-sm">
              Failed to load security insights
            </p>
            <Link
              href="/dashboard"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <ChevronLeft size={13} />
              Back to dashboard
            </Link>
          </div>
        </div>
      </section>
    );
  }
};

export default SecurityInsightsPage;

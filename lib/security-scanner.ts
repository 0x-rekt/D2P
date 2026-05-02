import prisma from "@/lib/prisma";
import axios from "axios";
import { scanDiffForSecrets } from "@/lib/secrets-scanner";
import {
  scanDependenciesForCVEs,
  calculateComprehensiveSecurityScore,
} from "@/lib/cve-query";
import { scanDiffForOWASP } from "@/lib/owasp-scanner";
import {
  verifyOWASPFindingsWithAI,
  filterVerifiedFindings,
  correlateOWASPWithCVEUsingAI,
} from "@/lib/ai-security-review";

export type SecurityScanResult = {
  prNumber: number;
  repoId: string;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
  totalFindings: number;
  shouldBlockMerge: boolean;
  findings: {
    secrets: any[];
    cves: any[];
    owaslPatterns: any[];
  };
  timestamp: Date;
};

export const runSecurityScan = async (
  repoId: string,
  prNumber: number,
  accessToken: string,
  repoFullName: string,
): Promise<SecurityScanResult> => {
  console.log(`[Security Scan] Starting scan for ${repoFullName}#${prNumber}`);

  const diff = await fetchDiff(accessToken, repoFullName, prNumber);

  const packageJsonContent = await fetchPackageJson(
    accessToken,
    repoFullName,
    prNumber,
  );

  console.log(`[Security Scan] Scanning for secrets...`);
  const secretFindings = scanDiffForSecrets(diff);

  console.log(`[Security Scan] Scanning dependencies for CVEs...`);
  let cveFindings: any[] = [];
  if (packageJsonContent) {
    const cves = await scanDependenciesForCVEs(packageJsonContent);
    cveFindings = cves.map((cve) => ({
      findingType: "cve",
      severity: cve.severity,
      title: `${cve.cveId} in ${cve.packageName}@${cve.packageVersion}`,
      description: cve.description,
      cveId: cve.cveId,
      cvssScore: cve.cvssScore,
      packageName: cve.packageName,
      packageVersion: cve.packageVersion,
      fixable: cve.fixedVersions && cve.fixedVersions.length > 0,
      fixDetails: JSON.stringify({
        affectedVersions: cve.affectedVersions,
        fixedVersions: cve.fixedVersions,
      }),
    }));
  }

  console.log(`[Security Scan] Scanning for OWASP patterns...`);
  const owaspPatterns = scanDiffForOWASP(diff);

  console.log(
    `[Security Scan] Verifying OWASP findings with AI (${owaspPatterns.length} candidates)...`,
  );
  const verifiedFindings = await verifyOWASPFindingsWithAI(owaspPatterns, diff);
  const filteredOWASPFindings = filterVerifiedFindings(verifiedFindings, 0.6);

  console.log(
    `[Security Scan] AI verification reduced OWASP findings from ${owaspPatterns.length} to ${filteredOWASPFindings.length}`,
  );

  console.log(
    `[Security Scan] Correlating verified OWASP findings with CVEs using AI...`,
  );
  const correlatedOWASPFindings = await correlateOWASPWithCVEUsingAI(
    filteredOWASPFindings,
    cveFindings,
    diff,
  );

  console.log(
    `[Security Scan] Identified ${correlatedOWASPFindings.filter((f) => f.relatedCVEs && f.relatedCVEs.length > 0).length} verified OWASP findings with related CVEs`,
  );

  const findingsBySeverity = countFindingsBySeverity({
    secrets: secretFindings,
    cves: cveFindings,
    owaslPatterns: correlatedOWASPFindings,
  });

  const totalFindings =
    findingsBySeverity.critical +
    findingsBySeverity.high +
    findingsBySeverity.medium +
    findingsBySeverity.low;

  const shouldBlockMerge =
    findingsBySeverity.critical > 0 ||
    cveFindings.some(
      (cve) => cve.severity === "critical" && cve.cvssScore >= 9,
    );

  console.log(
    `[Security Scan] Found: ${findingsBySeverity.critical} critical, ${findingsBySeverity.high} high, ${findingsBySeverity.medium} medium, ${findingsBySeverity.low} low`,
  );
  console.log(`[Security Scan] Merge should be blocked: ${shouldBlockMerge}`);

  await storeSecurityFindings(
    repoId,
    prNumber,
    {
      secrets: secretFindings,
      cves: cveFindings,
      owaslPatterns: correlatedOWASPFindings,
    },
    findingsBySeverity,
  );

  await updateRepositorySecurityScore(repoId, {
    secrets: secretFindings,
    cves: cveFindings.map((cve) => ({
      severity: cve.severity,
      cvssScore: cve.cvssScore,
    })),
    owasp: correlatedOWASPFindings,
  });

  const result: SecurityScanResult = {
    prNumber,
    repoId,
    criticalFindings: findingsBySeverity.critical,
    highFindings: findingsBySeverity.high,
    mediumFindings: findingsBySeverity.medium,
    lowFindings: findingsBySeverity.low,
    totalFindings,
    shouldBlockMerge,
    findings: {
      secrets: secretFindings,
      cves: cveFindings,
      owaslPatterns: correlatedOWASPFindings,
    },
    timestamp: new Date(),
  };

  return result;
};

async function fetchDiff(
  accessToken: string,
  repoFullName: string,
  prNumber: number,
): Promise<string> {
  try {
    const { data } = await axios.get<string>(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`,
      {
        headers: {
          authorization: `token ${accessToken}`,
          accept: "application/vnd.github.v3.diff",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        maxContentLength: 500000,
      },
    );
    return data;
  } catch (error) {
    console.error(
      `Failed to fetch diff for ${repoFullName}#${prNumber}:`,
      error,
    );
    return "";
  }
}

async function fetchPackageJson(
  accessToken: string,
  repoFullName: string,
  prNumber: number,
): Promise<string | null> {
  try {
    const prResponse = await axios.get(
      `https://api.github.com/repos/${repoFullName}/pulls/${prNumber}`,
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    const headRef = prResponse.data.head.ref;

    const fileResponse = await axios.get(
      `https://api.github.com/repos/${repoFullName}/contents/package.json?ref=${headRef}`,
      {
        headers: {
          authorization: `token ${accessToken}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    return Buffer.from(fileResponse.data.content, "base64").toString("utf-8");
  } catch (error) {
    console.error(`Failed to fetch package.json:`, error);
    return null;
  }
}

function countFindingsBySeverity(findings: {
  secrets: any[];
  cves: any[];
  owaslPatterns: any[];
}): { critical: number; high: number; medium: number; low: number } {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  findings.secrets.forEach((secret) => {
    if (secret.severity === "critical") counts.critical++;
    else if (secret.severity === "high") counts.high++;
  });

  findings.cves.forEach((cve) => {
    if (cve.severity === "critical") counts.critical++;
    else if (cve.severity === "high") counts.high++;
    else if (cve.severity === "medium") counts.medium++;
    else if (cve.severity === "low") counts.low++;
  });

  findings.owaslPatterns.forEach((pattern) => {
    if (pattern.severity === "critical") counts.critical++;
    else if (pattern.severity === "high") counts.high++;
    else if (pattern.severity === "medium") counts.medium++;
    else if (pattern.severity === "low") counts.low++;
  });

  return counts;
}

async function storeSecurityFindings(
  repoId: string,
  prNumber: number,
  findings: {
    secrets: any[];
    cves: any[];
    owaslPatterns: any[];
  },
  counts: { critical: number; high: number; medium: number; low: number },
) {
  try {
    const pr = await prisma.pullRequest.findFirst({
      where: {
        repositoryId: repoId,
        prNumber,
      },
    });

    if (!pr) {
      console.error(`PR not found: ${repoId}#${prNumber}`);
      return;
    }

    for (const secret of findings.secrets) {
      await prisma.securityFinding.create({
        data: {
          prNumber,
          commitSha: "",
          findingType: "secret",
          severity: secret.severity,
          title: `Hardcoded ${secret.type}`,
          description: secret.description,
          filePath: secret.filePath,
          lineNumber: secret.lineNumber,
          fixable: true,
          fixType: "secret_rotation",
          repositoryId: repoId,
          pullRequestId: pr.id,
        },
      });
    }

    for (const cve of findings.cves) {
      await prisma.securityFinding.create({
        data: {
          prNumber,
          commitSha: "",
          findingType: "cve",
          severity: cve.severity,
          title: cve.title,
          description: cve.description,
          cveId: cve.cveId,
          cvssScore: cve.cvssScore,
          packageName: cve.packageName,
          packageVersion: cve.packageVersion,
          fixable: cve.fixable,
          fixType: cve.fixable ? "dependency_upgrade" : undefined,
          fixDetails: cve.fixDetails,
          repositoryId: repoId,
          pullRequestId: pr.id,
        },
      });
    }

    for (const pattern of findings.owaslPatterns) {
      await prisma.securityFinding.create({
        data: {
          prNumber,
          commitSha: "",
          findingType: "owasp",
          severity: pattern.severity,
          title: pattern.title,
          description: pattern.description,
          filePath: pattern.filePath,
          lineNumber: pattern.lineNumber,
          fixable: false,
          fixDetails: JSON.stringify({
            suggestions: pattern.suggestions,
            codeSnippet: pattern.codeSnippet,
          }),
          repositoryId: repoId,
          pullRequestId: pr.id,
        },
      });
    }

    console.log(
      `[Security Scan] Stored ${findings.secrets.length + findings.cves.length + findings.owaslPatterns.length} findings`,
    );
  } catch (error) {
    console.error(`Failed to store security findings:`, error);
  }
}

async function updateRepositorySecurityScore(
  repoId: string,
  findings: {
    secrets: Array<{ severity: "critical" | "high"; description: string }>;
    cves: Array<{
      severity: "critical" | "high" | "medium" | "low";
      cvssScore: number;
    }>;
    owasp: Array<{
      severity: "critical" | "high" | "medium";
      cvssScore?: number;
    }>;
  },
) {
  try {
    const scoreBreakdown = calculateComprehensiveSecurityScore({
      secrets: findings.secrets,
      cves: findings.cves,
      owasp: findings.owasp,
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingScore = await prisma.repositorySecurityScore.findFirst({
      where: {
        repositoryId: repoId,
        scoredAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (existingScore) {
      await prisma.repositorySecurityScore.update({
        where: { id: existingScore.id },
        data: {
          overallScore: scoreBreakdown.overallScore,
          secretScore: scoreBreakdown.secretScore,
          cveScore: scoreBreakdown.cveScore,
          owaslScore: scoreBreakdown.owaspScore,
          criticalFindings: scoreBreakdown.criticalFindings,
          highFindings: scoreBreakdown.highFindings,
          mediumFindings: scoreBreakdown.mediumFindings,
          lowFindings: scoreBreakdown.lowFindings,
          previousScore: existingScore.overallScore,
        },
      });

      console.log(
        `[Security Scan] Updated today's security score for repo ${repoId}: overall=${scoreBreakdown.overallScore} secret=${scoreBreakdown.secretScore} cve=${scoreBreakdown.cveScore} owasp=${scoreBreakdown.owaspScore}`,
      );
    } else {
      await prisma.repositorySecurityScore.create({
        data: {
          repositoryId: repoId,
          overallScore: scoreBreakdown.overallScore,
          secretScore: scoreBreakdown.secretScore,
          cveScore: scoreBreakdown.cveScore,
          owaslScore: scoreBreakdown.owaspScore,
          criticalFindings: scoreBreakdown.criticalFindings,
          highFindings: scoreBreakdown.highFindings,
          mediumFindings: scoreBreakdown.mediumFindings,
          lowFindings: scoreBreakdown.lowFindings,
        },
      });

      console.log(
        `[Security Scan] Created new security score for repo ${repoId}: overall=${scoreBreakdown.overallScore} secret=${scoreBreakdown.secretScore} cve=${scoreBreakdown.cveScore} owasp=${scoreBreakdown.owaspScore}`,
      );
    }
  } catch (error) {
    console.error(`Failed to update security score:`, error);
  }
}

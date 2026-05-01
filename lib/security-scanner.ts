import prisma from "@/lib/prisma";
import axios from "axios";
import { scanDiffForSecrets } from "@/lib/secrets-scanner";
import { scanDependenciesForCVEs } from "@/lib/cve-query";
import { scanDiffForOWASP, correlateOWASPWithCVE } from "@/lib/owasp-scanner";

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

/**
 * Main security scanning agent - orchestrates all security checks
 * Called when PR is opened or synchronized
 */
export const runSecurityScan = async (
  repoId: string,
  prNumber: number,
  accessToken: string,
  repoFullName: string,
): Promise<SecurityScanResult> => {
  console.log(`[Security Scan] Starting scan for ${repoFullName}#${prNumber}`);

  // Step 1: Fetch diff
  const diff = await fetchDiff(accessToken, repoFullName, prNumber);

  // Step 2: Fetch package.json content
  const packageJsonContent = await fetchPackageJson(
    accessToken,
    repoFullName,
    prNumber,
  );

  // Step 3: Scan for secrets
  console.log(`[Security Scan] Scanning for secrets...`);
  const secretFindings = scanDiffForSecrets(diff);

  // Step 4: Scan dependencies for CVEs
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

  // Step 5: Scan for OWASP patterns
  console.log(`[Security Scan] Scanning for OWASP patterns...`);
  const owaspPatterns = scanDiffForOWASP(diff);

  // Step 6: Cross-reference findings (e.g., SQL injection with ORM CVEs)
  console.log(`[Security Scan] Correlating OWASP findings with CVEs...`);
  const correlatedFindings = correlateOWASPWithCVE(owaspPatterns, cveFindings);

  // Step 7: Count findings by severity
  const findingsBySeverity = countFindingsBySeverity({
    secrets: secretFindings,
    cves: cveFindings,
    owaslPatterns: correlatedFindings,
  });

  const totalFindings =
    findingsBySeverity.critical +
    findingsBySeverity.high +
    findingsBySeverity.medium +
    findingsBySeverity.low;

  // Step 8: Determine if merge should be blocked
  const shouldBlockMerge =
    findingsBySeverity.critical > 0 ||
    cveFindings.some(
      (cve) => cve.severity === "critical" && cve.cvssScore >= 9,
    );

  console.log(
    `[Security Scan] Found: ${findingsBySeverity.critical} critical, ${findingsBySeverity.high} high, ${findingsBySeverity.medium} medium, ${findingsBySeverity.low} low`,
  );
  console.log(`[Security Scan] Merge should be blocked: ${shouldBlockMerge}`);

  // Step 9: Store findings in database
  await storeSecurityFindings(
    repoId,
    prNumber,
    {
      secrets: secretFindings,
      cves: cveFindings,
      owaslPatterns: correlatedFindings,
    },
    findingsBySeverity,
  );

  // Step 10: Update repository security score
  await updateRepositorySecurityScore(repoId, findingsBySeverity);

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
      owaslPatterns: correlatedFindings,
    },
    timestamp: new Date(),
  };

  return result;
};

/**
 * Fetch PR diff from GitHub
 */
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

/**
 * Fetch package.json from the PR branch
 */
async function fetchPackageJson(
  accessToken: string,
  repoFullName: string,
  prNumber: number,
): Promise<string | null> {
  try {
    // Get PR details to find the head ref
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

    // Fetch package.json from that branch
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

/**
 * Count findings by severity level
 */
function countFindingsBySeverity(findings: {
  secrets: any[];
  cves: any[];
  owaslPatterns: any[];
}): { critical: number; high: number; medium: number; low: number } {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  // Count secrets (all critical or high)
  findings.secrets.forEach((secret) => {
    if (secret.severity === "critical") counts.critical++;
    else if (secret.severity === "high") counts.high++;
  });

  // Count CVEs
  findings.cves.forEach((cve) => {
    if (cve.severity === "critical") counts.critical++;
    else if (cve.severity === "high") counts.high++;
    else if (cve.severity === "medium") counts.medium++;
    else if (cve.severity === "low") counts.low++;
  });

  // Count OWASP patterns
  findings.owaslPatterns.forEach((pattern) => {
    if (pattern.severity === "critical") counts.critical++;
    else if (pattern.severity === "high") counts.high++;
    else if (pattern.severity === "medium") counts.medium++;
    else if (pattern.severity === "low") counts.low++;
  });

  return counts;
}

/**
 * Store security findings in database
 */
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
    // Get the PR from database
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

    // Store secret findings
    for (const secret of findings.secrets) {
      await prisma.securityFinding.create({
        data: {
          prNumber,
          commitSha: "", // Will be updated when available
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

    // Store CVE findings
    for (const cve of findings.cves) {
      await prisma.securityFinding.create({
        data: {
          prNumber,
          commitSha: "", // Will be updated when available
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

    // Store OWASP findings
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
          fixable: false, // OWASP patterns require manual review
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

/**
 * Update repository security score
 */
async function updateRepositorySecurityScore(
  repoId: string,
  counts: { critical: number; high: number; medium: number; low: number },
) {
  try {
    const score =
      100 -
      counts.critical * 30 -
      counts.high * 15 -
      counts.medium * 5 -
      counts.low * 1;

    await prisma.repositorySecurityScore.create({
      data: {
        repositoryId: repoId,
        overallScore: Math.max(0, score),
        secretScore: 100, // Will be refined based on actual findings
        cveScore: 100,
        owaslScore: 100,
        criticalFindings: counts.critical,
        highFindings: counts.high,
        mediumFindings: counts.medium,
        lowFindings: counts.low,
      },
    });

    console.log(
      `[Security Scan] Updated security score for repo ${repoId}: ${Math.max(0, score)}`,
    );
  } catch (error) {
    console.error(`Failed to update security score:`, error);
  }
}

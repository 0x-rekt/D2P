export type SecretFinding = {
  type: string; // e.g., "aws_key", "github_token", "private_key", "api_key"
  value: string; // masked value
  lineNumber?: number;
  filePath?: string;
  severity: "critical" | "high";
  description: string;
};

// Comprehensive patterns for different secret types
const SECRET_PATTERNS = {
  aws_access_key: {
    pattern:
      /AKIA[0-9A-Z]{16}|aws_access_key_id\s*[=:]\s*['\"]?([A-Za-z0-9/+=]+)['\"]?/gi,
    type: "aws_access_key",
    severity: "critical" as const,
    description: "Potential AWS Access Key ID found",
  },
  aws_secret_key: {
    pattern:
      /aws_secret_access_key\s*[=:]\s*['\"]?([A-Za-z0-9/+=]{40})['\"]?/gi,
    type: "aws_secret_key",
    severity: "critical" as const,
    description: "Potential AWS Secret Access Key found",
  },
  github_token: {
    pattern: /gh[pousr]{1}_[A-Za-z0-9_]{36,255}/g,
    type: "github_token",
    severity: "critical" as const,
    description: "Potential GitHub Personal Access Token found",
  },
  github_pat: {
    pattern:
      /(github_token|GH_TOKEN|GITHUB_TOKEN)\s*[=:]\s*['\"]?([A-Za-z0-9]{36,})['\"]?/gi,
    type: "github_token",
    severity: "critical" as const,
    description: "Potential GitHub token in environment variable",
  },
  private_key: {
    pattern: /(-----BEGIN RSA PRIVATE KEY-----|-----BEGIN PRIVATE KEY-----)/g,
    type: "private_key",
    severity: "critical" as const,
    description: "Private key found in code",
  },
  docker_registry_auth: {
    pattern: /[A-Za-z0-9+/]{20,}={0,2}\/\/docker\.io/g,
    type: "docker_auth",
    severity: "high" as const,
    description: "Potential Docker registry authentication token",
  },
  npm_token: {
    pattern: /(npm_token|NPM_TOKEN)\s*[=:]\s*['\"]?([A-Za-z0-9]{36,})['\"]?/gi,
    type: "npm_token",
    severity: "high" as const,
    description: "Potential NPM authentication token",
  },
  slack_webhook: {
    pattern:
      /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9]{11}\/[A-Z0-9]{11}\/[A-Za-z0-9]{24}/g,
    type: "slack_webhook",
    severity: "high" as const,
    description: "Slack webhook URL found",
  },
  api_key: {
    pattern:
      /(api_key|API_KEY|apikey)\s*[=:]\s*['\"]?([A-Za-z0-9]{32,})['\"]?/gi,
    type: "api_key",
    severity: "high" as const,
    description: "Potential API key found",
  },
  jwt_token: {
    pattern:
      /eyJ[A-Za-z0-9_-]{10,}\.eyJ[A-Za-z0-9_-]{10,}\.(?:[A-Za-z0-9_-]{10,})?/g,
    type: "jwt_token",
    severity: "high" as const,
    description: "Potential JWT token found",
  },
  password_assignment: {
    pattern:
      /(password|pwd|passwd)\s*[=:]\s*['\"]([^'\"]{8,})['\"](?!\s*-\s*|;)/gi,
    type: "password",
    severity: "critical" as const,
    description: "Hardcoded password found",
  },
};

/**
 * Scan a diff or code snippet for hardcoded secrets
 */
export const scanForSecrets = (
  content: string,
  filePath?: string,
): SecretFinding[] => {
  const findings: SecretFinding[] = [];
  const lines = content.split("\n");

  // Skip common non-secret files
  if (filePath && shouldSkipFile(filePath)) {
    return findings;
  }

  Object.values(SECRET_PATTERNS).forEach((patternConfig) => {
    lines.forEach((line, lineIndex) => {
      // Skip common false positives
      if (shouldSkipLine(line)) return;

      const matches = line.matchAll(patternConfig.pattern);
      for (const match of matches) {
        // Skip test/example values
        if (isTestValue(match[0])) continue;

        findings.push({
          type: patternConfig.type,
          value: maskValue(match[0]),
          lineNumber: lineIndex + 1,
          filePath,
          severity: patternConfig.severity,
          description: patternConfig.description,
        });
      }
    });
  });

  return findings;
};

/**
 * Scan a GitHub PR diff for secrets
 */
export const scanDiffForSecrets = (
  diff: string,
): Array<SecretFinding & { filePath: string; lineNumber: number }> => {
  const findings: Array<
    SecretFinding & { filePath: string; lineNumber: number }
  > = [];
  const lines = diff.split("\n");

  let currentFile = "";
  let lineNumber = 0;

  lines.forEach((line) => {
    // Track current file from diff header
    if (line.startsWith("+++") || line.startsWith("---")) {
      currentFile = line.replace(/^[+-]{3}\s+[ab]\//, "").trim();
      if (shouldSkipFile(currentFile)) {
        currentFile = ""; // Mark as skipped
      }
    }

    // Only scan added/modified lines (starting with +, not +++)
    if (line.startsWith("+") && !line.startsWith("+++") && currentFile) {
      const contentLine = line.substring(1);
      lineNumber++;

      const secretFindings = scanForSecrets(contentLine, currentFile);
      findings.push(
        ...secretFindings.map((f) => ({
          ...f,
          filePath: currentFile,
          lineNumber,
        })),
      );
    }
  });

  return findings;
};

/**
 * Check if file should be skipped from secret scanning
 */
function shouldSkipFile(filePath: string): boolean {
  const skipPatterns = [
    /\.md$/i,
    /\.txt$/i,
    /package-lock\.json$/i,
    /yarn\.lock$/i,
    /\.example$/i,
    /test\/fixtures/i,
    /\.test\.ts$/i,
    /\.spec\.ts$/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

/**
 * Check if line should be skipped (comments, examples, etc)
 */
function shouldSkipLine(line: string): boolean {
  const skipPatterns = [
    /\/\//,
    /\/\*/,
    /\*\//,
    /#/,
    /example/i,
    /test/i,
    /fake/i,
    /mock/i,
    /demo/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(line));
}

/**
 * Check if value is a test/example value
 */
function isTestValue(value: string): boolean {
  const testPatterns = [
    /^test.*test$/i,
    /^mock/i,
    /^example/i,
    /^fake/i,
    /^12345/,
    /^test@test/i,
  ];

  return testPatterns.some((pattern) => pattern.test(value));
}

/**
 * Mask sensitive parts of a secret
 */
function maskValue(value: string): string {
  if (value.length <= 8) {
    return "***";
  }

  const visible = Math.ceil(value.length / 4);
  return (
    value.substring(0, visible) + "***" + value.substring(value.length - 2)
  );
}

export type SecretFinding = {
  type: string;
  value: string;
  lineNumber?: number;
  filePath?: string;
  severity: "critical" | "high";
  description: string;
};

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
    severity: "critical" as const,
    description: "Hardcoded API key found - potential credential compromise",
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

export const scanForSecrets = (
  content: string,
  filePath?: string,
): SecretFinding[] => {
  const findings: SecretFinding[] = [];
  const lines = content.split("\n");

  if (filePath && shouldSkipFile(filePath)) {
    return findings;
  }

  Object.values(SECRET_PATTERNS).forEach((patternConfig) => {
    lines.forEach((line, lineIndex) => {
      if (shouldSkipLine(line)) return;

      const matches = line.matchAll(patternConfig.pattern);
      for (const match of matches) {
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
    if (line.startsWith("+++") || line.startsWith("---")) {
      currentFile = line.replace(/^[+-]{3}\s+[ab]\/(.+)$/, "$1");
      if (shouldSkipFile(currentFile)) {
        currentFile = "";
      }
    }

    if (line.startsWith("+") && !line.startsWith("+++") && currentFile) {
      const contentLine = line.substring(1);
      lineNumber++;

      const regexFindings = scanForSecrets(contentLine, currentFile);
      findings.push(
        ...regexFindings.map((f) => ({
          ...f,
          filePath: currentFile,
          lineNumber,
        })),
      );

      if (!shouldSkipFileForEntropy(currentFile)) {
        const entropyFindings = scanForHighEntropySecrets(
          contentLine,
          currentFile,
          lineNumber,
        );
        findings.push(...entropyFindings);
      }
    }
  });

  return findings;
};

function calculateShannonEntropy(str: string): number {
  const length = str.length;
  if (length === 0) return 0;

  const frequencies: Record<string, number> = {};
  for (const char of str) {
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  for (const count of Object.values(frequencies)) {
    const probability = count / length;
    entropy -= probability * Math.log2(probability);
  }

  return entropy;
}

function extractCandidateSecrets(
  line: string,
): Array<{ value: string; start: number }> {
  const candidates: Array<{ value: string; start: number }> = [];

  const tokenPattern = /[A-Za-z0-9_\-\.]{20,256}/g;
  let match;

  while ((match = tokenPattern.exec(line)) !== null) {
    const token = match[0];
    const entropy = calculateShannonEntropy(token);

    if (entropy > 4.0 && !isLikelyFalsePositive(token)) {
      candidates.push({
        value: token,
        start: match.index,
      });
    }
  }

  return candidates;
}

function isLikelyFalsePositive(token: string): boolean {
  const patterns = [
    /^test/i,
    /^example/i,
    /^fake/i,
    /^mock/i,
    /^demo/i,
    /^placeholder/i,
    /^[0]{8,}/,
    /^[1]{8,}/,
    /^[a]{8,}/,
    /^localhost/i,
    /^127\.0\.0\.1/,
    /^0\.0\.0\.0/,
    /node_modules/i,
    /dist\/|build\/|out\//,
  ];

  return patterns.some((p) => p.test(token));
}

function scanForHighEntropySecrets(
  line: string,
  filePath: string,
  lineNumber: number,
): Array<SecretFinding & { filePath: string; lineNumber: number }> {
  const findings: Array<
    SecretFinding & { filePath: string; lineNumber: number }
  > = [];

  const candidates = extractCandidateSecrets(line);

  for (const candidate of candidates) {
    const entropy = calculateShannonEntropy(candidate.value);

    if (entropy > 4.5) {
      findings.push({
        type: "high_entropy_secret",
        value: maskValue(candidate.value),
        lineNumber,
        filePath,
        severity: "high",
        description: `High entropy string detected (${entropy.toFixed(2)} bits) - likely API key, token, or secret`,
      });
    }
  }

  return findings;
}

function shouldSkipFileForEntropy(filePath: string): boolean {
  const skipPatterns = [
    /\.lock$/i,
    /package-lock\.json$/i,
    /yarn\.lock$/i,
    /node_modules/i,
    /dist\//,
    /build\//,
    /\.min\.js$/i,
    /\.\d+\.\d+\.\d+/,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

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

function shouldSkipLine(line: string): boolean {
  const trimmed = line.trim();

  if (trimmed.length === 0) return true;

  return false;
}

function isTestValue(value: string): boolean {
  const testPatterns = [
    /^(test|mock|fake|example|placeholder){2,}$/i,
    /^test[0-9]{1,3}test$/i,
    /^mock_.*_mock$/i,
    /^(12345|00000|11111|aaaaa)+$/i,
    /^test@(test|example)\.com$/i,
  ];

  return testPatterns.some((pattern) => pattern.test(value));
}

function maskValue(value: string): string {
  if (value.length <= 8) {
    return "***";
  }

  const visible = Math.ceil(value.length / 4);
  return (
    value.substring(0, visible) + "***" + value.substring(value.length - 2)
  );
}

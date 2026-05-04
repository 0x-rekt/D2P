export type OWASPFinding = {
  pattern: string; // OWASP-A#: brief name
  severity: "critical" | "high" | "medium";
  title: string;
  description: string;
  codeSnippet: string;
  lineNumber?: number;
  filePath?: string;
  suggestions: string[];
};

// OWASP Top 10 vulnerability patterns
const OWASP_PATTERNS = {
  hardcoded_role_check: {
    pattern:
      /if\s*\(\s*user\.role\s*===\s*['"]admin['"]\s*\)|role\s*==\s*['"]admin['"]/gi,
    severity: "high" as const,
    title: "Hardcoded Role Check",
    description:
      "Role-based access control should use proper authorization framework, not hardcoded strings",
    suggestions: [
      "Use a dedicated auth library (like Better Auth) for role management",
      "Store roles in database, not hardcoded",
      "Implement middleware for access control checks",
    ],
  },

  weak_hash: {
    pattern:
      /MD5|SHA1|\bmd5\(|\bsha1\(|crypto\.createHash\(['"]md5['"]|crypto\.createHash\(['"]sha1['"]\)/gi,
    severity: "critical" as const,
    title: "Weak Cryptographic Hash",
    description:
      "MD5 and SHA1 are cryptographically broken. Use SHA256 or stronger.",
    suggestions: [
      "Replace MD5/SHA1 with SHA-256 or SHA-512",
      "Use bcrypt or argon2 for password hashing",
      "Consider using crypto libraries with secure defaults",
    ],
  },

  sql_concatenation: {
    pattern:
      /query\s*\(\s*['"`].*?['"`]\s*\+|SELECT.*?\+|INSERT.*?\+|UPDATE.*?\+|DELETE.*?\+|\bsql\s*\+/gi,
    severity: "critical" as const,
    title: "SQL Injection Risk",
    description:
      "String concatenation for SQL queries is vulnerable to SQL injection",
    suggestions: [
      "Use parameterized queries or prepared statements",
      "Use ORM like Prisma to prevent SQL injection",
      "Never concatenate user input into queries",
    ],
  },

  command_injection: {
    pattern:
      /exec\s*\(\s*['"`].*?['"`]\s*\+|spawn\s*\(\s*['"`].*?['"`]|child_process\.exec\s*\(\s*['"`].*?['"`]\s*\+/gi,
    severity: "critical" as const,
    title: "Command Injection Risk",
    description:
      "Direct execution of concatenated strings can lead to command injection",
    suggestions: [
      "Use library functions that accept arrays instead of strings",
      "Validate and sanitize all user input",
      "Use spawn instead of exec when possible",
      "Use allowlists for command inputs",
    ],
  },

  no_rate_limiting: {
    pattern:
      /\/api\/.*?route\.ts|export\s+(async\s+)?function\s+(POST|GET|PUT|DELETE)/gi,
    severity: "high" as const,
    title: "Missing Rate Limiting",
    description: "API endpoints should have rate limiting to prevent abuse",
    suggestions: [
      "Implement rate limiting middleware",
      "Use libraries like express-rate-limit or similar",
      "Track requests per IP/user",
    ],
  },

  no_input_validation: {
    pattern: /req\.body|req\.query|req\.params(?!\s*(\.[\w]+\s*)?[=!<>])/gi,
    severity: "high" as const,
    title: "Missing Input Validation",
    description: "User input is not validated before processing",
    suggestions: [
      "Validate all user input against expected format",
      "Use schema validation (Zod, Joi, etc.)",
      "Reject invalid input early",
    ],
  },

  plain_text_password: {
    pattern: /password\s*[=:]\s*['"]([^'"]{6,})['"]\s*(?:;|,|\n)/gi,
    severity: "critical" as const,
    title: "Hardcoded Password",
    description: "Passwords should never be hardcoded in source code",
    suggestions: [
      "Use environment variables for secrets",
      "Use a secrets management system",
      "Never commit passwords to version control",
    ],
  },

  no_error_logging: {
    pattern:
      /catch\s*\(\s*\w+\s*\)\s*\{(?!\s*(console\.|logger\.|log\(|throw))/gi,
    severity: "medium" as const,
    title: "Missing Error Logging",
    description: "Errors are caught but not logged, making debugging difficult",
    suggestions: [
      "Log all errors with context",
      "Use structured logging",
      "Include stack traces and timestamps",
    ],
  },

  eval_usage: {
    pattern: /\beval\s*\(|\bnew\s+Function\s*\(/gi,
    severity: "critical" as const,
    title: "Dangerous eval() Usage",
    description:
      "eval() can execute arbitrary code and is a major security risk",
    suggestions: [
      "Avoid eval() entirely",
      "Use safer alternatives like Function.prototype.constructor with validation",
      "Consider using a templating engine or safer parsing",
    ],
  },

  dangerously_set_html: {
    pattern: /dangerouslySetInnerHTML|innerHTML\s*[=]/gi,
    severity: "high" as const,
    title: "XSS Vulnerability Risk",
    description: "dangerouslySetInnerHTML can enable XSS attacks",
    suggestions: [
      "Avoid dangerouslySetInnerHTML if possible",
      "Sanitize HTML with DOMPurify or similar library",
      "Use React's built-in HTML escaping when possible",
      "Use Content Security Policy headers",
    ],
  },

  no_dependency_check: {
    pattern: /import\s+.*\s+from\s+['"](.*?)['"];/gi,
    severity: "medium" as const,
    title: "Potential Vulnerable Dependency",
    description: "Dependencies should be regularly audited for vulnerabilities",
    suggestions: [
      "Run 'npm audit' regularly",
      "Keep dependencies updated",
      "Use automated tools like Dependabot",
    ],
  },
};

export const scanForOWASPPatterns = (
  content: string,
  filePath?: string,
): OWASPFinding[] => {
  const findings: OWASPFinding[] = [];
  const lines = content.split("\n");

  // Skip non-code files
  if (filePath && shouldSkipOWASPFile(filePath)) {
    return findings;
  }

  Object.values(OWASP_PATTERNS).forEach((patternConfig) => {
    lines.forEach((line, lineIndex) => {
      const matches = line.matchAll(patternConfig.pattern);
      for (const match of matches) {
        findings.push({
          pattern: patternConfig.pattern.source,
          severity: patternConfig.severity,
          title: patternConfig.title,
          description: patternConfig.description,
          codeSnippet: line.trim(),
          lineNumber: lineIndex + 1,
          filePath,
          suggestions: patternConfig.suggestions,
        });
      }
    });
  });

  return findings;
};

export const scanDiffForOWASP = (
  diff: string,
): Array<OWASPFinding & { filePath: string; lineNumber: number }> => {
  const findings: Array<
    OWASPFinding & { filePath: string; lineNumber: number }
  > = [];
  const lines = diff.split("\n");

  let currentFile = "";
  let addedLineNumber = 0;

  lines.forEach((line) => {
    if (line.startsWith("+++") || line.startsWith("---")) {
      currentFile = line.replace(/^[+-]{3}\s+[ab]\//, "").trim();
      if (shouldSkipOWASPFile(currentFile)) {
        currentFile = "";
      }
      addedLineNumber = 0;
    }

    if (line.startsWith("+") && !line.startsWith("+++") && currentFile) {
      const contentLine = line.substring(1);
      addedLineNumber++;

      const owaslFindings = scanForOWASPPatterns(contentLine, currentFile);
      findings.push(
        ...owaslFindings.map((f) => ({
          ...f,
          filePath: currentFile,
          lineNumber: addedLineNumber,
        })),
      );
    }
  });

  return findings;
};

export const correlateOWASPWithCVE = (
  owaslFindings: OWASPFinding[],
  cveFindings: any[],
): Array<OWASPFinding & { relatedCVEs?: any[] }> => {
  console.warn(
    "[DEPRECATED] correlateOWASPWithCVE is deprecated. Use correlateOWASPWithCVEUsingAI instead.",
  );
  return owaslFindings.map((finding) => ({
    ...finding,
    relatedCVEs: [],
  }));
};

function shouldSkipOWASPFile(filePath: string): boolean {
  const skipPatterns = [
    /\.md$/i,
    /\.json$/i,
    /\.lock$/i,
    /\.example$/i,
    /test\//i,
    /node_modules/i,
  ];

  return skipPatterns.some((pattern) => pattern.test(filePath));
}

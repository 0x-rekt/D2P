import { OpenAI } from "openai";

const ai = new OpenAI({
  baseURL: "https://router.huggingface.co/v1",
  apiKey: process.env.HF_TOKEN,
});

export type VerifiedSecurityFinding = {
  pattern: string;
  severity: "critical" | "high" | "medium";
  title: string;
  description: string;
  codeSnippet: string;
  lineNumber?: number;
  filePath?: string;
  suggestions: string[];
  isVerified: boolean;
  aiVerificationReason?: string;
  confidence: number;
};

export const verifyOWASPFindingsWithAI = async (
  findings: any[],
  diff: string,
): Promise<VerifiedSecurityFinding[]> => {
  if (findings.length === 0) {
    return [];
  }

  const prompt = `You are an expert security researcher. Analyze the following OWASP vulnerability candidates and determine which ones are actual security issues (true positives) vs false positives from overly broad regex patterns.

For each finding, evaluate whether it represents a REAL security vulnerability in the given code diff context.

IMPORTANT GUIDELINES:
- A "Hardcoded Role Check" for user.role !== "admin" is likely a FALSE POSITIVE if it's just a simple conditional
- SQL concatenation patterns might be FALSE POSITIVE if they're string literals being concatenated, not user input
- Command injection patterns might be FALSE POSITIVE if the command is static, not user-controlled
- Weak hash (MD5/SHA1) findings are usually TRUE POSITIVE if actually used for security (passwords, signatures)
- XSS risks (dangerouslySetInnerHTML) are TRUE POSITIVE if sanitization is missing
- Rate limiting warnings are often FALSE POSITIVE (not detected in code, just pattern match on route)
- Input validation warnings are TRUE POSITIVE only if user input is actually used without validation

For EACH finding provided below, respond with ONLY valid JSON array with NO markdown formatting:

[
  {
    "filePath": "exact file path from finding",
    "lineNumber": <number or null>,
    "title": "exact title from finding",
    "isVerified": true|false,
    "confidence": <0.0-1.0 decimal representing confidence level>,
    "reason": "brief explanation for verification decision"
  }
]

OWASP Findings to Verify:
${JSON.stringify(
  findings.map((f) => ({
    filePath: f.filePath,
    lineNumber: f.lineNumber,
    title: f.title,
    description: f.description,
    codeSnippet: f.codeSnippet,
  })),
  null,
  2,
)}

Code Diff Context (showing actual changes):
${diff.slice(0, 80_000)}`;

  try {
    const response = await ai.chat.completions.create({
      model: "Qwen/Qwen3-Coder-480B-A35B-Instruct:novita",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const text = response.choices[0].message.content as string;

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let verifications: any[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        verifications = parsed;
      }
    } catch {
      console.error("Failed to parse AI verification response:", text);
      return findings.map((f) => ({
        ...f,
        isVerified: false,
        confidence: 0,
        aiVerificationReason: "AI parsing failed",
      }));
    }

    return findings.map((finding) => {
      const verification = verifications.find(
        (v) =>
          v.title === finding.title &&
          v.filePath === finding.filePath &&
          v.lineNumber === finding.lineNumber,
      );

      if (verification) {
        return {
          ...finding,
          isVerified: verification.isVerified ?? false,
          confidence: verification.confidence ?? 0,
          aiVerificationReason: verification.reason,
        };
      }

      return {
        ...finding,
        isVerified: false,
        confidence: 0,
        aiVerificationReason: "No verification match found",
      };
    });
  } catch (error) {
    console.error("Error verifying OWASP findings with AI:", error);
    return findings.map((f) => ({
      ...f,
      isVerified: false,
      confidence: 0,
      aiVerificationReason: "AI verification error",
    }));
  }
};

export const filterVerifiedFindings = (
  verifiedFindings: VerifiedSecurityFinding[],
  confidenceThreshold: number = 0.6,
): VerifiedSecurityFinding[] => {
  return verifiedFindings.filter(
    (finding) =>
      finding.isVerified && finding.confidence >= confidenceThreshold,
  );
};

export type OWASPWithRelatedCVEs = VerifiedSecurityFinding & {
  relatedCVEs?: Array<{
    cveId: string;
    packageName: string;
    packageVersion: string;
    severity: string;
    cvssScore: number;
    exploitability: "high" | "medium" | "low";
    exploitabilityReason: string;
    confidence: number;
  }>;
};

export const correlateOWASPWithCVEUsingAI = async (
  owaspFindings: VerifiedSecurityFinding[],
  cveFindings: any[],
  diff: string,
): Promise<OWASPWithRelatedCVEs[]> => {
  if (owaspFindings.length === 0 || cveFindings.length === 0) {
    return owaspFindings.map((f) => ({
      ...f,
      relatedCVEs: [],
    }));
  }

  const prompt = `You are an expert security researcher. Analyze the relationship between OWASP code pattern vulnerabilities and known CVEs.

For each OWASP finding, determine:
1. Which CVEs (if any) could be exploited through this code pattern
2. How exploitable this pattern makes the application
3. Confidence level in the correlation

Focus on real attack chains, not superficial package name matches.

OWASP Findings:
${JSON.stringify(
  owaspFindings.map((f) => ({
    title: f.title,
    description: f.description,
    codeSnippet: f.codeSnippet,
    filePath: f.filePath,
    lineNumber: f.lineNumber,
  })),
  null,
  2,
)}

Available CVEs:
${JSON.stringify(
  cveFindings.map((c) => ({
    cveId: c.cveId,
    packageName: c.packageName,
    packageVersion: c.packageVersion,
    severity: c.severity,
    cvssScore: c.cvssScore,
    title: c.title,
    description: c.description,
  })),
  null,
  2,
)}

Code Context (diff):
${diff.slice(0, 60_000)}

Respond with ONLY a valid JSON array with NO markdown formatting, matching each OWASP finding to related CVEs:

[
  {
    "owaspTitle": "exact OWASP title",
    "relatedCVEs": [
      {
        "cveId": "CVE-XXXX-XXXXX",
        "exploitability": "high|medium|low",
        "exploitabilityReason": "brief explanation of how this pattern enables the CVE",
        "confidence": <0.0-1.0>
      }
    ]
  }
]`;

  try {
    const response = await ai.chat.completions.create({
      model: "Qwen/Qwen3-Coder-480B-A35B-Instruct:novita",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: 4000,
    });

    const text = response.choices[0].message.content as string;

    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    let correlations: any[] = [];
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed)) {
        correlations = parsed;
      }
    } catch {
      console.error("Failed to parse AI correlation response:", text);
      return owaspFindings.map((f) => ({
        ...f,
        relatedCVEs: [],
      }));
    }

    return owaspFindings.map((finding) => {
      const correlation = correlations.find(
        (c) => c.owaspTitle === finding.title,
      );

      if (
        correlation &&
        correlation.relatedCVEs &&
        correlation.relatedCVEs.length > 0
      ) {
        return {
          ...finding,
          relatedCVEs: correlation.relatedCVEs.map((rel: any) => {
            const cveData = cveFindings.find((c) => c.cveId === rel.cveId);
            return {
              cveId: rel.cveId,
              packageName: cveData?.packageName || "",
              packageVersion: cveData?.packageVersion || "",
              severity: cveData?.severity || "unknown",
              cvssScore: cveData?.cvssScore || 0,
              exploitability: rel.exploitability,
              exploitabilityReason: rel.exploitabilityReason,
              confidence: rel.confidence ?? 0,
            };
          }),
        };
      }

      return {
        ...finding,
        relatedCVEs: [],
      };
    });
  } catch (error) {
    console.error("Error correlating OWASP with CVEs using AI:", error);
    return owaspFindings.map((f) => ({
      ...f,
      relatedCVEs: [],
    }));
  }
};

"use client";

import React, { useEffect, useState } from "react";
import { getSecurityFindingsForPR } from "@/actions/security";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

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
}

interface SecurityFindingsPanelProps {
  repoId: string;
  prNumber: number;
}

const severityColors = {
  critical: "bg-red-900 text-red-100",
  high: "bg-orange-900 text-orange-100",
  medium: "bg-yellow-900 text-yellow-100",
  low: "bg-blue-900 text-blue-100",
};

const severityEmojis = {
  critical: "🔴",
  high: "🟠",
  medium: "🟡",
  low: "🟢",
};

const findingTypeLabels = {
  secret: "🔑 Hardcoded Secret",
  cve: "📦 Vulnerable Dependency",
  owasp: "⚠️ OWASP Vulnerability",
};

export const SecurityFindingsPanel: React.FC<SecurityFindingsPanelProps> = ({
  repoId,
  prNumber,
}) => {
  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFindings = async () => {
      try {
        setLoading(true);
        const data = await getSecurityFindingsForPR(repoId, prNumber);
        // Type-cast the data to match the SecurityFinding interface
        const typedFindings = (data as any[]).map((finding) => ({
          ...finding,
          findingType: finding.findingType as "secret" | "cve" | "owasp",
          severity: finding.severity as "critical" | "high" | "medium" | "low",
          status: finding.status as "open" | "fixed" | "ignored" | "false_positive",
        }));
        setFindings(typedFindings);
        setError(null);
      } catch (err) {
        setError("Failed to load security findings");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadFindings();
  }, [repoId, prNumber]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          Loading security findings...
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="text-center text-red-500">{error}</div>
      </Card>
    );
  }

  if (findings.length === 0) {
    return (
      <Card className="p-4">
        <div className="text-center text-green-600">
          ✅ No security findings detected
        </div>
      </Card>
    );
  }

  const critical = findings.filter((f) => f.severity === "critical");
  const high = findings.filter((f) => f.severity === "high");
  const medium = findings.filter((f) => f.severity === "medium");
  const low = findings.filter((f) => f.severity === "low");

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="font-semibold text-lg mb-3">🔒 Security Scan Results</h3>

        <div className="grid grid-cols-4 gap-2 mb-4">
          <div className="bg-red-900/20 p-2 rounded text-center">
            <div className="text-2xl font-bold text-red-500">
              {critical.length}
            </div>
            <div className="text-xs text-red-700">Critical</div>
          </div>
          <div className="bg-orange-900/20 p-2 rounded text-center">
            <div className="text-2xl font-bold text-orange-500">
              {high.length}
            </div>
            <div className="text-xs text-orange-700">High</div>
          </div>
          <div className="bg-yellow-900/20 p-2 rounded text-center">
            <div className="text-2xl font-bold text-yellow-500">
              {medium.length}
            </div>
            <div className="text-xs text-yellow-700">Medium</div>
          </div>
          <div className="bg-blue-900/20 p-2 rounded text-center">
            <div className="text-2xl font-bold text-blue-500">{low.length}</div>
            <div className="text-xs text-blue-700">Low</div>
          </div>
        </div>

        {critical.length > 0 && (
          <div className="bg-red-900/20 border border-red-700 rounded p-3 mb-3">
            ⚠️ <strong>Critical findings detected</strong> - This PR cannot be
            merged
          </div>
        )}
      </Card>

      {[critical, high, medium, low].map((group, idx) => {
        if (group.length === 0) return null;
        const severity = ["critical", "high", "medium", "low"][idx] as any;

        return (
          <div key={severity} className="space-y-2">
            {group.map((finding) => (
              <Card key={finding.id} className="p-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Badge className={severityColors[finding.severity]}>
                      {severityEmojis[finding.severity]}{" "}
                      {finding.severity.toUpperCase()}
                    </Badge>
                    <span className="font-semibold text-sm flex-1">
                      {findingTypeLabels[finding.findingType]}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-200 mb-2">{finding.title}</p>

                <p className="text-xs text-gray-400 mb-2">
                  {finding.description}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {finding.filePath && (
                    <>
                      <code className="bg-gray-900 px-2 py-1 rounded">
                        {finding.filePath}
                        {finding.lineNumber && `:${finding.lineNumber}`}
                      </code>
                    </>
                  )}

                  {finding.cveId && (
                    <>
                      <span>CVE: {finding.cveId}</span>
                      {finding.cvssScore && (
                        <span>CVSS: {finding.cvssScore.toFixed(1)}</span>
                      )}
                    </>
                  )}
                </div>

                <div className="mt-2 flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {finding.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default SecurityFindingsPanel;

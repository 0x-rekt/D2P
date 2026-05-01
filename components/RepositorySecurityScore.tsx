"use client";

import React, { useEffect, useState } from "react";
import {
  getRepositorySecurityTrend,
  getCurrentSecurityScore,
  getSecurityFindingsSummary,
} from "@/actions/security";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SecurityScoreProps {
  repoId: string;
}

interface SecurityScore {
  id: string;
  overallScore: number;
  scoredAt: Date;
  criticalFindings: number;
  highFindings: number;
  mediumFindings: number;
  lowFindings: number;
}

interface FindingsSummary {
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byFix: {
    fixable: number;
    requiresReview: number;
  };
}

export const RepositorySecurityScore: React.FC<SecurityScoreProps> = ({
  repoId,
}) => {
  const [currentScore, setCurrentScore] = useState<SecurityScore | null>(null);
  const [trend, setTrend] = useState<SecurityScore[]>([]);
  const [summary, setSummary] = useState<FindingsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [scoreData, trendData, summaryData] = await Promise.all([
          getCurrentSecurityScore(repoId),
          getRepositorySecurityTrend(repoId),
          getSecurityFindingsSummary(repoId),
        ]);

        setCurrentScore(scoreData);
        setTrend(trendData);
        setSummary(summaryData);
      } catch (error) {
        console.error("Failed to load security data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [repoId]);

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-gray-500">Loading...</div>
      </Card>
    );
  }

  if (!currentScore) {
    return (
      <Card className="p-4">
        <div className="text-gray-500">No security data available</div>
      </Card>
    );
  }

  const scoreGrade = getSecurityGrade(currentScore.overallScore);
  const scoreColor = getScoreColor(currentScore.overallScore);

  const previousScore =
    trend.length > 1 ? trend[trend.length - 1].overallScore : null;
  const scoreChange = previousScore
    ? currentScore.overallScore - previousScore
    : null;

  return (
    <div className="space-y-4">
      {/* Main Score Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Security Posture</h3>
          {scoreChange !== null && (
            <Badge
              variant="outline"
              className={scoreChange > 0 ? "text-green-500" : "text-red-500"}
            >
              {scoreChange > 0 ? "📈" : "📉"} {Math.abs(scoreChange)} points
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold ${scoreColor}`}
            >
              {currentScore.overallScore}
            </div>
            <div>
              <div className="text-2xl font-bold">{scoreGrade}</div>
              <div className="text-sm text-gray-400">Grade</div>
            </div>
          </div>

          <div className="flex-1">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-red-900/20 p-3 rounded">
                <div className="text-red-500 font-bold text-lg">
                  {currentScore.criticalFindings}
                </div>
                <div className="text-xs text-red-700">Critical</div>
              </div>
              <div className="bg-orange-900/20 p-3 rounded">
                <div className="text-orange-500 font-bold text-lg">
                  {currentScore.highFindings}
                </div>
                <div className="text-xs text-orange-700">High</div>
              </div>
              <div className="bg-yellow-900/20 p-3 rounded">
                <div className="text-yellow-500 font-bold text-lg">
                  {currentScore.mediumFindings}
                </div>
                <div className="text-xs text-yellow-700">Medium</div>
              </div>
              <div className="bg-blue-900/20 p-3 rounded">
                <div className="text-blue-500 font-bold text-lg">
                  {currentScore.lowFindings}
                </div>
                <div className="text-xs text-blue-700">Low</div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Findings Summary */}
      {summary && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Findings Summary</h4>

          <div className="space-y-3">
            {/* By Type */}
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">
                By Type
              </div>
              <div className="space-y-1">
                {Object.entries(summary.byType).map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="capitalize text-gray-300">{type}</span>
                    <span className="font-semibold">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* By Fixability */}
            <div>
              <div className="text-xs font-semibold text-gray-400 mb-2">
                By Fixability
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Auto-fixable</span>
                  <span className="font-semibold text-green-500">
                    {summary.byFix.fixable}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">Requires Review</span>
                  <span className="font-semibold text-orange-500">
                    {summary.byFix.requiresReview}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Trend */}
      {trend.length > 1 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-3">Score History</h4>
          <div className="space-y-2">
            {trend.slice(-7).map((score, idx) => {
              const date = new Date(score.scoredAt).toLocaleDateString();
              const barWidth = (score.overallScore / 100) * 100;
              return (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-12">{date}</span>
                  <div className="flex-1 h-6 bg-gray-800 rounded overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(score.overallScore)} flex items-center justify-end pr-2 text-xs font-bold`}
                      style={{ width: `${barWidth}%` }}
                    >
                      {barWidth > 20 && score.overallScore}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
};

function getSecurityGrade(score: number): string {
  if (score >= 90) return "A+";
  if (score >= 80) return "A";
  if (score >= 70) return "B+";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 40) return "D";
  return "F";
}

function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-600 text-green-100";
  if (score >= 70) return "bg-yellow-600 text-yellow-100";
  if (score >= 50) return "bg-orange-600 text-orange-100";
  return "bg-red-600 text-red-100";
}

export default RepositorySecurityScore;

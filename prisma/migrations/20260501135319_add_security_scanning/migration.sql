-- CreateTable
CREATE TABLE "security_finding" (
    "id" TEXT NOT NULL,
    "prNumber" INTEGER,
    "commitSha" TEXT NOT NULL,
    "findingType" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "cveId" TEXT,
    "cvssScore" DOUBLE PRECISION,
    "packageName" TEXT,
    "packageVersion" TEXT,
    "filePath" TEXT,
    "lineNumber" INTEGER,
    "fixable" BOOLEAN NOT NULL DEFAULT false,
    "fixType" TEXT,
    "fixDetails" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "githubIssueId" INTEGER,
    "gitHubIssueUrl" TEXT,
    "repositoryId" TEXT NOT NULL,
    "pullRequestId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "security_finding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "repository_security_score" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "secretScore" INTEGER NOT NULL,
    "cveScore" INTEGER NOT NULL,
    "owaslScore" INTEGER NOT NULL,
    "criticalFindings" INTEGER NOT NULL DEFAULT 0,
    "highFindings" INTEGER NOT NULL DEFAULT 0,
    "mediumFindings" INTEGER NOT NULL DEFAULT 0,
    "lowFindings" INTEGER NOT NULL DEFAULT 0,
    "scoredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "previousScore" INTEGER,

    CONSTRAINT "repository_security_score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "security_finding_repositoryId_idx" ON "security_finding"("repositoryId");

-- CreateIndex
CREATE INDEX "security_finding_prNumber_idx" ON "security_finding"("prNumber");

-- CreateIndex
CREATE INDEX "security_finding_status_idx" ON "security_finding"("status");

-- CreateIndex
CREATE INDEX "security_finding_severity_idx" ON "security_finding"("severity");

-- CreateIndex
CREATE INDEX "security_finding_findingType_idx" ON "security_finding"("findingType");

-- CreateIndex
CREATE INDEX "repository_security_score_repositoryId_idx" ON "repository_security_score"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "repository_security_score_repositoryId_scoredAt_key" ON "repository_security_score"("repositoryId", "scoredAt");

-- AddForeignKey
ALTER TABLE "security_finding" ADD CONSTRAINT "security_finding_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_finding" ADD CONSTRAINT "security_finding_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pull_request"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "repository_security_score" ADD CONSTRAINT "repository_security_score_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

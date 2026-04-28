-- CreateTable
CREATE TABLE "ci_failure" (
    "id" TEXT NOT NULL,
    "workflowRunId" BIGINT NOT NULL,
    "workflowName" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "commitSha" TEXT NOT NULL,
    "conclusion" TEXT NOT NULL,
    "logsUrl" TEXT NOT NULL,
    "htmlUrl" TEXT NOT NULL,
    "diagnosis" TEXT,
    "rootCause" TEXT,
    "fixSummary" TEXT,
    "suggestedPatch" TEXT,
    "analysisStatus" TEXT NOT NULL DEFAULT 'pending',
    "appliedUrl" TEXT,
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ci_failure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ci_failure_workflowRunId_key" ON "ci_failure"("workflowRunId");

-- CreateIndex
CREATE INDEX "ci_failure_repositoryId_idx" ON "ci_failure"("repositoryId");

-- CreateIndex
CREATE INDEX "ci_failure_analysisStatus_idx" ON "ci_failure"("analysisStatus");

-- AddForeignKey
ALTER TABLE "ci_failure" ADD CONSTRAINT "ci_failure_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

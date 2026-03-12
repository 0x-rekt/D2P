-- CreateTable
CREATE TABLE "pull_request" (
    "id" TEXT NOT NULL,
    "prNumber" INTEGER NOT NULL,
    "prGithubId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" TEXT NOT NULL DEFAULT 'open',
    "headSha" TEXT NOT NULL,
    "baseBranch" TEXT NOT NULL,
    "headBranch" TEXT NOT NULL,
    "authorLogin" TEXT NOT NULL,
    "diffUrl" TEXT NOT NULL,
    "prUrl" TEXT NOT NULL,
    "reviewStatus" TEXT NOT NULL DEFAULT 'pending',
    "reviewedAt" TIMESTAMP(3),
    "repositoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pull_request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suggestion" (
    "id" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "startLine" INTEGER NOT NULL,
    "endLine" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "originalCode" TEXT NOT NULL,
    "suggestedCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pullRequestId" TEXT NOT NULL,

    CONSTRAINT "suggestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pull_request_prGithubId_key" ON "pull_request"("prGithubId");

-- CreateIndex
CREATE INDEX "pull_request_repositoryId_idx" ON "pull_request"("repositoryId");

-- CreateIndex
CREATE INDEX "pull_request_reviewStatus_idx" ON "pull_request"("reviewStatus");

-- CreateIndex
CREATE UNIQUE INDEX "pull_request_repositoryId_prNumber_key" ON "pull_request"("repositoryId", "prNumber");

-- CreateIndex
CREATE INDEX "suggestion_pullRequestId_idx" ON "suggestion"("pullRequestId");

-- CreateIndex
CREATE INDEX "suggestion_status_idx" ON "suggestion"("status");

-- AddForeignKey
ALTER TABLE "pull_request" ADD CONSTRAINT "pull_request_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suggestion" ADD CONSTRAINT "suggestion_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "pull_request"("id") ON DELETE CASCADE ON UPDATE CASCADE;

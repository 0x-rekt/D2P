-- CreateTable
CREATE TABLE "repository" (
    "id" TEXT NOT NULL,
    "repoGithubId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "language" TEXT,
    "description" TEXT,
    "htmlUrl" TEXT NOT NULL,
    "webhookId" INTEGER,
    "webhookSecret" TEXT,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "repository_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "repository_repoGithubId_key" ON "repository"("repoGithubId");

-- CreateIndex
CREATE INDEX "repository_userId_idx" ON "repository"("userId");

-- CreateIndex
CREATE INDEX "repository_repoGithubId_idx" ON "repository"("repoGithubId");

-- AddForeignKey
ALTER TABLE "repository" ADD CONSTRAINT "repository_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

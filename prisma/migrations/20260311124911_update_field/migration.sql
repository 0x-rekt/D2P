/*
  Warnings:

  - Changed the type of `repoGithubId` on the `repository` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "repository" DROP COLUMN "repoGithubId",
ADD COLUMN     "repoGithubId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "repository_repoGithubId_key" ON "repository"("repoGithubId");

-- CreateIndex
CREATE INDEX "repository_repoGithubId_idx" ON "repository"("repoGithubId");

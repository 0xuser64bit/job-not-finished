-- v2: Better Auth tables, project lifecycle, and v1 data preserved as legacy_*.
-- v1 rows are renamed, not dropped; lib/legacy.ts claims them per user.

-- Preserve v1 tables
ALTER TABLE "User" RENAME TO "legacy_users";
ALTER TABLE "legacy_users" RENAME CONSTRAINT "User_pkey" TO "legacy_users_pkey";
ALTER INDEX "User_email_key" RENAME TO "legacy_users_email_key";
ALTER INDEX "User_githubId_key" RENAME TO "legacy_users_githubId_key";

ALTER TABLE "Project" RENAME TO "legacy_projects";
ALTER TABLE "legacy_projects" RENAME CONSTRAINT "Project_pkey" TO "legacy_projects_pkey";
ALTER TABLE "legacy_projects" RENAME CONSTRAINT "Project_userId_fkey" TO "legacy_projects_userId_fkey";
ALTER INDEX "Project_userId_idx" RENAME TO "legacy_projects_userId_idx";

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('IDLE', 'ACTIVE', 'SHIPPED', 'BURIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "githubLogin" TEXT,
    "syncedAt" TIMESTAMP(3),
    "onboardedAt" TIMESTAMP(3),
    "digestEnabled" BOOLEAN NOT NULL DEFAULT true,
    "digestEmail" TEXT,
    "lastDigestAt" TIMESTAMP(3),
    "publicProfile" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "repoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "htmlUrl" TEXT NOT NULL,
    "homepage" TEXT,
    "stars" INTEGER NOT NULL DEFAULT 0,
    "forks" INTEGER NOT NULL DEFAULT 0,
    "openIssues" INTEGER NOT NULL DEFAULT 0,
    "isFork" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "repoCreatedAt" TIMESTAMP(3) NOT NULL,
    "pushedAt" TIMESTAMP(3),
    "status" "ProjectStatus" NOT NULL DEFAULT 'IDLE',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "activatedAt" TIMESTAMP(3),
    "dueAt" TIMESTAMP(3),
    "renewals" INTEGER NOT NULL DEFAULT 0,
    "shippedAt" TIMESTAMP(3),
    "buriedAt" TIMESTAMP(3),
    "epitaph" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id"),
    -- Progress is a percentage
    CONSTRAINT "projects_progress_check" CHECK ("progress" BETWEEN 0 AND 100)
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_githubLogin_key" ON "users"("githubLogin");
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");
CREATE UNIQUE INDEX "accounts_providerId_accountId_key" ON "accounts"("providerId", "accountId");
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");
CREATE INDEX "projects_userId_status_idx" ON "projects"("userId", "status");
CREATE INDEX "projects_status_idx" ON "projects"("status");
CREATE UNIQUE INDEX "projects_userId_repoId_key" ON "projects"("userId", "repoId");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "projects" ADD CONSTRAINT "projects_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

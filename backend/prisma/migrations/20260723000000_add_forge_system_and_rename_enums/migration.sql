-- =====================================================================
-- add_forge_system_and_rename_enums
-- ---------------------------------------------------------------------
-- HAND-WRITTEN, not `prisma migrate dev`'s auto-diff output. Reason:
-- Prisma's auto-diff for a changed enum VALUE (not a new enum) generates
-- a DROP + CREATE of the enum type, which is destructive to any existing
-- rows using the old values. `ALTER TYPE ... RENAME VALUE` instead keeps
-- the same underlying enum OID and just relabels it — existing rows
-- automatically read back with the new label, and any column DEFAULT
-- referencing the old label is automatically repointed by Postgres too.
--
-- HOW TO APPLY:
--   1. Do NOT run `prisma migrate dev` for this change (it would try to
--      auto-generate the destructive version). Instead:
--   2. Copy this file's content into a new migration folder yourself
--      (or use `prisma migrate dev --create-only --name
--      add_forge_system_and_rename_enums` and REPLACE the generated
--      migration.sql with this file's content before running
--      `prisma migrate dev` to apply it).
--   3. If your Postgres version is older than 12, split the
--      `ALTER TYPE ... ADD VALUE` statements (for ActivityType's new
--      MISSION_FORGED) into their own migration that runs and commits
--      BEFORE this one — Postgres <12 doesn't allow using a
--      freshly-added enum value in the same transaction it was added in.
--      (Postgres 12+, which this schema already targets, allows it.)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Rename existing enum values to Title Case (matches Missions.jsx)
-- ---------------------------------------------------------------------

ALTER TYPE "Priority" RENAME VALUE 'LOW' TO 'Low';
ALTER TYPE "Priority" RENAME VALUE 'MEDIUM' TO 'Medium';
ALTER TYPE "Priority" RENAME VALUE 'HIGH' TO 'High';

ALTER TYPE "Difficulty" RENAME VALUE 'EASY' TO 'Easy';
ALTER TYPE "Difficulty" RENAME VALUE 'NORMAL' TO 'Normal';
ALTER TYPE "Difficulty" RENAME VALUE 'HARD' TO 'Hard';
ALTER TYPE "Difficulty" RENAME VALUE 'LEGENDARY' TO 'Legendary';

ALTER TYPE "Category" RENAME VALUE 'PHYSICAL' TO 'Physical';
ALTER TYPE "Category" RENAME VALUE 'MENTAL' TO 'Mental';
ALTER TYPE "Category" RENAME VALUE 'CAREER' TO 'Career';
ALTER TYPE "Category" RENAME VALUE 'LEARNING' TO 'Learning';
ALTER TYPE "Category" RENAME VALUE 'HEALTH' TO 'Health';

-- ---------------------------------------------------------------------
-- 2. New value on the existing ActivityType enum
-- ---------------------------------------------------------------------

ALTER TYPE "ActivityType" ADD VALUE 'MISSION_FORGED';

-- ---------------------------------------------------------------------
-- 3. New enums for the Forge/Resource/Mission system
-- ---------------------------------------------------------------------

CREATE TYPE "Role" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

CREATE TYPE "SuperCategory" AS ENUM ('PHYSICAL', 'MENTAL', 'CAREER', 'FINANCIAL', 'CREATIVE', 'SOCIAL', 'LIFESTYLE');

CREATE TYPE "ResourceType" AS ENUM ('EXERCISE', 'ARTICLE', 'BOOK', 'VIDEO', 'PDF', 'EXTERNAL_LINK', 'TEMPLATE', 'OTHER');

CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

CREATE TYPE "SubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');

-- ---------------------------------------------------------------------
-- 4. New columns on existing tables (all nullable or defaulted —
--    zero backfill required, every existing row gets a valid value)
-- ---------------------------------------------------------------------

ALTER TABLE "User" ADD COLUMN "firebaseUid" TEXT;
ALTER TABLE "User" ADD COLUMN "role" "Role" NOT NULL DEFAULT 'USER';
CREATE UNIQUE INDEX "User_firebaseUid_key" ON "User"("firebaseUid");

ALTER TABLE "Objective" ADD COLUMN "superCategory" "SuperCategory";
ALTER TABLE "Objective" ADD COLUMN "objectiveType" TEXT;
ALTER TABLE "Objective" ADD COLUMN "progressBreakdown" JSONB;

ALTER TABLE "Mission" ADD COLUMN "forgedFromResourceId" TEXT;
ALTER TABLE "Mission" ADD COLUMN "forgeParams" JSONB;

-- ---------------------------------------------------------------------
-- 5. New tables
-- ---------------------------------------------------------------------

CREATE TABLE "Forge" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "superCategory" "SuperCategory" NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Forge_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Forge_key_key" ON "Forge"("key");
CREATE INDEX "Forge_superCategory_idx" ON "Forge"("superCategory");

CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "forgeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "resourceType" "ResourceType" NOT NULL,
    "difficulty" "DifficultyLevel" NOT NULL DEFAULT 'BEGINNER',
    "gifUrl" TEXT,
    "videoUrl" TEXT,
    "pdfUrl" TEXT,
    "externalUrl" TEXT,
    "muscleGroup" TEXT,
    "equipment" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "submittedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Resource_forgeId_idx" ON "Resource"("forgeId");
CREATE INDEX "Resource_muscleGroup_idx" ON "Resource"("muscleGroup");
CREATE INDEX "Resource_verified_idx" ON "Resource"("verified");

CREATE TABLE "SavedResource" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedResource_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedResource_userId_resourceId_key" ON "SavedResource"("userId", "resourceId");

CREATE TABLE "ResourceMission" (
    "id" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "missionId" TEXT NOT NULL,
    "objectiveId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResourceMission_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ResourceMission_missionId_key" ON "ResourceMission"("missionId");
CREATE INDEX "ResourceMission_objectiveId_idx" ON "ResourceMission"("objectiveId");
CREATE INDEX "ResourceMission_resourceId_idx" ON "ResourceMission"("resourceId");

CREATE TABLE "ResourceSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "resourceId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "forgeId" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "gifUrl" TEXT,
    "videoUrl" TEXT,
    "pdfUrl" TEXT,
    "externalUrl" TEXT,
    "status" "SubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceSubmission_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "ResourceSubmission_status_idx" ON "ResourceSubmission"("status");
CREATE INDEX "ResourceSubmission_userId_idx" ON "ResourceSubmission"("userId");

-- ---------------------------------------------------------------------
-- 6. Foreign keys
-- ---------------------------------------------------------------------

ALTER TABLE "Mission" ADD CONSTRAINT "Mission_forgedFromResourceId_fkey" FOREIGN KEY ("forgedFromResourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Resource" ADD CONSTRAINT "Resource_forgeId_fkey" FOREIGN KEY ("forgeId") REFERENCES "Forge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_submittedBy_fkey" FOREIGN KEY ("submittedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SavedResource" ADD CONSTRAINT "SavedResource_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "SavedResource" ADD CONSTRAINT "SavedResource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ResourceMission" ADD CONSTRAINT "ResourceMission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceMission" ADD CONSTRAINT "ResourceMission_missionId_fkey" FOREIGN KEY ("missionId") REFERENCES "Mission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceMission" ADD CONSTRAINT "ResourceMission_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResourceMission" ADD CONSTRAINT "ResourceMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ResourceSubmission" ADD CONSTRAINT "ResourceSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ResourceSubmission" ADD CONSTRAINT "ResourceSubmission_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

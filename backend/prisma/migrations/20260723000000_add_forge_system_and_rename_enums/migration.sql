-- =====================================================================
-- add_notification_system
-- ---------------------------------------------------------------------
-- HAND-WRITTEN, same reason as 20260723000000_add_forge_system_and_
-- rename_enums: adding values to an EXISTING enum (NotificationType)
-- has to go through `ALTER TYPE ... ADD VALUE`, which `prisma migrate
-- dev`'s auto-diff does not reliably generate on its own for enums with
-- existing rows. Everything else here (new enums, new columns, new
-- tables) is safe as a normal auto-diff too, but is included by hand
-- for one consistent, reviewable migration.
--
-- HOW TO APPLY:
--   1. Do NOT run `prisma migrate dev` and let it auto-generate this.
--      Instead run `prisma migrate dev --create-only --name
--      add_notification_system`, then replace the generated
--      migration.sql with this file's content, then run
--      `prisma migrate dev` to apply it (or `prisma migrate deploy`
--      in production).
--   2. Postgres <12: split step 1 (ADD VALUE) into its own migration
--      that is applied and committed before the rest — see the same
--      note in the forge-system migration. Postgres 12+ can run it
--      all in one transaction.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. New values on the existing NotificationType enum
-- ---------------------------------------------------------------------

ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MISSION_DUE_SOON' BEFORE 'ACHIEVEMENT_UNLOCK';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'MISSION_COMPLETED' AFTER 'MISSION_DUE_SOON';

-- ---------------------------------------------------------------------
-- 2. New enums
-- ---------------------------------------------------------------------

CREATE TYPE "NotificationChannel" AS ENUM ('APP', 'EMAIL', 'PUSH');

CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH');

CREATE TYPE "NotificationDeliveryStatus" AS ENUM ('PENDING', 'SENT', 'FAILED', 'SKIPPED');

-- ---------------------------------------------------------------------
-- 3. Notification: new columns
-- ---------------------------------------------------------------------

ALTER TABLE "Notification"
  ADD COLUMN "channel" "NotificationChannel" NOT NULL DEFAULT 'APP',
  ADD COLUMN "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
  ADD COLUMN "scheduledFor" TIMESTAMP(3),
  ADD COLUMN "deliveredAt" TIMESTAMP(3);

CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");
CREATE INDEX "Notification_scheduledFor_idx" ON "Notification"("scheduledFor");

-- Existing FK had no explicit onDelete behavior (defaulted to RESTRICT).
-- Switch to CASCADE so deleting a User doesn't get blocked by their
-- own notification history.
ALTER TABLE "Notification" DROP CONSTRAINT IF EXISTS "Notification_userId_fkey";
ALTER TABLE "Notification"
  ADD CONSTRAINT "Notification_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 4. NotificationTemplate: new column + updatedAt + index
-- ---------------------------------------------------------------------

ALTER TABLE "NotificationTemplate"
  ADD COLUMN "title" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "NotificationTemplate_userId_type_idx" ON "NotificationTemplate"("userId", "type");

ALTER TABLE "NotificationTemplate" DROP CONSTRAINT IF EXISTS "NotificationTemplate_userId_fkey";
ALTER TABLE "NotificationTemplate"
  ADD CONSTRAINT "NotificationTemplate_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 5. UserDevice: new column, unique token, index
-- ---------------------------------------------------------------------

ALTER TABLE "UserDevice"
  ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;

-- If duplicate deviceToken rows already exist, this will fail — clean
-- them up (keep the newest per token) before applying in that case:
--   DELETE FROM "UserDevice" a USING "UserDevice" b
--   WHERE a.id < b.id AND a."deviceToken" = b."deviceToken";
CREATE UNIQUE INDEX "UserDevice_deviceToken_key" ON "UserDevice"("deviceToken");
CREATE INDEX "UserDevice_userId_active_idx" ON "UserDevice"("userId", "active");

ALTER TABLE "UserDevice" DROP CONSTRAINT IF EXISTS "UserDevice_userId_fkey";
ALTER TABLE "UserDevice"
  ADD CONSTRAINT "UserDevice_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 6. New table: NotificationPreference (one row per user, created lazily)
-- ---------------------------------------------------------------------

CREATE TABLE "NotificationPreference" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,

  "appEnabled" BOOLEAN NOT NULL DEFAULT true,
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "pushEnabled" BOOLEAN NOT NULL DEFAULT false,

  "missionReminders" BOOLEAN NOT NULL DEFAULT true,
  "achievementAlerts" BOOLEAN NOT NULL DEFAULT true,
  "weeklyReport" BOOLEAN NOT NULL DEFAULT true,
  "dailySummary" BOOLEAN NOT NULL DEFAULT true,
  "streakWarnings" BOOLEAN NOT NULL DEFAULT true,

  "reminderTime" TEXT,
  "quietHoursStart" TEXT,
  "quietHoursEnd" TEXT,
  "timezone" TEXT NOT NULL DEFAULT 'UTC',

  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

ALTER TABLE "NotificationPreference"
  ADD CONSTRAINT "NotificationPreference_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------
-- 7. New table: NotificationLog (per-channel delivery audit trail)
-- ---------------------------------------------------------------------

CREATE TABLE "NotificationLog" (
  "id" TEXT NOT NULL,
  "notificationId" TEXT NOT NULL,
  "channel" "NotificationChannel" NOT NULL,
  "status" "NotificationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationLog_notificationId_idx" ON "NotificationLog"("notificationId");
CREATE INDEX "NotificationLog_channel_status_idx" ON "NotificationLog"("channel", "status");

ALTER TABLE "NotificationLog"
  ADD CONSTRAINT "NotificationLog_notificationId_fkey"
  FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
/**
 * notification.scheduler.js
 * ------------------------------------------------
 * All cron jobs for the notification system, started once from
 * server.js via startNotificationScheduler(). Every job is independent
 * and wrapped in try/catch so one failing job (e.g. a bad query) never
 * takes down the others or crashes the process.
 *
 * Times are UTC (node-cron runs on server time; see the per-user
 * `timezone`/quiet-hours limitation noted in notification.utils.js —
 * for true per-user local-time delivery, swap these fixed schedules for
 * a per-user query using NotificationPreference.reminderTime, which the
 * hooks below are already structured to support).
 */

import cron from "node-cron";
import prisma from "../config/prisma.js";
import {
  createNotification,
  deliverScheduledNotification,
} from "./notification.service.js";

let started = false;

export function startNotificationScheduler() {
  if (started) return; // guard against double-start (e.g. nodemon double-import)
  started = true;

  // Every minute: deliver any explicitly scheduled notifications whose
  // time has come (scheduleNotification() callers land here).
  cron.schedule("* * * * *", () => runSafely("deliverDueScheduled", deliverDueScheduled));

  // Every hour, on the hour: warn about missions due within the next hour.
  cron.schedule("0 * * * *", () => runSafely("missionsDueSoon", checkMissionsDueSoon));

  // Every day at 07:00 UTC: daily summary.
  cron.schedule("0 7 * * *", () => runSafely("dailySummary", sendDailySummaries));

  // Every Sunday at 09:00 UTC: weekly summary.
  cron.schedule("0 9 * * 0", () => runSafely("weeklySummary", sendWeeklySummaries));

  // Every day at 22:00 UTC ("before midnight"): streak-loss warning.
  cron.schedule("0 22 * * *", () => runSafely("streakWarning", warnStreakLoss));

  console.log("[notification.scheduler] cron jobs registered");
}

async function runSafely(label, fn) {
  try {
    await fn();
  } catch (error) {
    console.error(`[notification.scheduler] ${label} failed:`, error);
  }
}

// ── Jobs ──────────────────────────────────────────────────────────────

async function deliverDueScheduled() {
  const due = await prisma.notification.findMany({
    where: {
      scheduledFor: { lte: new Date() },
      deliveredAt: null,
    },
    take: 200, // batch cap so one huge backlog doesn't block the next tick
  });

  for (const notification of due) {
    await deliverScheduledNotification(notification);
  }
}

async function checkMissionsDueSoon() {
  // NOTE: the current Mission model doesn't have a dueDate/deadline
  // field — only createdAt/updatedAt. This job is wired and ready to
  // go the moment a due-date field is added to Mission; until then it
  // safely no-ops so it doesn't send inaccurate reminders.
  const hasDueDateField = false; // flip once Mission.dueDate exists
  if (!hasDueDateField) return;
}

async function sendDailySummaries() {
  const users = await prisma.user.findMany({
    select: { id: true },
  });

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  for (const { id: userId } of users) {
    const [completedCount, totalCount] = await Promise.all([
      prisma.mission.count({
        where: { userId, completed: true, updatedAt: { gte: startOfDay } },
      }),
      prisma.mission.count({ where: { userId } }),
    ]);

    await createNotification(userId, {
      title: "Your Daily Summary",
      message: `You completed ${completedCount} of ${totalCount} missions today.`,
      type: "DAILY_RESET",
      data: { completedCount, totalCount },
    });
  }
}

async function sendWeeklySummaries() {
  const users = await prisma.user.findMany({ select: { id: true } });

  const startOfWeek = new Date();
  startOfWeek.setUTCDate(startOfWeek.getUTCDate() - 7);

  for (const { id: userId } of users) {
    const [completedCount, xpEvents] = await Promise.all([
      prisma.mission.count({
        where: { userId, completed: true, updatedAt: { gte: startOfWeek } },
      }),
      prisma.xpEvent.aggregate({
        where: { userId, createdAt: { gte: startOfWeek } },
        _sum: { amount: true },
      }),
    ]);

    await createNotification(userId, {
      title: "Your Weekly Summary",
      message: `${completedCount} missions completed this week. XP earned: ${xpEvents._sum.amount || 0}.`,
      type: "WEEKLY_REPORT",
      data: { completedCount, xpEarned: xpEvents._sum.amount || 0 },
    });
  }
}

async function warnStreakLoss() {
  // Users with at least one mission still open today.
  const usersWithOpenMissions = await prisma.mission.findMany({
    where: { completed: false },
    distinct: ["userId"],
    select: { userId: true },
  });

  for (const { userId } of usersWithOpenMissions) {
    await createNotification(userId, {
      title: "Your Streak Is At Risk",
      message: "You still have open missions today. Complete one before midnight to keep your streak alive.",
      type: "STREAK_WARNING",
      priority: "HIGH",
    });
  }
}
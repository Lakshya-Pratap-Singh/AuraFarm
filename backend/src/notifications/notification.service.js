/**
 * notification.service.js
 * ------------------------------------------------
 * Every other module in the app should call createNotification() (or
 * scheduleNotification() for a future-dated one) instead of writing to
 * the Notification table directly — this is where preference gating,
 * quiet hours, and multi-channel fan-out (app/email/push) all happen in
 * one place.
 */

import prisma from "../config/prisma.js";
import { sendEmail } from "./notification.email.js";
import { sendPush } from "./notification.push.js";
import {
  isTypeEnabled,
  isChannelEnabled,
  isWithinQuietHours,
  renderTemplateString,
} from "./notification.utils.js";

// ─────────────────────────────────────────────────────────────────────
// Preferences
// ─────────────────────────────────────────────────────────────────────

/** Returns the user's preference row, or null if they've never set one (= all defaults). */
export async function getUserPreferences(userId) {
  return prisma.notificationPreference.findUnique({ where: { userId } });
}

/** Upserts preference fields. Only whitelisted fields are written — arbitrary body passthrough is not allowed. */
export async function updateUserPreferences(userId, updates = {}) {
  const allowedFields = [
    "appEnabled",
    "emailEnabled",
    "pushEnabled",
    "missionReminders",
    "achievementAlerts",
    "weeklyReport",
    "dailySummary",
    "streakWarnings",
    "reminderTime",
    "quietHoursStart",
    "quietHoursEnd",
    "timezone",
  ];

  const data = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  return prisma.notificationPreference.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

// ─────────────────────────────────────────────────────────────────────
// Dispatcher — fans a single logical notification out to every enabled
// channel, without the caller (createNotification) needing to know
// which channels exist or how each one is sent. Adding a new channel
// later (SMS, Discord, whatever) means adding one case here — nothing
// upstream changes.
// ─────────────────────────────────────────────────────────────────────

async function logDelivery(notificationId, channel, status, error) {
  return prisma.notificationLog.create({
    data: { notificationId, channel, status, error: error || null },
  });
}

async function dispatch({ notification, user, preference, data }) {
  // APP: the row already exists — that IS the in-app delivery. Just log it.
  await logDelivery(notification.id, "APP", "SENT");

  const quiet = isWithinQuietHours(preference) && notification.priority !== "HIGH";

  // EMAIL
  if (isChannelEnabled(preference, "EMAIL") && !quiet) {
    const result = await sendEmail({
      to: user.email,
      type: notification.type,
      data: { message: notification.message, title: notification.title, ...data },
    });
    await logDelivery(
      notification.id,
      "EMAIL",
      result.sent ? "SENT" : "FAILED",
      result.error
    );
  } else {
    await logDelivery(notification.id, "EMAIL", "SKIPPED", quiet ? "Quiet hours" : "Disabled by preference");
  }

  // PUSH
  if (isChannelEnabled(preference, "PUSH") && !quiet) {
    const result = await sendPush({
      userId: user.id,
      title: notification.title,
      message: notification.message,
      data,
    });
    await logDelivery(
      notification.id,
      "PUSH",
      result.sent > 0 ? "SENT" : "FAILED",
      result.skipped || (result.failed > 0 ? `${result.failed} device(s) failed` : null)
    );
  } else {
    await logDelivery(notification.id, "PUSH", "SKIPPED", quiet ? "Quiet hours" : "Disabled by preference");
  }

  if (!notification.deliveredAt) {
    await prisma.notification.update({
      where: { id: notification.id },
      data: { deliveredAt: new Date() },
    });
  }
}

export const NotificationDispatcher = { dispatch };

// ─────────────────────────────────────────────────────────────────────
// Core create/read/update/delete
// ─────────────────────────────────────────────────────────────────────

/**
 * Creates and immediately dispatches a notification.
 *
 * @param {string} userId
 * @param {object} options
 * @param {string} options.title
 * @param {string} options.message
 * @param {string} options.type       - one of NOTIFICATION_TYPES
 * @param {string} [options.priority] - LOW | NORMAL | HIGH (default NORMAL)
 * @param {object} [options.data]     - extra fields passed through to email/push templates (e.g. actionUrl, missionTitle)
 */
export async function createNotification(
  userId,
  { title, message, type, priority = "NORMAL", data = {} } = {}
) {
  if (!userId) throw new Error("createNotification requires a userId");
  if (!title || !message || !type) {
    throw new Error("createNotification requires title, message, and type");
  }

  const [user, preference] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    getUserPreferences(userId),
  ]);

  if (!user) throw new Error(`No user found for id ${userId}`);

  if (!isTypeEnabled(preference, type)) {
    return null; // user has this category of notification turned off entirely
  }

  const notification = await prisma.notification.create({
    data: { userId, title, message, type, priority, channel: "APP" },
  });

  // Fire-and-forget on purpose: a slow/failing email or push provider
  // should never block the caller (e.g. mission completion) waiting on
  // it. Failures are captured in NotificationLog for later inspection.
  dispatch({ notification, user, preference, data }).catch((error) => {
    console.error("[notification.service] dispatch failed:", error.message);
  });

  return notification;
}

/**
 * Same as createNotification, but delivery is deferred to a future
 * time. notification.scheduler.js picks these up and calls dispatch()
 * once `scheduledFor` has passed.
 */
export async function scheduleNotification(
  userId,
  { title, message, type, priority = "NORMAL", scheduledFor } = {}
) {
  if (!scheduledFor) throw new Error("scheduleNotification requires scheduledFor");
  if (!title || !message || !type) {
    throw new Error("scheduleNotification requires title, message, and type");
  }

  return prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type,
      priority,
      channel: "APP",
      scheduledFor: new Date(scheduledFor),
    },
  });
}

/** Called by the scheduler for every due, undelivered notification. */
export async function deliverScheduledNotification(notification) {
  const [user, preference] = await Promise.all([
    prisma.user.findUnique({ where: { id: notification.userId } }),
    getUserPreferences(notification.userId),
  ]);
  if (!user) return;
  await dispatch({ notification, user, preference, data: {} });
}

export async function markAsRead(userId, notificationId) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }
  return prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function deleteNotification(userId, notificationId) {
  const notification = await prisma.notification.findUnique({ where: { id: notificationId } });
  if (!notification || notification.userId !== userId) {
    throw new Error("Notification not found");
  }
  return prisma.notification.delete({ where: { id: notificationId } });
}

export async function clearAllNotifications(userId) {
  return prisma.notification.deleteMany({ where: { userId } });
}

/**
 * Paginated + filterable list for the dropdown / preferences page.
 * `cursor` is a notification id for keyset pagination (infinite scroll).
 */
export async function listNotifications(
  userId,
  { type, unreadOnly = false, cursor, limit = 20 } = {}
) {
  const notifications = await prisma.notification.findMany({
    where: {
      userId,
      ...(type ? { type } : {}),
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const hasMore = notifications.length > limit;
  const page = hasMore ? notifications.slice(0, limit) : notifications;

  return {
    notifications: page,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

// ─────────────────────────────────────────────────────────────────────
// Templates (user-custom reminder messages)
// ─────────────────────────────────────────────────────────────────────

export async function createTemplate(userId, { name, title, message, type }) {
  if (!name || !message || !type) {
    throw new Error("createTemplate requires name, message, and type");
  }
  return prisma.notificationTemplate.create({
    data: { userId, name, title, message, type },
  });
}

export async function getTemplates(userId, { type } = {}) {
  return prisma.notificationTemplate.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTemplate(userId, templateId, updates = {}) {
  const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
  if (!template || template.userId !== userId) throw new Error("Template not found");

  const allowedFields = ["name", "title", "message", "type"];
  const data = Object.fromEntries(
    Object.entries(updates).filter(([key]) => allowedFields.includes(key))
  );

  return prisma.notificationTemplate.update({ where: { id: templateId }, data });
}

export async function deleteTemplate(userId, templateId) {
  const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
  if (!template || template.userId !== userId) throw new Error("Template not found");
  return prisma.notificationTemplate.delete({ where: { id: templateId } });
}

/**
 * Sends a notification using a saved template instead of raw
 * title/message — the caller (e.g. a reminder job) picks which
 * template id to use, and this fills in {{placeholders}} from `data`
 * before handing off to createNotification.
 */
export async function sendFromTemplate(userId, templateId, data = {}) {
  const template = await prisma.notificationTemplate.findUnique({ where: { id: templateId } });
  if (!template || template.userId !== userId) throw new Error("Template not found");

  return createNotification(userId, {
    title: renderTemplateString(template.title || template.name, data),
    message: renderTemplateString(template.message, data),
    type: template.type,
    data,
  });
}
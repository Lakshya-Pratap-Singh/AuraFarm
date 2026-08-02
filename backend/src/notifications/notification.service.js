import prisma from "../config/prisma.js";
import { DEFAULT_PREFERENCES, NOTIFICATION_TYPES } from "./notification.utils.js";
import { sendEmailNotification } from "./notification.email.js";
import { sendPushNotification } from "./notification.push.js";

function normalizePayload(inputOrTitle, maybeMessage, maybeType) {
  if (typeof inputOrTitle === "string") {
    return {
      title: inputOrTitle,
      message: maybeMessage || "",
      type: maybeType || "SYSTEM",
      data: {},
      channel: "APP",
      priority: "NORMAL",
      scheduledFor: null,
    };
  }

  const resolvedType = inputOrTitle?.type && DEFAULT_PREFERENCES?.userId !== undefined
    ? inputOrTitle.type
    : inputOrTitle?.type || "SYSTEM";

  return {
    title: inputOrTitle?.title || "Notification",
    message: inputOrTitle?.message || "",
    type: NOTIFICATION_TYPES.includes(resolvedType) ? resolvedType : "SYSTEM",
    data: inputOrTitle?.data || {},
    channel: inputOrTitle?.channel || "APP",
    priority: inputOrTitle?.priority || "NORMAL",
    scheduledFor: inputOrTitle?.scheduledFor || null,
  };
}

async function dispatchNotification(notification, payload) {
  const preferences = await getUserPreferences(notification.userId).catch(() => DEFAULT_PREFERENCES);

  const emailEnabled = preferences?.emailEnabled !== false;
  const pushEnabled = preferences?.pushEnabled === true;

  if (emailEnabled) {
    const user = await prisma.user.findUnique({ where: { id: notification.userId }, select: { email: true } });
    if (user?.email) {
      await sendEmailNotification({
        to: user.email,
        title: notification.title,
        message: notification.message,
        type: notification.type,
      });
    }
  }

  if (pushEnabled) {
    await sendPushNotification({
      userId: notification.userId,
      title: notification.title,
      body: notification.message,
      data: payload.data || {},
    });
  }
}

export async function createNotification(userId, inputOrTitle, maybeMessage, maybeType) {
  const payload = normalizePayload(inputOrTitle, maybeMessage, maybeType);

  const notification = await prisma.notification.create({
    data: {
      userId,
      title: payload.title,
      message: payload.message,
      type: payload.type,
    },
  });

  if (!payload.scheduledFor) {
    dispatchNotification(notification, payload).catch((error) => {
      console.error("[notifications] dispatch failed", error.message);
    });
  }

  return notification;
}

export async function scheduleNotification(userId, payload) {
  return createNotification(userId, {
    ...payload,
    scheduledFor: payload.scheduledFor || new Date(),
  });
}

export async function listNotifications(userId, { type, unreadOnly, cursor, limit = 20 } = {}) {
  const where = {
    userId,
    ...(type ? { type } : {}),
    ...(unreadOnly ? { isRead: false } : {}),
    ...(cursor ? { id: { lt: cursor } } : {}),
  };

  const items = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
  });

  const hasMore = items.length > limit;
  const sliced = hasMore ? items.slice(0, limit) : items;

  return sliced;
}

export async function getUnreadCount(userId) {
  return prisma.notification.count({ where: { userId, isRead: false } });
}

export async function markAsRead(userId, notificationId) {
  return prisma.notification.updateMany({
    where: { userId, id: notificationId },
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
  return prisma.notification.deleteMany({ where: { userId, id: notificationId } });
}

export async function clearAllNotifications(userId) {
  return prisma.notification.deleteMany({ where: { userId } });
}

export async function createTemplate(userId, payload) {
  return prisma.notificationTemplate.create({
    data: {
      userId,
      name: payload.name || "Custom",
      message: payload.message || "",
      type: payload.type || "SYSTEM",
      isDefault: Boolean(payload.isDefault),
    },
  });
}

export async function getTemplates(userId, { type } = {}) {
  return prisma.notificationTemplate.findMany({
    where: { userId, ...(type ? { type } : {}) },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateTemplate(userId, templateId, updates) {
  return prisma.notificationTemplate.updateMany({
    where: { userId, id: templateId },
    data: updates,
  });
}

export async function deleteTemplate(userId, templateId) {
  return prisma.notificationTemplate.deleteMany({ where: { userId, id: templateId } });
}

export async function getUserPreferences(userId) {
  return { ...DEFAULT_PREFERENCES, userId };
}

export async function updateUserPreferences(userId, updates) {
  return { ...DEFAULT_PREFERENCES, userId, ...updates };
}
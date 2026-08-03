import * as notificationService from "./notification.service.js";
import { registerDevice, unregisterDevice } from "./notification.push.js";
import { NOTIFICATION_TYPES } from "./notification.utils.js";

function handleError(res, error) {
  const knownNotFound = /not found/i.test(error.message);
  return res.status(knownNotFound ? 404 : 500).json({ message: error.message });
}

// ── Notifications ──────────────────────────────────────────────────────

export const getNotifications = async (req, res) => {
  try {
    const { type, unreadOnly, cursor, limit } = req.query;

    if (type && !NOTIFICATION_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid type: ${type}` });
    }

    const result = await notificationService.listNotifications(req.user.id, {
      type,
      unreadOnly: unreadOnly === "true",
      cursor,
      limit: limit ? Math.min(Number(limit) || 20, 100) : 20,
    });

    return res.status(200).json(result);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.id);
    return res.status(200).json({ count });
  } catch (error) {
    return handleError(res, error);
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.user.id, req.params.id);
    return res.status(200).json(notification);
  } catch (error) {
    return handleError(res, error);
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.id);
    return res.status(200).json({ updated: result.count });
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await notificationService.deleteNotification(req.user.id, req.params.id);
    return res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    return handleError(res, error);
  }
};

export const clearAllNotifications = async (req, res) => {
  try {
    const result = await notificationService.clearAllNotifications(req.user.id);
    return res.status(200).json({ deleted: result.count });
  } catch (error) {
    return handleError(res, error);
  }
};

export const createTestNotification = async (req, res) => {
  try {
    const notification = await notificationService.createNotification(req.user.id, {
      title: "Test Notification",
      message: "AuraFarm notification system is working.",
      type: "SYSTEM",
    });
    return res.status(201).json(notification);
  } catch (error) {
    return handleError(res, error);
  }
};

// ── Templates ───────────────────────────────────────────────────────────

export const createTemplate = async (req, res) => {
  try {
    const { name, title, message, type } = req.body;
    if (!NOTIFICATION_TYPES.includes(type)) {
      return res.status(400).json({ message: `Invalid type: ${type}` });
    }
    const template = await notificationService.createTemplate(req.user.id, {
      name,
      title,
      message,
      type,
    });
    return res.status(201).json(template);
  } catch (error) {
    return handleError(res, error);
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await notificationService.getTemplates(req.user.id, {
      type: req.query.type,
    });
    return res.status(200).json(templates);
  } catch (error) {
    return handleError(res, error);
  }
};

export const updateTemplate = async (req, res) => {
  try {
    const template = await notificationService.updateTemplate(
      req.user.id,
      req.params.id,
      req.body
    );
    return res.status(200).json(template);
  } catch (error) {
    return handleError(res, error);
  }
};

export const deleteTemplate = async (req, res) => {
  try {
    await notificationService.deleteTemplate(req.user.id, req.params.id);
    return res.status(200).json({ message: "Template deleted" });
  } catch (error) {
    return handleError(res, error);
  }
};

// ── Preferences ────────────────────────────────────────────────────────

export const getPreferences = async (req, res) => {
  try {
    const preferences = await notificationService.getUserPreferences(req.user.id);
    // Return defaults explicitly rather than null, so the frontend
    // doesn't need to know the schema's default values itself.
    return res.status(200).json(
      preferences || {
        userId: req.user.id,
        appEnabled: true,
        emailEnabled: true,
        pushEnabled: false,
        missionReminders: true,
        achievementAlerts: true,
        weeklyReport: true,
        dailySummary: true,
        streakWarnings: true,
        reminderTime: null,
        quietHoursStart: null,
        quietHoursEnd: null,
        timezone: "UTC",
      }
    );
  } catch (error) {
    return handleError(res, error);
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const preferences = await notificationService.updateUserPreferences(req.user.id, req.body);
    return res.status(200).json(preferences);
  } catch (error) {
    return handleError(res, error);
  }
};

// ── Devices (push registration) ──────────────────────────────────────────

export const registerDeviceHandler = async (req, res) => {
  try {
    const { deviceToken, deviceType } = req.body;
    if (!deviceToken || !deviceType) {
      return res.status(400).json({ message: "deviceToken and deviceType are required" });
    }
    const device = await registerDevice({ userId: req.user.id, deviceToken, deviceType });
    return res.status(201).json(device);
  } catch (error) {
    return handleError(res, error);
  }
};

export const unregisterDeviceHandler = async (req, res) => {
  try {
    const { deviceToken } = req.body;
    if (!deviceToken) {
      return res.status(400).json({ message: "deviceToken is required" });
    }
    await unregisterDevice({ deviceToken });
    return res.status(200).json({ message: "Device unregistered" });
  } catch (error) {
    return handleError(res, error);
  }
};
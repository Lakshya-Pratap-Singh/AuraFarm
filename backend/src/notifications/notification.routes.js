import express from "express";
import { protect } from "../middleware/auth.js";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createTestNotification,
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  getPreferences,
  updatePreferences,
  registerDeviceHandler,
  unregisterDeviceHandler,
} from "./notification.controller.js";

const router = express.Router();

// Notifications
router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.post("/test", protect, createTestNotification);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/clear", protect, clearAllNotifications);
router.delete("/:id", protect, deleteNotification);

// Templates
router.get("/templates", protect, getTemplates);
router.post("/templates", protect, createTemplate);
router.put("/templates/:id", protect, updateTemplate);
router.delete("/templates/:id", protect, deleteTemplate);

// Preferences
router.get("/preferences", protect, getPreferences);
router.put("/preferences", protect, updatePreferences);

// Devices (push token registration — future-ready FCM hook)
router.post("/devices", protect, registerDeviceHandler);
router.delete("/devices", protect, unregisterDeviceHandler);

export default router;
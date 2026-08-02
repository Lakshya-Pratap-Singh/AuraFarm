import express from "express";
import { protect } from "../middleware/auth.js";

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createTemplate,
  getTemplates,
  updateTemplate,
  deleteTemplate,
  getPreferences,
  updatePreferences,
  registerDeviceHandler,
  unregisterDeviceHandler,
  createTestNotification,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);
router.get("/unread-count", protect, getUnreadCount);
router.post("/test", protect, createTestNotification);
router.patch("/read-all", protect, markAllAsRead);
router.patch("/:id/read", protect, markAsRead);
router.delete("/:id", protect, deleteNotification);
router.delete("/all", protect, clearAllNotifications);

router.post("/templates", protect, createTemplate);
router.get("/templates", protect, getTemplates);
router.patch("/templates/:id", protect, updateTemplate);
router.delete("/templates/:id", protect, deleteTemplate);

router.get("/preferences", protect, getPreferences);
router.put("/preferences", protect, updatePreferences);

router.post("/devices", protect, registerDeviceHandler);
router.delete("/devices", protect, unregisterDeviceHandler);

export default router;
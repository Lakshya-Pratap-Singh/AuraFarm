import express from "express";
import { protect } from "../middleware/auth.js";

import {
  getNotifications,
  markAsRead,
  deleteNotification,
  createTemplate,
  getTemplates,
  createTestNotification,
} from "./notification.controller.js";

const router = express.Router();

router.get("/", protect, getNotifications);

router.post("/test", protect, createTestNotification);

router.patch("/:id/read", protect, markAsRead);

router.delete("/:id", protect, deleteNotification);

router.post("/templates", protect, createTemplate);

router.get("/templates", protect, getTemplates);

export default router;
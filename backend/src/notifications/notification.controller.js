import prisma from "../config/prisma.js";
import { createNotification } from "./notification.service.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(notifications);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
    });

    return res.status(200).json(notification);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const createTemplate = async (req, res) => {
  try {
    const { name, message, type } = req.body;

    const template = await prisma.notificationTemplate.create({
      data: {
        userId: req.user.id,
        name,
        message,
        type,
      },
    });

    return res.status(201).json(template);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const getTemplates = async (req, res) => {
  try {
    const templates = await prisma.notificationTemplate.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json(templates);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const createTestNotification = async (req, res) => {
  try {
    const notification = await createNotification(
      req.user.id,
      "Test Notification",
      "AuraFarm notification system is working.",
      "SYSTEM"
    );

    return res.status(201).json(notification);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
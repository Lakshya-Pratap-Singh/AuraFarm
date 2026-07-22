import prisma from "../config/prisma.js";

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

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
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

    res.status(200).json(notification);
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
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

    res.status(200).json({
      message: "Notification deleted",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to delete notification",
      error: error.message,
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

    res.status(201).json(template);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create template",
      error: error.message,
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

    res.status(200).json(templates);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch templates",
      error: error.message,
    });
  }
};
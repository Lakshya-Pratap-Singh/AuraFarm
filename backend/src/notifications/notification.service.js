import prisma from "../config/prisma.js";

export async function createNotification(
  userId,
  title,
  message,
  type
) {
  return await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type
    }
  });
}
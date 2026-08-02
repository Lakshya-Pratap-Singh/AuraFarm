import prisma from "../config/prisma.js";
import { getFirebaseMessaging } from "../config/firebaseAdmin.js";

export async function registerDevice({ userId, deviceToken, deviceType }) {
  if (!userId || !deviceToken || !deviceType) {
    throw new Error("userId, deviceToken, and deviceType are required");
  }

  const existing = await prisma.userDevice.findFirst({
    where: { deviceToken },
  });

  if (existing) {
    return prisma.userDevice.update({
      where: { id: existing.id },
      data: {
        userId,
        deviceType,
        active: true,
        updatedAt: new Date(),
      },
    });
  }

  return prisma.userDevice.create({
    data: {
      userId,
      deviceToken,
      deviceType,
      active: true,
      updatedAt: new Date(),
    },
  });
}

export async function unregisterDevice({ deviceToken }) {
  if (!deviceToken) throw new Error("deviceToken is required");

  const existing = await prisma.userDevice.findFirst({ where: { deviceToken } });
  if (!existing) return null;

  return prisma.userDevice.update({
    where: { id: existing.id },
    data: {
      active: false,
      updatedAt: new Date(),
    },
  });
}

export async function sendPushNotification({ userId, title, body, data = {} }) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return { status: "skipped", reason: "firebase-not-configured" };

  const devices = await prisma.userDevice.findMany({
    where: { userId, active: true },
  });

  const tokens = devices.map((device) => device.deviceToken).filter(Boolean);
  if (!tokens.length) return { status: "skipped", reason: "no-devices" };

  try {
    const result = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, String(value)])),
    });

    return { status: result.successCount > 0 ? "sent" : "skipped", result };
  } catch (error) {
    return { status: "failed", error: error.message };
  }
}

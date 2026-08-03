/**
 * notification.push.js
 * ------------------------------------------------
 * Push delivery via Firebase Cloud Messaging. This is the "implementation
 * hook" the spec asks for: the plumbing (device registration, sending,
 * invalid-token cleanup) is real and working the moment
 * FIREBASE_SERVICE_ACCOUNT_JSON is set — nothing else in the module
 * needs to change to turn push on for real. Until then, it no-ops.
 *
 * firebase-admin is already a dependency (used by middleware/auth.js for
 * ID token verification), so this adds no new packages.
 */

import prisma from "../config/prisma.js";
import { getFirebaseMessaging } from "../config/firebaseAdmin.js";

/**
 * Sends a push notification to every active device registered for a
 * user. Devices whose token FCM reports as invalid/unregistered are
 * flipped to `active: false` rather than deleted, so re-registration
 * (next app open) just flips them back on via upsert.
 *
 * Returns { sent: number, failed: number, skipped?: string }.
 */
export async function sendPush({ userId, title, message, data = {} }) {
  const messaging = getFirebaseMessaging();
  if (!messaging) {
    return { sent: 0, failed: 0, skipped: "Firebase not configured" };
  }

  const devices = await prisma.userDevice.findMany({
    where: { userId, active: true },
  });

  if (devices.length === 0) {
    return { sent: 0, failed: 0, skipped: "No active devices" };
  }

  const tokens = devices.map((d) => d.deviceToken);

  try {
    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: { title, body: message },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
    });

    // Deactivate tokens FCM says are dead, so future sends stop retrying them.
    const deadTokens = response.responses
      .map((r, i) => (!r.success && isUnregisteredError(r.error) ? tokens[i] : null))
      .filter(Boolean);

    if (deadTokens.length > 0) {
      await prisma.userDevice.updateMany({
        where: { deviceToken: { in: deadTokens } },
        data: { active: false },
      });
    }

    return { sent: response.successCount, failed: response.failureCount };
  } catch (error) {
    console.error("[notification.push] send failed:", error.message);
    return { sent: 0, failed: tokens.length, skipped: error.message };
  }
}

function isUnregisteredError(error) {
  const code = error?.code || "";
  return (
    code === "messaging/registration-token-not-registered" ||
    code === "messaging/invalid-registration-token"
  );
}

/** Upserts a device token for a user — call on login / app open with the current FCM token. */
export async function registerDevice({ userId, deviceToken, deviceType }) {
  return prisma.userDevice.upsert({
    where: { deviceToken },
    update: { userId, deviceType, active: true },
    create: { userId, deviceToken, deviceType, active: true },
  });
}

/** Call on logout / notification permission revoked. */
export async function unregisterDevice({ deviceToken }) {
  return prisma.userDevice.updateMany({
    where: { deviceToken },
    data: { active: false },
  });
}
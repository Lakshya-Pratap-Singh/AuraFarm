/**
 * notification.utils.js
 * ------------------------------------------------
 * Small, dependency-free helpers shared across the notification module.
 * Nothing here talks to Prisma or sends anything — pure functions only,
 * so they're trivial to unit test.
 */

/**
 * Maps a NotificationType to the NotificationPreference boolean field
 * that gates it. Types not listed here (e.g. SYSTEM) are treated as
 * always-allowed announcements and aren't gated by a preference toggle.
 */
export const TYPE_TO_PREFERENCE_FIELD = {
  MISSION_REMINDER: "missionReminders",
  MISSION_DUE_SOON: "missionReminders",
  ACHIEVEMENT_UNLOCK: "achievementAlerts",
  OBJECTIVE_PROGRESS: "achievementAlerts",
  WEEKLY_REPORT: "weeklyReport",
  DAILY_RESET: "dailySummary",
  STREAK_WARNING: "streakWarnings",
};

/**
 * Given a preference row (or null, meaning "all defaults") and a
 * notification type, returns whether this *category* of notification
 * is allowed at all. This is independent of channel (app/email/push) —
 * see isChannelEnabled for that.
 */
export function isTypeEnabled(preference, type) {
  const field = TYPE_TO_PREFERENCE_FIELD[type];
  if (!field) return true; // ungated types (SYSTEM, MISSION_COMPLETED) always pass
  if (!preference) return true; // no row yet = defaults = enabled
  return preference[field] !== false;
}

/** Whether a given channel is enabled on the user's preferences. */
export function isChannelEnabled(preference, channel) {
  if (!preference) return channel !== "PUSH"; // defaults: app+email on, push off
  switch (channel) {
    case "APP":
      return preference.appEnabled !== false;
    case "EMAIL":
      return preference.emailEnabled !== false;
    case "PUSH":
      return preference.pushEnabled === true;
    default:
      return false;
  }
}

/**
 * Parses an "HH:mm" string into minutes-since-midnight, or null if the
 * string is missing/malformed. Never throws.
 */
function parseTimeToMinutes(value) {
  if (!value || typeof value !== "string") return null;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/**
 * Returns true if `date` (defaults to now) falls inside the user's
 * configured quiet hours. Supports ranges that wrap past midnight
 * (e.g. 22:00 -> 07:00). If either bound is unset, quiet hours are
 * treated as disabled (never true).
 *
 * NOTE: this compares against the server's local clock via `date`'s
 * UTC-relative getHours/getMinutes only if the caller has already
 * shifted `date` into the user's timezone — this function itself is
 * timezone-agnostic on purpose (no external tz dependency). Callers
 * that care about per-user timezones should adjust `date` before
 * calling, or treat `preference.timezone` as informational only for
 * now (documented limitation — see notification.scheduler.js).
 */
export function isWithinQuietHours(preference, date = new Date()) {
  if (!preference) return false;
  const start = parseTimeToMinutes(preference.quietHoursStart);
  const end = parseTimeToMinutes(preference.quietHoursEnd);
  if (start === null || end === null) return false;

  const nowMinutes = date.getHours() * 60 + date.getMinutes();

  if (start === end) return false; // zero-length window = disabled
  if (start < end) {
    return nowMinutes >= start && nowMinutes < end;
  }
  // wraps past midnight
  return nowMinutes >= start || nowMinutes < end;
}

/**
 * Replaces {{placeholders}} in a template string with values from
 * `data`. Missing keys are left as an empty string rather than
 * throwing, so a malformed custom template degrades gracefully instead
 * of breaking delivery.
 */
export function renderTemplateString(template, data = {}) {
  if (typeof template !== "string") return "";
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
    const value = key
      .split(".")
      .reduce((acc, part) => (acc == null ? acc : acc[part]), data);
    return value == null ? "" : String(value);
  });
}

/** Whitelist used by scheduleNotification/createNotification input validation. */
export const NOTIFICATION_TYPES = [
  "MISSION_REMINDER",
  "MISSION_DUE_SOON",
  "MISSION_COMPLETED",
  "ACHIEVEMENT_UNLOCK",
  "OBJECTIVE_PROGRESS",
  "STREAK_WARNING",
  "DAILY_RESET",
  "WEEKLY_REPORT",
  "SYSTEM",
];

export const NOTIFICATION_CHANNELS = ["APP", "EMAIL", "PUSH"];
export const NOTIFICATION_PRIORITIES = ["LOW", "NORMAL", "HIGH"];
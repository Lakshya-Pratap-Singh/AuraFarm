export const NOTIFICATION_TYPES = [
  "MISSION_REMINDER",
  "ACHIEVEMENT_UNLOCK",
  "STREAK_WARNING",
  "OBJECTIVE_PROGRESS",
  "DAILY_RESET",
  "WEEKLY_REPORT",
  "SYSTEM",
];

export const DEFAULT_PREFERENCES = {
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
};

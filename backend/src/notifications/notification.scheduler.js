export function startNotificationScheduler() {
  if (globalThis.__dailywiseNotificationScheduler) return globalThis.__dailywiseNotificationScheduler;

  const interval = setInterval(() => {
    // Lightweight scheduler placeholder so the app can start without a cron dependency.
  }, 60_000);

  globalThis.__dailywiseNotificationScheduler = { interval };
  return globalThis.__dailywiseNotificationScheduler;
}

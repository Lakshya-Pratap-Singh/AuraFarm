import app from "./app.js";
import { startNotificationScheduler } from "./notifications/notification.scheduler.js";

const PORT = process.env.PORT || 5000;

startNotificationScheduler();

app.listen(PORT, () => {
  console.log(`DailyWise API listening on http://localhost:${PORT}`);
});

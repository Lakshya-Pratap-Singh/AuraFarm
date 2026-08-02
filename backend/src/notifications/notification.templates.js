export const defaultTemplates = {
  PHYSICAL: "The body is forged through repetition. Today's mission awaits.",
  LEARNING: "Knowledge unused is knowledge wasted. Return to your studies.",
  CAREER: "Every completed task compounds your future.",
  HEALTH: "Your future self is built by today's choices.",
  MISSION_REMINDER: "A mission is waiting for your attention.",
  MISSION_DUE_SOON: "A mission is due soon — take a quick step now.",
  MISSION_COMPLETED: "Mission completed. Your discipline just grew.",
  ACHIEVEMENT_UNLOCK: "You unlocked a new achievement.",
  STREAK_WARNING: "Your streak needs a gentle nudge today.",
  OBJECTIVE_PROGRESS: "A goal is moving forward — keep the momentum.",
  DAILY_RESET: "A fresh day is waiting for you.",
  WEEKLY_REPORT: "Your weekly progress is ready.",
  SYSTEM: "A new update is ready for you.",
};

export function renderEmailTemplate({ title, message, type = "SYSTEM" }) {
  const safeTitle = title || "AuraFarm Notification";
  const safeMessage = message || defaultTemplates[type] || defaultTemplates.SYSTEM;

  return `
    <div style="font-family: Inter, Arial, sans-serif; background:#05070d; color:#f8eee3; padding:24px; border-radius:16px;">
      <div style="font-size:12px; letter-spacing:2px; text-transform:uppercase; color:#f3c35a; margin-bottom:8px;">AuraFarm</div>
      <h2 style="margin:0 0 12px; color:#f3c35a;">${safeTitle}</h2>
      <p style="margin:0; line-height:1.6;">${safeMessage}</p>
    </div>
  `;
}
/**
 * notification.templates.js
 * ------------------------------------------------
 * Two kinds of "template" live here:
 *
 *   1. defaultTemplates — short in-app copy keyed by mission Category,
 *      unchanged from before this module existed (kept for backwards
 *      compatibility — nothing new depends on it, but nothing removes
 *      it either).
 *
 *   2. emailTemplates — full HTML email bodies keyed by NotificationType,
 *      used by notification.email.js. Dark, gold/purple "aura" theme to
 *      match the app (see client/src/styles/aura-theme.css) — inline
 *      CSS only, since most email clients strip <style> blocks.
 */

export const defaultTemplates = {
  PHYSICAL:
    "The body is forged through repetition. Today's mission awaits.",

  LEARNING:
    "Knowledge unused is knowledge wasted. Return to your studies.",

  CAREER:
    "Every completed task compounds your future.",

  HEALTH:
    "Your future self is built by today's choices.",
};

// ── Shared email chrome ────────────────────────────────────────────────

const BRAND_GOLD = "#c9a227";
const BRAND_PURPLE = "#8b5cf6";
const BG_BLACK = "#000000";
const TEXT_LIGHT = "#e9e4f2";
const TEXT_FAINT = "#a79fc0";

function emailShell({ preheader = "", eyebrow, heading, bodyHtml, ctaLabel, ctaUrl }) {
  return `<!DOCTYPE html>
<html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin:0;padding:0;background:${BG_BLACK};font-family:Georgia,'Times New Roman',serif;">
    <span style="display:none;font-size:1px;color:${BG_BLACK};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG_BLACK};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width:480px;background:#0d0c15;border:1px solid rgba(139,92,246,0.35);border-radius:16px;box-shadow:0 0 40px rgba(139,92,246,0.12);" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding:28px 28px 0 28px;text-align:center;">
                <div style="font-size:12px;letter-spacing:3px;text-transform:uppercase;color:${BRAND_GOLD};font-weight:bold;">AuraFarm</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 28px 8px 28px;text-align:center;">
                ${eyebrow ? `<div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${BRAND_PURPLE};margin-bottom:10px;">${eyebrow}</div>` : ""}
                <div style="font-size:22px;color:${TEXT_LIGHT};font-weight:bold;">${heading}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 28px 8px 28px;color:${TEXT_FAINT};font-size:15px;line-height:1.6;text-align:center;">
                ${bodyHtml}
              </td>
            </tr>
            ${
              ctaLabel && ctaUrl
                ? `<tr>
                    <td style="padding:20px 28px 8px 28px;text-align:center;">
                      <a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;background:linear-gradient(135deg,${BRAND_PURPLE},${BRAND_GOLD});color:#0d0c15;text-decoration:none;font-weight:bold;border-radius:999px;font-size:14px;">${ctaLabel}</a>
                    </td>
                  </tr>`
                : ""
            }
            <tr>
              <td style="padding:24px 28px 28px 28px;text-align:center;">
                <div style="height:1px;background:rgba(139,92,246,0.25);margin-bottom:16px;"></div>
                <div style="font-size:11px;color:#6b6480;">You're receiving this because you have AuraFarm notifications enabled. Manage preferences any time in Settings &rarr; Notifications.</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

// ── Per-type email templates ───────────────────────────────────────────
// Each entry is (data) => { subject, html }. `data` carries whatever the
// caller (notification.service.js) hands to sendEmailNotification —
// keep field access defensive since callers won't always supply every
// field.

export const emailTemplates = {
  MISSION_REMINDER: (data = {}) => ({
    subject: `Reminder: ${data.missionTitle || "A mission"} awaits`,
    html: emailShell({
      preheader: "Your mission is still open.",
      eyebrow: "Mission Reminder",
      heading: data.missionTitle || "A mission awaits",
      bodyHtml: data.message || "The mission you set is still open. A little discipline now compounds later.",
      ctaLabel: "View Mission",
      ctaUrl: data.actionUrl,
    }),
  }),

  MISSION_DUE_SOON: (data = {}) => ({
    subject: `Due soon: ${data.missionTitle || "A mission"}`,
    html: emailShell({
      preheader: "Time is running out on this one.",
      eyebrow: "Due Soon",
      heading: data.missionTitle || "Mission due soon",
      bodyHtml: data.message || "This mission is due within the hour. Close it out before it slips.",
      ctaLabel: "View Mission",
      ctaUrl: data.actionUrl,
    }),
  }),

  MISSION_COMPLETED: (data = {}) => ({
    subject: `Completed: ${data.missionTitle || "Mission"}`,
    html: emailShell({
      preheader: "Another mission down.",
      eyebrow: "Mission Complete",
      heading: data.missionTitle || "Mission complete",
      bodyHtml: data.message || "Logged and counted toward your Aura. Keep the streak alive.",
      ctaLabel: "View Progress",
      ctaUrl: data.actionUrl,
    }),
  }),

  ACHIEVEMENT_UNLOCK: (data = {}) => ({
    subject: `Achievement unlocked: ${data.achievementName || "New Relic"}`,
    html: emailShell({
      preheader: "A new relic has been forged.",
      eyebrow: "Achievement Unlocked",
      heading: data.achievementName || "New Achievement",
      bodyHtml: data.message || "Your consistency has been rewarded. A new relic now sits in your collection.",
      ctaLabel: "View Relics",
      ctaUrl: data.actionUrl,
    }),
  }),

  OBJECTIVE_PROGRESS: (data = {}) => ({
    subject: `Progress update: ${data.objectiveTitle || "Your objective"}`,
    html: emailShell({
      preheader: "Steady progress toward your objective.",
      eyebrow: "Objective Progress",
      heading: data.objectiveTitle || "Objective progress",
      bodyHtml: data.message || `You're now ${data.progress != null ? `${data.progress}% ` : ""}of the way there.`,
      ctaLabel: "View Objective",
      ctaUrl: data.actionUrl,
    }),
  }),

  STREAK_WARNING: (data = {}) => ({
    subject: `Your ${data.streakLength ? `${data.streakLength}-day ` : ""}streak is at risk`,
    html: emailShell({
      preheader: "Don't let it break at midnight.",
      eyebrow: "Streak Warning",
      heading: "Your streak is about to break",
      bodyHtml: data.message || "You still have missions open today. Complete at least one before midnight to keep your streak alive.",
      ctaLabel: "Complete a Mission",
      ctaUrl: data.actionUrl,
    }),
  }),

  DAILY_RESET: (data = {}) => ({
    subject: "Your daily summary",
    html: emailShell({
      preheader: "Here's how today went.",
      eyebrow: "Daily Summary",
      heading: "Today's Report",
      bodyHtml: data.message || `${data.completedCount ?? 0} of ${data.totalCount ?? 0} missions completed today.`,
      ctaLabel: "View Dashboard",
      ctaUrl: data.actionUrl,
    }),
  }),

  WEEKLY_REPORT: (data = {}) => ({
    subject: "Your weekly summary",
    html: emailShell({
      preheader: "A week of progress, summarized.",
      eyebrow: "Weekly Summary",
      heading: "This Week's Report",
      bodyHtml: data.message || `${data.completedCount ?? 0} missions completed this week. XP earned: ${data.xpEarned ?? 0}.`,
      ctaLabel: "View Intelligence",
      ctaUrl: data.actionUrl,
    }),
  }),

  SYSTEM: (data = {}) => ({
    subject: data.title || "AuraFarm announcement",
    html: emailShell({
      preheader: data.message || "",
      eyebrow: "Announcement",
      heading: data.title || "AuraFarm",
      bodyHtml: data.message || "",
      ctaLabel: data.actionUrl ? "Open AuraFarm" : undefined,
      ctaUrl: data.actionUrl,
    }),
  }),
};

/**
 * Renders the email subject/html for a notification type. Falls back to
 * the SYSTEM template (generic title/message layout) for any type
 * without a dedicated entry, so a future NotificationType never causes
 * a hard failure.
 */
export function renderEmailTemplate(type, data = {}) {
  const builder = emailTemplates[type] || emailTemplates.SYSTEM;
  return builder(data);
}
/**
 * notification.email.js
 * ------------------------------------------------
 * Thin Nodemailer wrapper. Reads SMTP config from env — works with
 * Gmail/SendGrid/Mailgun/Resend's SMTP relay/etc, anything that speaks
 * standard SMTP. No provider-specific SDK, so swapping providers is an
 * env var change, not a code change.
 *
 * Required env vars (see .env.example):
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 *
 * If SMTP_HOST is unset, send() logs and no-ops instead of throwing —
 * so local dev / environments without email configured don't crash the
 * rest of the notification pipeline (in-app notifications still work).
 */

import nodemailer from "nodemailer";
import { renderEmailTemplate } from "./notification.templates.js";

let transporter = null;
let loggedMissingConfig = false;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) return null;

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER
      ? {
          user: SMTP_USER,
          pass: SMTP_PASS,
        }
      : undefined,
  });

  return transporter;
}

/**
 * Sends an email for a given NotificationType using the matching
 * template. Returns { sent: boolean, error?: string } rather than
 * throwing, so callers (the dispatcher) can log a NotificationLog row
 * either way without a try/catch at every call site.
 */
export async function sendEmail({ to, type, data = {} }) {
  if (!to) {
    return { sent: false, error: "Missing recipient email" };
  }

  const client = getTransporter();
  if (!client) {
    if (!loggedMissingConfig) {
      console.warn(
        "[notification.email] SMTP_HOST not set — skipping email send. " +
          "Set SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS/SMTP_FROM in .env to enable email delivery."
      );
      loggedMissingConfig = true;
    }
    return { sent: false, error: "Email transport not configured" };
  }

  try {
    const { subject, html } = renderEmailTemplate(type, data);

    await client.sendMail({
      from: process.env.SMTP_FROM || "AuraFarm <no-reply@aurafarm.app>",
      to,
      subject,
      html,
    });

    return { sent: true };
  } catch (error) {
    console.error("[notification.email] send failed:", error.message);
    return { sent: false, error: error.message };
  }
}
import { renderEmailTemplate } from "./notification.templates.js";

let transporter = null;
let missingConfigLogged = false;

async function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST) {
    if (!missingConfigLogged) {
      console.info("[notifications] SMTP not configured; skipping email delivery");
      missingConfigLogged = true;
    }
    return null;
  }

  try {
    const nodemailer = await import("nodemailer");
    transporter = nodemailer.default.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT || 587),
      secure: false,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  } catch (error) {
    if (!missingConfigLogged) {
      console.info("[notifications] nodemailer unavailable; skipping email delivery");
      missingConfigLogged = true;
    }
    return null;
  }

  return transporter;
}

export async function sendEmailNotification({ to, title, message, type = "SYSTEM" }) {
  if (!to) return { status: "skipped", reason: "no-recipient" };

  const transport = await getTransporter();
  if (!transport) return { status: "skipped", reason: "smtp-not-configured" };

  try {
    const html = renderEmailTemplate({ title, message, type });
    await transport.sendMail({
      from: process.env.SMTP_FROM || "AuraFarm <no-reply@aurafarm.app>",
      to,
      subject: title,
      html,
    });

    return { status: "sent" };
  } catch (error) {
    return { status: "failed", error: error.message };
  }
}

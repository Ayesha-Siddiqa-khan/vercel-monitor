import nodemailer from "nodemailer";

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    throw new Error("GMAIL_USER and GMAIL_APP_PASSWORD must be set");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  try {
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"LimitLens" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function buildThresholdAlertEmail(params: {
  to: string;
  name: string;
  metric: string;
  percentage: number;
  used: number;
  limit: number;
  remaining: number;
  unit: string;
  recommendation: string;
  level: string;
}): EmailPayload {
  const levelEmoji = {
    warning: "\u26a0\ufe0f",
    danger: "\ud83d\udea8",
    critical: "\ud83d\udd34",
  }[params.level] || "\ud83d\udca1";

  const levelLabel = {
    warning: "Warning",
    danger: "Danger",
    critical: "CRITICAL",
  }[params.level] || "Alert";

  return {
    to: params.to,
    subject: `${levelEmoji} Vercel ${levelLabel}: ${params.metric} reached ${params.percentage.toFixed(1)}%`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: ${params.level === "critical" ? "#dc2626" : params.level === "danger" ? "#ea580c" : "#ca8a04"};">
          ${levelEmoji} ${levelLabel}: ${params.metric}
        </h2>
        <p>Hello ${params.name},</p>
        <p>Your Vercel Hobby usage for <strong>${params.metric}</strong> has reached <strong>${params.percentage.toFixed(1)}%</strong>.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Used</td><td style="padding: 8px; border: 1px solid #ddd;"><strong>${formatValue(params.used, params.unit)}</strong></td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Limit</td><td style="padding: 8px; border: 1px solid #ddd;">${formatValue(params.limit, params.unit)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">Remaining</td><td style="padding: 8px; border: 1px solid #ddd;">${formatValue(params.remaining, params.unit)}</td></tr>
        </table>
        <div style="background: #f8f9fa; padding: 12px; border-radius: 6px; margin: 16px 0;">
          <strong>Recommended action:</strong>
          <p style="margin: 8px 0 0 0;">${params.recommendation}</p>
        </div>
        <p style="color: #666; font-size: 12px;">This is an early warning from LimitLens to help you stay within your free limits.</p>
      </div>
    `,
  };
}

export function buildDailySummaryEmail(params: {
  to: string;
  name: string;
  resources: Array<{
    metric: string;
    used: number;
    limit: number;
    unit: string;
    status: string;
  }>;
  overallStatus: string;
}): EmailPayload {
  const rows = params.resources
    .map(
      (r) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.metric}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatValue(r.used, r.unit)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${formatValue(r.limit, r.unit)}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${((r.used / r.limit) * 100).toFixed(1)}%</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${r.status}</td>
      </tr>`
    )
    .join("");

  return {
    to: params.to,
    subject: `Daily Vercel usage summary - ${params.overallStatus}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Daily Vercel Usage Summary</h2>
        <p>Hello ${params.name},</p>
        <p>Overall status: <strong>${params.overallStatus}</strong></p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <thead>
            <tr style="background: #f3f4f6;">
              <th style="padding: 8px; border: 1px solid #ddd;">Resource</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Used</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Limit</th>
              <th style="padding: 8px; border: 1px solid #ddd;">%</th>
              <th style="padding: 8px; border: 1px solid #ddd;">Status</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="color: #666; font-size: 12px;">LimitLens - Daily Summary</p>
      </div>
    `,
  };
}

function formatValue(value: number, unit: string): string {
  if (unit === "invocations" || unit === "requests" || unit === "reads" || unit === "writes") {
    return value.toLocaleString() + " " + unit;
  }
  return `${value.toFixed(1)} ${unit}`;
}

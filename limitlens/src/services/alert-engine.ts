import { db } from "../db";
import { alertRules, alertEvents, usageSnapshots, monitorRuns, notificationChannels } from "../db/schema";
import { eq, and, gt } from "drizzle-orm";
import { getPercentageUsed, getStatusLevel, getRecommendation } from "./vercel-collector";
import { sendEmail, buildThresholdAlertEmail } from "./email-sender";
import type { NormalizedMetric } from "./vercel-collector";

export interface AlertCheckResult {
  alertsSent: number;
  details: Array<{
    metricKey: string;
    level: string;
    percentage: number;
    sent: boolean;
  }>;
}

export async function checkAndSendAlerts(
  userId: string,
  userName: string,
  metrics: NormalizedMetric[]
): Promise<AlertCheckResult> {
  const result: AlertCheckResult = { alertsSent: 0, details: [] };

  for (const metric of metrics) {
    const percentage = getPercentageUsed(metric.usedValue, metric.limitValue);
    const statusLevel = getStatusLevel(percentage);

    if (statusLevel === "safe" || statusLevel === "watch") {
      result.details.push({ metricKey: metric.metricKey, level: statusLevel, percentage, sent: false });
      continue;
    }

    const rule = await db
      .select()
      .from(alertRules)
      .where(and(eq(alertRules.userId, userId), eq(alertRules.metricKey, metric.metricKey)))
      .limit(1);

    if (rule.length === 0 || !rule[0].enabled) {
      result.details.push({ metricKey: metric.metricKey, level: statusLevel, percentage, sent: false });
      continue;
    }

    const thresholdLevel = determineThresholdLevel(percentage, rule[0]);

    const shouldSend = await shouldSendAlert(userId, metric.metricKey, thresholdLevel, rule[0].cooldownMinutes);

    if (!shouldSend) {
      result.details.push({ metricKey: metric.metricKey, level: statusLevel, percentage, sent: false });
      continue;
    }

    const recommendation = getRecommendation(statusLevel, metric.metricKey);

    const channel = await db
      .select()
      .from(notificationChannels)
      .where(and(eq(notificationChannels.userId, userId), eq(notificationChannels.enabled, true)))
      .limit(1);

    if (channel.length === 0) {
      result.details.push({ metricKey: metric.metricKey, level: statusLevel, percentage, sent: false });
      continue;
    }

    const emailPayload = buildThresholdAlertEmail({
      to: channel[0].emailTo,
      name: userName,
      metric: metric.metricKey.replace(/_/g, " "),
      percentage,
      used: metric.usedValue,
      limit: metric.limitValue,
      remaining: metric.limitValue - metric.usedValue,
      unit: metric.unit,
      recommendation,
      level: thresholdLevel,
    });

    const sent = await sendEmail(emailPayload);

    await db.insert(alertEvents).values({
      userId,
      metricKey: metric.metricKey,
      thresholdLevel,
      percentageUsed: percentage,
      message: recommendation,
      channel: "email",
      status: sent ? "sent" : "failed",
    });

    if (sent) result.alertsSent++;
    result.details.push({ metricKey: metric.metricKey, level: thresholdLevel, percentage, sent });
  }

  return result;
}

function determineThresholdLevel(
  percentage: number,
  rule: { warningThreshold: number; dangerThreshold: number; criticalThreshold: number }
): string {
  if (percentage >= rule.criticalThreshold) return "critical";
  if (percentage >= rule.dangerThreshold) return "danger";
  return "warning";
}

async function shouldSendAlert(
  userId: string,
  metricKey: string,
  thresholdLevel: string,
  cooldownMinutes: number
): Promise<boolean> {
  const cooldownAgo = new Date(Date.now() - cooldownMinutes * 60 * 1000);

  const recentAlerts = await db
    .select()
    .from(alertEvents)
    .where(
      and(
        eq(alertEvents.userId, userId),
        eq(alertEvents.metricKey, metricKey),
        eq(alertEvents.thresholdLevel, thresholdLevel),
        eq(alertEvents.status, "sent"),
        gt(alertEvents.sentAt, cooldownAgo)
      )
    )
    .limit(1);

  if (recentAlerts.length > 0) return false;

  const previousAlerts = await db
    .select()
    .from(alertEvents)
    .where(
      and(
        eq(alertEvents.userId, userId),
        eq(alertEvents.metricKey, metricKey),
        eq(alertEvents.status, "sent")
      )
    )
    .orderBy(alertEvents.sentAt)
    .limit(1);

  if (previousAlerts.length === 0) return true;

  const previousPercentage = previousAlerts[0].percentageUsed;
  if (thresholdLevel === "warning" && previousPercentage >= 85) return true;
  if (thresholdLevel === "danger" && previousPercentage >= 95) return true;
  if (thresholdLevel === "warning" && previousPercentage < 75) return true;
  if (thresholdLevel === "danger" && previousPercentage < 85) return true;
  if (thresholdLevel === "critical" && previousPercentage < 95) return true;

  return false;
}

export async function recordUsageSnapshots(
  userId: string,
  connectionId: string,
  metrics: NormalizedMetric[]
): Promise<void> {
  for (const metric of metrics) {
    const percentage = getPercentageUsed(metric.usedValue, metric.limitValue);
    await db.insert(usageSnapshots).values({
      userId,
      vercelConnectionId: connectionId,
      metricKey: metric.metricKey,
      usedValue: metric.usedValue,
      limitValue: metric.limitValue,
      percentageUsed: percentage,
      remainingValue: Math.max(0, metric.limitValue - metric.usedValue),
      unit: metric.unit,
      rawPayload: { used: metric.usedValue, limit: metric.limitValue },
    });
  }
}

export async function logMonitorRun(
  status: string,
  usersChecked: number,
  alertsSent: number,
  errorMessage?: string
) {
  const [run] = await db
    .insert(monitorRuns)
    .values({
      status,
      usersChecked,
      alertsSent,
      errorMessage: errorMessage || null,
      finishedAt: status === "completed" || status === "failed" ? new Date() : undefined,
    })
    .returning();
  return run;
}

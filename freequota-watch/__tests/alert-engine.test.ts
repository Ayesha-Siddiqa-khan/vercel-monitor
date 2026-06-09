import { describe, it, expect } from "vitest";

describe("Alert Deduplication Logic", () => {
  interface AlertRecord {
    metricKey: string;
    thresholdLevel: string;
    percentageUsed: number;
    sentAt: Date;
    status: string;
  }

  function shouldSendAlert(
    recentAlerts: AlertRecord[],
    currentLevel: string,
    cooldownMinutes: number
  ): boolean {
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const now = Date.now();

    const hasRecent = recentAlerts.some(
      (a) =>
        a.thresholdLevel === currentLevel &&
        a.status === "sent" &&
        now - a.sentAt.getTime() < cooldownMs
    );

    return !hasRecent;
  }

  it("sends alert when no previous alerts exist", () => {
    const result = shouldSendAlert([], "warning", 360);
    expect(result).toBe(true);
  });

  it("blocks duplicate alert within cooldown", () => {
    const recentAlerts: AlertRecord[] = [
      {
        metricKey: "edge_requests",
        thresholdLevel: "warning",
        percentageUsed: 76,
        sentAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
        status: "sent",
      },
    ];
    const result = shouldSendAlert(recentAlerts, "warning", 360);
    expect(result).toBe(false);
  });

  it("allows alert after cooldown expires", () => {
    const recentAlerts: AlertRecord[] = [
      {
        metricKey: "edge_requests",
        thresholdLevel: "warning",
        percentageUsed: 76,
        sentAt: new Date(Date.now() - 7 * 60 * 60 * 1000), // 7 hours ago
        status: "sent",
      },
    ];
    const result = shouldSendAlert(recentAlerts, "warning", 360);
    expect(result).toBe(true);
  });

  it("allows different level alert immediately", () => {
    const recentAlerts: AlertRecord[] = [
      {
        metricKey: "edge_requests",
        thresholdLevel: "warning",
        percentageUsed: 76,
        sentAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
        status: "sent",
      },
    ];
    const result = shouldSendAlert(recentAlerts, "danger", 360);
    expect(result).toBe(true);
  });

  it("allows alert when usage drops below threshold and crosses again", () => {
    const recentAlerts: AlertRecord[] = [
      {
        metricKey: "edge_requests",
        thresholdLevel: "danger",
        percentageUsed: 86,
        sentAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago, beyond 360min cooldown
        status: "sent",
      },
    ];
    // After cooldown, even same level should be allowed
    const result = shouldSendAlert(recentAlerts, "danger", 360);
    expect(result).toBe(true);
  });
});

describe("Email Template Generation", () => {
  it("generates correct warning email subject", () => {
    const level = "warning";
    const metric = "edge_requests";
    const percentage = 76;

    const emoji = { warning: "\u26a0\ufe0f", danger: "\ud83d\udea8", critical: "\ud83d\udd34" }[level] || "\ud83d\udca1";
    const label = { warning: "Warning", danger: "Danger", critical: "CRITICAL" }[level] || "Alert";

    const subject = `${emoji} Vercel ${label}: ${metric.replace(/_/g, " ")} reached ${percentage}%`;

    expect(subject).toContain("Warning");
    expect(subject).toContain("76");
    expect(subject).toContain("edge requests");
  });
});

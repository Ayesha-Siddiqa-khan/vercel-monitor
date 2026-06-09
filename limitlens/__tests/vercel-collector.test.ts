import { describe, it, expect } from "vitest";
import {
  getPercentageUsed,
  getStatusLevel,
  getRecommendation,
  toNormalizedMetrics,
  createSimulatedUsage,
  NormalizedMetric,
} from "../src/services/vercel-collector";

describe("getPercentageUsed", () => {
  it("calculates percentage correctly", () => {
    expect(getPercentageUsed(50, 100)).toBe(50);
    expect(getPercentageUsed(100, 100)).toBe(100);
    expect(getPercentageUsed(0, 100)).toBe(0);
    expect(getPercentageUsed(150, 100)).toBe(100); // capped at 100
    expect(getPercentageUsed(0, 0)).toBe(0);
  });
});

describe("getStatusLevel", () => {
  it("returns safe for 0-49%", () => {
    expect(getStatusLevel(0)).toBe("safe");
    expect(getStatusLevel(25)).toBe("safe");
    expect(getStatusLevel(49)).toBe("safe");
  });

  it("returns watch for 50-74%", () => {
    expect(getStatusLevel(50)).toBe("watch");
    expect(getStatusLevel(60)).toBe("watch");
    expect(getStatusLevel(74)).toBe("watch");
  });

  it("returns warning for 75-84%", () => {
    expect(getStatusLevel(75)).toBe("warning");
    expect(getStatusLevel(80)).toBe("warning");
    expect(getStatusLevel(84)).toBe("warning");
  });

  it("returns danger for 85-94%", () => {
    expect(getStatusLevel(85)).toBe("danger");
    expect(getStatusLevel(90)).toBe("danger");
    expect(getStatusLevel(94)).toBe("danger");
  });

  it("returns critical for 95%+", () => {
    expect(getStatusLevel(95)).toBe("critical");
    expect(getStatusLevel(98)).toBe("critical");
    expect(getStatusLevel(100)).toBe("critical");
  });
});

describe("getRecommendation", () => {
  it("returns appropriate recommendation for warning", () => {
    const rec = getRecommendation("warning", "edge_requests");
    expect(rec).toContain("growing");
  });

  it("returns appropriate recommendation for danger", () => {
    const rec = getRecommendation("danger", "function_invocations");
    expect(rec).toContain("approaching");
  });

  it("returns appropriate recommendation for critical", () => {
    const rec = getRecommendation("critical", "fast_data_transfer");
    expect(rec).toContain("critically");
  });

  it("returns safe recommendation for safe level", () => {
    const rec = getRecommendation("safe", "any_metric");
    expect(rec).toContain("safe");
  });
});

describe("Simulated Usage Payloads", () => {
  it("creates 20% usage correctly", () => {
    const data = createSimulatedUsage({
      edge_requests: 200_000,
      fast_data_transfer: 20,
    });
    const metrics = toNormalizedMetrics(data);

    const edgeMetric = metrics.find((m) => m.metricKey === "edge_requests");
    expect(edgeMetric).toBeDefined();
    expect(getPercentageUsed(edgeMetric!.usedValue, edgeMetric!.limitValue)).toBe(20);

    const bwMetric = metrics.find((m) => m.metricKey === "fast_data_transfer");
    expect(bwMetric).toBeDefined();
    expect(getPercentageUsed(bwMetric!.usedValue, bwMetric!.limitValue)).toBe(20);
  });

  it("creates 76% usage correctly (warning level)", () => {
    const data = createSimulatedUsage({
      edge_requests: 760_000,
    });
    const metrics = toNormalizedMetrics(data);

    const metric = metrics.find((m) => m.metricKey === "edge_requests")!;
    const pct = getPercentageUsed(metric.usedValue, metric.limitValue);
    expect(pct).toBe(76);
    expect(getStatusLevel(pct)).toBe("warning");
  });

  it("creates 86% usage correctly (danger level)", () => {
    const data = createSimulatedUsage({
      fast_data_transfer: 86,
    });
    const metrics = toNormalizedMetrics(data);

    const metric = metrics.find((m) => m.metricKey === "fast_data_transfer")!;
    const pct = getPercentageUsed(metric.usedValue, metric.limitValue);
    expect(pct).toBe(86);
    expect(getStatusLevel(pct)).toBe("danger");
  });

  it("creates 96% usage correctly (critical level)", () => {
    const data = createSimulatedUsage({
      function_invocations: 960_000,
    });
    const metrics = toNormalizedMetrics(data);

    const metric = metrics.find((m) => m.metricKey === "function_invocations")!;
    const pct = getPercentageUsed(metric.usedValue, metric.limitValue);
    expect(pct).toBe(96);
    expect(getStatusLevel(pct)).toBe("critical");
  });
});

describe("toNormalizedMetrics", () => {
  it("produces correct number of metrics", () => {
    const data = createSimulatedUsage();
    const metrics = toNormalizedMetrics(data);
    expect(metrics).toHaveLength(9);
  });

  it("each metric has required fields", () => {
    const data = createSimulatedUsage();
    const metrics = toNormalizedMetrics(data);

    for (const m of metrics) {
      expect(m.metricKey).toBeTruthy();
      expect(typeof m.usedValue).toBe("number");
      expect(typeof m.limitValue).toBe("number");
      expect(typeof m.unit).toBe("string");
      expect(m.limitValue).toBeGreaterThan(0);
    }
  });
});

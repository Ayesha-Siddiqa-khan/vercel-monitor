import { db } from "@/db";
import { alertRules } from "@/db/schema";
import { eq, and } from "drizzle-orm";

const DEFAULT_METRICS = [
  "active_cpu_hours",
  "provisioned_memory",
  "edge_requests",
  "function_invocations",
  "fast_data_transfer",
  "isr_reads",
  "isr_writes",
  "build_execution_minutes",
  "project_count",
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const rules = await db
    .select()
    .from(alertRules)
    .where(eq(alertRules.userId, userId));

  return Response.json({ rules });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return Response.json({ error: "userId is required" }, { status: 400 });
    }

    const existingRules = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.userId, userId));

    const existingMetricKeys = new Set(existingRules.map((r) => r.metricKey));

    const newRules = DEFAULT_METRICS.filter((m) => !existingMetricKeys.has(m)).map((metricKey) => ({
      userId,
      metricKey,
      warningThreshold: 75,
      dangerThreshold: 85,
      criticalThreshold: 95,
      cooldownMinutes: 60,
      enabled: true,
    }));

    if (newRules.length > 0) {
      await db.insert(alertRules).values(newRules);
    }

    const allRules = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.userId, userId));

    return Response.json({ rules: allRules, created: newRules.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { userId, metricKey, warningThreshold, dangerThreshold, criticalThreshold, cooldownMinutes, enabled } = body;

    if (!userId || !metricKey) {
      return Response.json({ error: "userId and metricKey required" }, { status: 400 });
    }

    await db
      .update(alertRules)
      .set({
        warningThreshold,
        dangerThreshold,
        criticalThreshold,
        cooldownMinutes,
        enabled,
      })
      .where(and(eq(alertRules.userId, userId), eq(alertRules.metricKey, metricKey)));

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

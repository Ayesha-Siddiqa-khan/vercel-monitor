import { db } from "@/db";
import { alertRules } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUserId } from "@/lib/supabase/api-auth";

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

export async function GET() {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const rules = await db
    .select()
    .from(alertRules)
    .where(eq(alertRules.userId, auth.userId));

  return Response.json({ rules });
}

export async function POST() {
  try {
    const auth = await getAuthenticatedUserId();
    if (auth.error) return auth.error;

    const existingRules = await db
      .select()
      .from(alertRules)
      .where(eq(alertRules.userId, auth.userId));

    const existingMetricKeys = new Set(existingRules.map((r) => r.metricKey));

    const newRules = DEFAULT_METRICS.filter((m) => !existingMetricKeys.has(m)).map((metricKey) => ({
      userId: auth.userId,
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
      .where(eq(alertRules.userId, auth.userId));

    return Response.json({ rules: allRules, created: newRules.length });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getAuthenticatedUserId();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { metricKey, warningThreshold, dangerThreshold, criticalThreshold, cooldownMinutes, enabled } = body;

    if (!metricKey) {
      return Response.json({ error: "metricKey required" }, { status: 400 });
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
      .where(and(eq(alertRules.userId, auth.userId), eq(alertRules.metricKey, metricKey)));

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

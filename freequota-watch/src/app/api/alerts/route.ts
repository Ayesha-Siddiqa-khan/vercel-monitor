import { db } from "@/db";
import { alertRules } from "@/db/schema";
import { eq, and } from "drizzle-orm";

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

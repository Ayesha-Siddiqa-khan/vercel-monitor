import { db } from "@/db";
import { usageSnapshots } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthenticatedUserId } from "@/lib/supabase/api-auth";

export async function GET() {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const latestSnapshots = await db
    .select()
    .from(usageSnapshots)
    .where(eq(usageSnapshots.userId, auth.userId))
    .orderBy(desc(usageSnapshots.checkedAt))
    .limit(50);

  const grouped: Record<string, typeof latestSnapshots[0]> = {};
  for (const snap of latestSnapshots) {
    if (!grouped[snap.metricKey]) {
      grouped[snap.metricKey] = snap;
    }
  }

  return Response.json({
    usage: Object.values(grouped),
    lastChecked: grouped[Object.keys(grouped)[0]]?.checkedAt || null,
  });
}

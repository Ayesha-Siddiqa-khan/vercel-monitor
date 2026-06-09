import { db } from "@/db";
import { usageSnapshots } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getAuthenticatedUserId } from "@/lib/supabase/api-auth";

export async function GET(request: Request) {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const metricKey = searchParams.get("metricKey");

  let query = db
    .select()
    .from(usageSnapshots)
    .where(eq(usageSnapshots.userId, auth.userId))
    .orderBy(asc(usageSnapshots.checkedAt))
    .limit(200);

  const snapshots = await query;

  const filtered = metricKey
    ? snapshots.filter((s) => s.metricKey === metricKey)
    : snapshots;

  return Response.json({ history: filtered });
}

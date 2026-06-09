import { db } from "@/db";
import { usageSnapshots } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const metricKey = searchParams.get("metricKey");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  let query = db
    .select()
    .from(usageSnapshots)
    .where(eq(usageSnapshots.userId, userId))
    .orderBy(asc(usageSnapshots.checkedAt))
    .limit(200);

  const snapshots = await query;

  const filtered = metricKey
    ? snapshots.filter((s) => s.metricKey === metricKey)
    : snapshots;

  return Response.json({ history: filtered });
}

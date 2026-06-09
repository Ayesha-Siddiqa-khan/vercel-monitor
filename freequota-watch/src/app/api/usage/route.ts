import { db } from "@/db";
import { usageSnapshots, users, vercelConnections } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const latestSnapshots = await db
    .select()
    .from(usageSnapshots)
    .where(eq(usageSnapshots.userId, userId))
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

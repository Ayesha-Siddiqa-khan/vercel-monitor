import { db } from "../db";
import { users, vercelConnections } from "../db/schema";
import { eq } from "drizzle-orm";
import { fetchVercelUsage, toNormalizedMetrics } from "./vercel-collector";
import { checkAndSendAlerts, recordUsageSnapshots, logMonitorRun } from "./alert-engine";
import { seedResourceLimits } from "../db/seed";

export async function runMonitor() {
  console.log("[Monitor] Starting usage monitor run...");
  const startTime = Date.now();

  try {
    await seedResourceLimits();
    console.log("[Monitor] Resource limits seeded.");

    const connections = await db
      .select({
        connectionId: vercelConnections.id,
        userId: vercelConnections.userId,
        userEmail: users.email,
        userName: users.name,
        encryptedToken: vercelConnections.encryptedVercelToken,
      })
      .from(vercelConnections)
      .innerJoin(users, eq(vercelConnections.userId, users.id))
      .where(eq(vercelConnections.status, "active"));

    console.log(`[Monitor] Found ${connections.length} active connection(s).`);

    let totalAlerts = 0;

    for (const conn of connections) {
      console.log(`[Monitor] Processing user: ${conn.userEmail}`);

      try {
        const usageData = await fetchVercelUsage(conn.encryptedToken);
        const metrics = toNormalizedMetrics(usageData);

        await recordUsageSnapshots(conn.userId, conn.connectionId, metrics);
        console.log(`[Monitor] Snapshots recorded for ${conn.userEmail}`);

        const alertResult = await checkAndSendAlerts(
          conn.userId,
          conn.userName || conn.userEmail,
          metrics
        );
        totalAlerts += alertResult.alertsSent;
        console.log(`[Monitor] Alerts for ${conn.userEmail}: ${alertResult.alertsSent} sent`);
      } catch (err: any) {
        console.error(`[Monitor] Error processing ${conn.userEmail}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    await logMonitorRun("completed", connections.length, totalAlerts);
    console.log(`[Monitor] Completed in ${duration}ms. Users: ${connections.length}, Alerts: ${totalAlerts}`);
  } catch (err: any) {
    console.error("[Monitor] Fatal error:", err.message);
    await logMonitorRun("failed", 0, 0, err.message);
    throw err;
  }
}

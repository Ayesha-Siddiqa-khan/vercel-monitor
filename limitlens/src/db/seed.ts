import { db } from "./index";
import { users, vercelConnections, resourceLimits, alertRules, notificationChannels } from "./schema";
import { HOBBY_LIMITS } from "../lib/limits";
import { encrypt } from "../lib/encryption";
import { eq, and } from "drizzle-orm";

export async function seedResourceLimits() {
  for (const limit of HOBBY_LIMITS) {
    await db
      .insert(resourceLimits)
      .values(limit)
      .onConflictDoNothing({ target: [resourceLimits.planName, resourceLimits.metricKey] });
  }
}

export async function getOrCreateUser(email: string, name?: string) {
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db.insert(users).values({ email, name }).returning();
  return created;
}

export async function createVercelConnection(
  userId: string,
  vercelToken: string,
  teamId?: string,
  connectionName?: string
) {
  const encryptedToken = encrypt(vercelToken);
  const [created] = await db
    .insert(vercelConnections)
    .values({
      userId,
      encryptedVercelToken: encryptedToken,
      teamId: teamId || null,
      connectionName: connectionName || "default",
      lastValidatedAt: new Date(),
    })
    .returning();
  return created;
}

export async function getDefaultAlertRules(userId: string) {
  const metrics = HOBBY_LIMITS.map((l) => l.metricKey);
  const rules = [];
  for (const metricKey of metrics) {
    const existing = await db
      .select()
      .from(alertRules)
      .where(and(eq(alertRules.userId, userId), eq(alertRules.metricKey, metricKey)))
      .limit(1);
    if (existing.length === 0) {
      const [created] = await db
        .insert(alertRules)
        .values({ userId, metricKey })
        .returning();
      rules.push(created);
    } else {
      rules.push(existing[0]);
    }
  }
  return rules;
}

export async function getDefaultNotificationChannel(userId: string, email: string) {
  const existing = await db
    .select()
    .from(notificationChannels)
    .where(eq(notificationChannels.userId, userId))
    .limit(1);
  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(notificationChannels)
    .values({ userId, emailTo: email })
    .returning();
  return created;
}

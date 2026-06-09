import { db } from "./index";
import { users, vercelConnections } from "./schema";
import { eq } from "drizzle-orm";

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: Date;
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function getVercelConnection(userId: string) {
  const result = await db
    .select()
    .from(vercelConnections)
    .where(eq(vercelConnections.userId, userId))
    .limit(1);
  return result[0] || null;
}

export async function getActiveVercelConnections() {
  return await db
    .select()
    .from(vercelConnections)
    .where(eq(vercelConnections.status, "active"));
}

export async function getVercelConnectionById(id: string) {
  const result = await db
    .select()
    .from(vercelConnections)
    .where(eq(vercelConnections.id, id))
    .limit(1);
  return result[0] || null;
}

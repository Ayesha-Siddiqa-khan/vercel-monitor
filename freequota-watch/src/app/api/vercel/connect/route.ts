import { db } from "@/db";
import { vercelConnections, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { encrypt } from "@/lib/encryption";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, vercelToken, teamId, connectionName } = body;

    if (!userId || !vercelToken) {
      return Response.json({ error: "userId and vercelToken are required" }, { status: 400 });
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const testRes = await fetch("https://api.vercel.com/v2/user", {
      headers: { Authorization: `Bearer ${vercelToken}` },
    });
    if (!testRes.ok) {
      return Response.json({ error: "Invalid Vercel token" }, { status: 400 });
    }

    const encryptedToken = encrypt(vercelToken);
    const [connection] = await db
      .insert(vercelConnections)
      .values({
        userId,
        encryptedVercelToken: encryptedToken,
        teamId: teamId || null,
        connectionName: connectionName || "default",
        lastValidatedAt: new Date(),
      })
      .returning();

    return Response.json({
      success: true,
      connection: { id: connection.id, connectionName: connection.connectionName },
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

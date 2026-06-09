import { db } from "@/db";
import { users, vercelConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return Response.json({ error: "userId is required" }, { status: 400 });
  }

  const connection = await db
    .select()
    .from(vercelConnections)
    .where(eq(vercelConnections.userId, userId))
    .limit(1);

  if (connection.length === 0 || connection[0].status !== "active") {
    return Response.json({ projects: [], connected: false });
  }

  try {
    const token = decrypt(connection[0].encryptedVercelToken);
    const headers = { Authorization: `Bearer ${token}` };

    const [projectsRes, teamsRes] = await Promise.all([
      fetch("https://api.vercel.com/v9/projects", { headers }),
      fetch("https://api.vercel.com/v2/teams", { headers }),
    ]);

    if (!projectsRes.ok) {
      return Response.json({ projects: [], connected: true, error: "Failed to fetch projects" });
    }

    const projectsData = await projectsRes.json();
    let teamSlug = "";

    if (teamsRes.ok) {
      const teamsData = await teamsRes.json();
      const team = teamsData.teams?.[0];
      if (team?.slug) {
        teamSlug = team.slug;
      }
    }

    const projects = (projectsData.projects || []).map((p: any) => ({
      id: p.id,
      name: p.name,
      framework: p.framework,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      targets: p.targets ? Object.keys(p.targets) : [],
      vercelUrl: teamSlug ? `https://vercel.com/${teamSlug}/${p.name}` : "#",
      latestDeployment: p.latestDeployments?.[0] ? {
        url: p.latestDeployments[0].url,
        createdAt: p.latestDeployments[0].createdAt,
        state: p.latestDeployments[0].state,
      } : null,
    }));

    return Response.json({ projects, connected: true });
  } catch (err: any) {
    return Response.json({ projects: [], connected: true, error: err.message });
  }
}

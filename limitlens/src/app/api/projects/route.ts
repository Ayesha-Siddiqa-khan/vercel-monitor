import { db } from "@/db";
import { vercelConnections } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decrypt } from "@/lib/encryption";
import { getAuthenticatedUserId } from "@/lib/supabase/api-auth";

export async function GET() {
  const auth = await getAuthenticatedUserId();
  if (auth.error) return auth.error;

  const connection = await db
    .select()
    .from(vercelConnections)
    .where(eq(vercelConnections.userId, auth.userId))
    .limit(1);

  if (connection.length === 0 || connection[0].status !== "active") {
    return Response.json({ projects: [], connected: false });
  }

  try {
    const token = decrypt(connection[0].encryptedVercelToken);
    const headers = { Authorization: `Bearer ${token}` };

    const [projectsRes, teamsRes] = await Promise.all([
      fetch("https://api.vercel.com/v10/projects", { headers }),
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

    const projects = (projectsData.projects || []).map((p: any) => {
      // Determine live/production URL from Vercel API data
      let liveUrl: string | null = null;

      // 1. Check for a production alias from the v10 projects endpoint
      const prodAlias = p.alias?.find(
        (a: any) =>
          a.environment === "production" || a.target === "PRODUCTION"
      );
      if (prodAlias?.domain) {
        liveUrl = `https://${prodAlias.domain}`;
      }

      // 2. Fall back to production deployment URL
      if (!liveUrl) {
        const prodDeployment = p.latestDeployments?.find(
          (d: any) => d.target === "production"
        );
        if (prodDeployment?.url) {
          liveUrl = prodDeployment.url.startsWith("http")
            ? prodDeployment.url
            : `https://${prodDeployment.url}`;
        }
      }

      // 3. Fall back to first deployment URL
      if (!liveUrl && p.latestDeployments?.[0]?.url) {
        const url = p.latestDeployments[0].url;
        liveUrl = url.startsWith("http") ? url : `https://${url}`;
      }

      // 4. Fall back to constructed name-based URL
      if (!liveUrl && p.name) {
        liveUrl = `https://${p.name}.vercel.app`;
      }

      return {
        id: p.id,
        name: p.name,
        framework: p.framework,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        targets: p.targets ? Object.keys(p.targets) : [],
        vercelUrl: teamSlug ? `https://vercel.com/${teamSlug}/${p.name}` : "#",
        liveUrl,
        latestDeployment: p.latestDeployments?.[0]
          ? {
              url: p.latestDeployments[0].url,
              createdAt: p.latestDeployments[0].createdAt,
              state: (p.latestDeployments[0].readyState || "unknown").toLowerCase(),
            }
          : null,
      };
    });

    return Response.json({ projects, connected: true });
  } catch (err: any) {
    return Response.json({ projects: [], connected: true, error: err.message });
  }
}

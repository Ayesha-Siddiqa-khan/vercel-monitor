import { runMonitor } from "@/services/monitor";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const secret = process.env.MONITOR_API_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runMonitor();
    return Response.json({ success: true, message: "Monitor run completed" });
  } catch (error: any) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}

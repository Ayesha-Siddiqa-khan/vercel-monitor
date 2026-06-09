import { createClient } from "@/lib/supabase/server";

export async function getAuthenticatedUserId(): Promise<{ userId: string; error?: never } | { userId?: never; error: Response }> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  return { userId: user.id };
}

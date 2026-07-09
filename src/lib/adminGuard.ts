import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { requireEnv } from "@/lib/env";

// The admin security boundary: session email must be in the ADMIN_EMAILS
// allowlist (comma-separated env). Used by the (admin) layout (redirect)
// and by every /api/admin/* handler (403).
export async function getAdminUser(): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return null;
  const allowlist = requireEnv("ADMIN_EMAILS")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(user.email.toLowerCase()) ? user : null;
}

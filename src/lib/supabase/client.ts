import { createBrowserClient } from "@supabase/ssr";
import { requireEnvValue } from "@/lib/env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient(
      requireEnvValue(
        "NEXT_PUBLIC_SUPABASE_URL",
        process.env.NEXT_PUBLIC_SUPABASE_URL,
      ),
      requireEnvValue(
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      ),
    );
  }
  return client;
}

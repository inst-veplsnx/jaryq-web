import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

// Server-only. Bypasses RLS — must never be imported from client code.
export function createSupabaseAdminClient() {
  return createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Recomputes books.total_duration / total_chapters from the chapter rows.
// Called after every chapter mutation — self-heals any drift.
export async function recomputeBookTotals(admin: SupabaseClient, bookId: string) {
  const { data, error } = await admin
    .from("chapters")
    .select("duration")
    .eq("book_id", bookId);
  if (error) throw new Error(error.message);
  const totalDuration = (data ?? []).reduce((sum, c) => sum + (c.duration ?? 0), 0);
  const { error: updateError } = await admin
    .from("books")
    .update({ total_duration: totalDuration, total_chapters: (data ?? []).length })
    .eq("id", bookId);
  if (updateError) throw new Error(updateError.message);
}

import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { createSupabaseAdminClient, recomputeBookTotals } from "@/lib/supabase/admin";
import { validAudioUrl } from "../fields";

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { book_id, title, chapter_number, audio_url, duration } = await request.json();
  if (!book_id || !title || typeof chapter_number !== "number") {
    return NextResponse.json(
      { error: "book_id, title and chapter_number are required" },
      { status: 400 }
    );
  }
  if (!validAudioUrl(audio_url)) {
    return NextResponse.json(
      { error: "audio_url must point to the R2 bucket" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("chapters")
    .insert({ book_id, title, chapter_number, audio_url, duration: duration ?? null })
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await recomputeBookTotals(admin, book_id);
  return NextResponse.json({ chapter: data });
}

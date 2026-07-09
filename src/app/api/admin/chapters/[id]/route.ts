import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { createSupabaseAdminClient, recomputeBookTotals } from "@/lib/supabase/admin";
import { deleteObject, keyFromPublicUrl } from "@/lib/r2";
import { validAudioUrl } from "../../fields";

type Params = { params: Promise<{ id: string }> };

const PATCHABLE = ["title", "chapter_number", "audio_url", "duration"] as const;

export async function PATCH(request: Request, { params }: Params) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();

  const values: Record<string, unknown> = {};
  for (const f of PATCHABLE) if (f in body) values[f] = body[f];
  if ("audio_url" in values && !validAudioUrl(values.audio_url)) {
    return NextResponse.json(
      { error: "audio_url must point to the R2 bucket" },
      { status: 400 }
    );
  }

  const admin = createSupabaseAdminClient();

  // If audio is being replaced, remember the old object to delete after.
  let oldAudioKey: string | null = null;
  if ("audio_url" in values) {
    const { data: existing } = await admin
      .from("chapters")
      .select("audio_url")
      .eq("id", id)
      .single();
    if (existing?.audio_url && existing.audio_url !== values.audio_url) {
      oldAudioKey = keyFromPublicUrl(existing.audio_url);
    }
  }

  const { data, error } = await admin
    .from("chapters")
    .update(values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (oldAudioKey) await deleteObject(oldAudioKey);
  if ("duration" in values) await recomputeBookTotals(admin, data.book_id);
  return NextResponse.json({ chapter: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  const { data: chapter, error: fetchError } = await admin
    .from("chapters")
    .select("book_id, audio_url")
    .eq("id", id)
    .single();
  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 404 });
  }

  // user_progress.chapter_id has no ON DELETE — clear those rows first or
  // the chapter delete is blocked by the FK.
  const { error: progressError } = await admin
    .from("user_progress")
    .delete()
    .eq("chapter_id", id);
  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  const { error } = await admin.from("chapters").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const key = keyFromPublicUrl(chapter.audio_url);
  if (key) await deleteObject(key);
  await recomputeBookTotals(admin, chapter.book_id);

  return NextResponse.json({ ok: true });
}

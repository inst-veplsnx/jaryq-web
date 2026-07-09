import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { deleteObject, keyFromPublicUrl } from "@/lib/r2";
import { pickBookFields } from "../../fields";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const body = await request.json();
  const fields = pickBookFields(body);
  if (fields.error) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();

  // If the cover is being replaced, remember the old object to delete after.
  let oldCoverKey: string | null = null;
  if ("cover_url" in fields.values) {
    const { data: existing } = await admin
      .from("books")
      .select("cover_url")
      .eq("id", id)
      .single();
    if (existing?.cover_url && existing.cover_url !== fields.values.cover_url) {
      oldCoverKey = keyFromPublicUrl(existing.cover_url);
    }
  }

  const { data, error } = await admin
    .from("books")
    .update(fields.values)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (oldCoverKey) await deleteObject(oldCoverKey);
  return NextResponse.json({ book: data });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const admin = createSupabaseAdminClient();

  // Collect every R2 key first (cover + all chapter audio).
  const { data: book, error: bookError } = await admin
    .from("books")
    .select("cover_url")
    .eq("id", id)
    .single();
  if (bookError) {
    return NextResponse.json({ error: bookError.message }, { status: 404 });
  }
  const { data: chapters } = await admin
    .from("chapters")
    .select("audio_url")
    .eq("book_id", id);

  const keys = [book.cover_url, ...(chapters ?? []).map((c) => c.audio_url)]
    .map(keyFromPublicUrl)
    .filter((k): k is string => k !== null);

  // user_progress.chapter_id has no ON DELETE — clear progress rows first so
  // the chapter cascade from the book delete can't be blocked.
  const { error: progressError } = await admin
    .from("user_progress")
    .delete()
    .eq("book_id", id);
  if (progressError) {
    return NextResponse.json({ error: progressError.message }, { status: 500 });
  }

  // Row first, storage second: a failed R2 delete leaves only orphaned
  // objects, never broken catalog rows.
  const { error } = await admin.from("books").delete().eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  await Promise.all(keys.map(deleteObject));

  return NextResponse.json({ ok: true });
}

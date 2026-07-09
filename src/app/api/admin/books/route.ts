import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { pickBookFields } from "../fields";

export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const fields = pickBookFields(body);
  if (!fields.title || !fields.author) {
    return NextResponse.json({ error: "title and author are required" }, { status: 400 });
  }
  if (fields.error) {
    return NextResponse.json({ error: fields.error }, { status: 400 });
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("books")
    .insert(fields.values)
    .select("*")
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ book: data });
}

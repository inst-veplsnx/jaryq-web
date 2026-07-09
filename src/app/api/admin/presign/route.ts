import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/adminGuard";
import { presignPut, publicUrl } from "@/lib/r2";

// Returns a presigned R2 PUT URL. The browser uploads the raw file bytes
// directly to R2 — nothing is proxied, compressed, or re-encoded.
export async function POST(request: Request) {
  if (!(await getAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { kind, bookId, filename, contentType } = await request.json();

  if (kind !== "cover" && kind !== "chapter") {
    return NextResponse.json({ error: "kind must be cover|chapter" }, { status: 400 });
  }
  if (typeof bookId !== "string" || !/^[0-9a-f-]{36}$/i.test(bookId)) {
    return NextResponse.json({ error: "invalid bookId" }, { status: 400 });
  }
  const expectedPrefix = kind === "cover" ? "image/" : "audio/";
  if (typeof contentType !== "string" || !contentType.startsWith(expectedPrefix)) {
    return NextResponse.json(
      { error: `contentType must be ${expectedPrefix}*` },
      { status: 400 }
    );
  }

  const extMatch = typeof filename === "string" ? filename.match(/\.([a-z0-9]{1,5})$/i) : null;
  const ext = (extMatch?.[1] ?? contentType.split("/")[1] ?? "bin").toLowerCase();

  const key =
    kind === "cover"
      ? `books/${bookId}/cover-${Date.now()}.${ext}`
      : `books/${bookId}/chapters/${crypto.randomUUID()}.${ext}`;

  return NextResponse.json({
    uploadUrl: await presignPut(key),
    publicUrl: publicUrl(key),
  });
}

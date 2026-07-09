import { requireEnv } from "@/lib/env";

// Whitelist-picks writable book columns from a request body (no mass
// assignment of id/created_at/totals) and rejects media URLs that don't
// point into our R2 bucket.

const BOOK_FIELDS = [
  "title",
  "author",
  "narrator",
  "description",
  "cover_url",
  "genre_id",
  "language",
  "is_new",
  "is_popular",
] as const;

export function pickBookFields(body: Record<string, unknown>) {
  const values: Record<string, unknown> = {};
  for (const f of BOOK_FIELDS) {
    if (f in body) values[f] = body[f];
  }
  if (
    typeof values.cover_url === "string" &&
    values.cover_url !== "" &&
    !values.cover_url.startsWith(requireEnv("R2_PUBLIC_BASE_URL") + "/")
  ) {
    return { values, error: "cover_url must point to the R2 bucket" };
  }
  return { values, title: values.title, author: values.author, error: null };
}

export function validAudioUrl(url: unknown): url is string {
  return (
    typeof url === "string" &&
    url.startsWith(requireEnv("R2_PUBLIC_BASE_URL") + "/")
  );
}

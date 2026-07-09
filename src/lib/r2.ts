import { AwsClient } from "aws4fetch";
import { requireEnv } from "@/lib/env";

// Server-only. R2 is S3-compatible; aws4fetch does SigV4 over plain fetch.

function client() {
  return new AwsClient({
    accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
    secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
  });
}

function bucketObjectUrl(key: string) {
  return `https://${requireEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com/${requireEnv(
    "R2_BUCKET"
  )}/${key}`;
}

// Query-signed PUT URL, 1h expiry. Content-Type is deliberately left out of
// the signature — R2 stores whatever Content-Type the browser sends, and the
// file bytes are stored exactly as uploaded (no re-encoding anywhere).
export async function presignPut(key: string): Promise<string> {
  const url = new URL(bucketObjectUrl(key));
  url.searchParams.set("X-Amz-Expires", "3600");
  const signed = await client().sign(new Request(url, { method: "PUT" }), {
    aws: { signQuery: true },
  });
  return signed.url;
}

export function publicUrl(key: string) {
  return `${requireEnv("R2_PUBLIC_BASE_URL")}/${key}`;
}

// Inverse of publicUrl. Returns null for URLs outside our bucket (legacy seed
// data, external hosts) so delete flows can skip them safely.
export function keyFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const base = requireEnv("R2_PUBLIC_BASE_URL") + "/";
  return url.startsWith(base) ? url.slice(base.length) : null;
}

export async function deleteObject(key: string): Promise<void> {
  const res = await client().fetch(bucketObjectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) {
    throw new Error(`R2 delete failed for ${key}: ${res.status}`);
  }
}

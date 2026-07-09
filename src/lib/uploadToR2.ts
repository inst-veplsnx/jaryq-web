// Client-side upload helpers for the admin area.

// Reads duration (seconds) from an audio file's metadata in the browser —
// no server processing, the file itself is never decoded/re-encoded.
export function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(Math.round(audio.duration));
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Аудио метадеректерін оқу мүмкін болмады"));
    };
    audio.src = url;
  });
}

// Raw PUT of the file bytes to a presigned R2 URL. XHR because fetch has no
// upload progress events.
export function uploadToR2(
  uploadUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Жүктеу сәтсіз: HTTP ${xhr.status}`));
    xhr.onerror = () =>
      reject(new Error("Желі қатесі — R2 бакетінің CORS баптауын тексеріңіз"));
    xhr.send(file);
  });
}

// presign + upload in one call; returns the public URL to store in the DB.
export async function presignAndUpload(
  kind: "cover" | "chapter",
  bookId: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<string> {
  const res = await fetch("/api/admin/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind,
      bookId,
      filename: file.name,
      contentType: file.type,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Presign failed: HTTP ${res.status}`);
  }
  const { uploadUrl, publicUrl } = await res.json();
  await uploadToR2(uploadUrl, file, onProgress);
  return publicUrl;
}

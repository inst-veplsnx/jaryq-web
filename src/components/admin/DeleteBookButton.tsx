"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function DeleteBookButton({
  bookId,
  title,
}: {
  bookId: string;
  title: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`«${title}» кітабын өшіру? Барлық тараулар мен аудио файлдар жойылады.`)) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/books/${bookId}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? `HTTP ${res.status}`);
      }
      toast.success("Кітап өшірілді");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Өшіру сәтсіз аяқталды");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleDelete}
      disabled={deleting}
    >
      {deleting ? "Өшірілуде…" : "Өшіру"}
    </Button>
  );
}

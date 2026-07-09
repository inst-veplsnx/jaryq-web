"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Book, Chapter, Genre } from "@/types";
import { presignAndUpload, readAudioDuration } from "@/lib/uploadToR2";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

interface ChapterRow {
  localId: string;
  id?: string; // set for chapters already in the DB
  title: string;
  chapter_number: number;
  duration: number | null;
  audio_url?: string;
  file?: File; // new upload (new row, or replacement on an existing row)
  progress: number | null;
}

interface Props {
  genres: Genre[];
  book?: Book;
  chapters?: Chapter[];
}

async function api(path: string, method: string, body?: unknown) {
  const res = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? `HTTP ${res.status}`);
  return json;
}

export function BookForm({ genres, book, chapters }: Props) {
  const router = useRouter();
  const isEdit = !!book;

  const [title, setTitle] = useState(book?.title ?? "");
  const [author, setAuthor] = useState(book?.author ?? "");
  const [narrator, setNarrator] = useState(book?.narrator ?? "");
  const [description, setDescription] = useState(book?.description ?? "");
  const [genreId, setGenreId] = useState(book?.genre_id ?? "");
  const [language, setLanguage] = useState(book?.language ?? "kk");
  const [isNew, setIsNew] = useState(book?.is_new ?? true);
  const [isPopular, setIsPopular] = useState(book?.is_popular ?? false);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    book?.cover_url ?? null
  );
  const [coverProgress, setCoverProgress] = useState<number | null>(null);

  const [rows, setRows] = useState<ChapterRow[]>(
    (chapters ?? []).map((c) => ({
      localId: c.id,
      id: c.id,
      title: c.title,
      chapter_number: c.chapter_number,
      duration: c.duration,
      audio_url: c.audio_url,
      progress: null,
    }))
  );
  // Snapshot of persisted values to detect edits on save.
  const initialRows = useRef(
    new Map(
      (chapters ?? []).map((c) => [
        c.id,
        { title: c.title, chapter_number: c.chapter_number },
      ])
    )
  );

  const [saving, setSaving] = useState(false);

  function updateRow(localId: string, patch: Partial<ChapterRow>) {
    setRows((rs) => rs.map((r) => (r.localId === localId ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      {
        localId: crypto.randomUUID(),
        title: `${rs.length + 1}-тарау`,
        chapter_number: rs.length + 1,
        duration: null,
        progress: null,
      },
    ]);
  }

  async function onChapterFile(localId: string, file: File | undefined) {
    if (!file) return;
    updateRow(localId, { file });
    try {
      const duration = await readAudioDuration(file);
      updateRow(localId, { duration });
    } catch {
      toast.warning("Ұзақтығын оқу мүмкін болмады — файл бәрібір жүктеледі");
    }
  }

  async function removeRow(row: ChapterRow) {
    if (row.id) {
      if (!confirm(`«${row.title}» тарауын өшіру? Аудио файлы да жойылады.`)) return;
      try {
        await api(`/api/admin/chapters/${row.id}`, "DELETE");
        toast.success("Тарау өшірілді");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Өшіру сәтсіз");
        return;
      }
    }
    setRows((rs) => rs.filter((r) => r.localId !== row.localId));
  }

  function onCoverChange(file: File | undefined) {
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      toast.error("Атауы мен авторы міндетті");
      return;
    }
    const missingFiles = rows.filter((r) => !r.id && !r.file);
    if (missingFiles.length > 0) {
      toast.error("Әр жаңа тарауға аудио файл таңдаңыз");
      return;
    }

    setSaving(true);
    try {
      const metadata = {
        title: title.trim(),
        author: author.trim(),
        narrator: narrator.trim() || null,
        description: description.trim() || null,
        genre_id: genreId || null,
        language,
        is_new: isNew,
        is_popular: isPopular,
      };

      // 1. Ensure the book row exists (we need its id to build R2 keys).
      let bookId = book?.id;
      if (!bookId) {
        const { book: created } = await api("/api/admin/books", "POST", metadata);
        bookId = created.id as string;
      }

      // 2. Cover: raw bytes straight to R2, then the URL goes on the book row.
      let coverUrl = book?.cover_url ?? null;
      if (coverFile) {
        setCoverProgress(0);
        coverUrl = await presignAndUpload("cover", bookId, coverFile, setCoverProgress);
        setCoverProgress(null);
      }

      // 3. Book metadata (covers both edit mode and the fresh cover_url).
      await api(`/api/admin/books/${bookId}`, "PATCH", {
        ...metadata,
        cover_url: coverUrl,
      });

      // 4. Chapters, sequentially: upload audio as-is, then write the row.
      for (const row of rows) {
        if (row.file) {
          updateRow(row.localId, { progress: 0 });
          const audioUrl = await presignAndUpload("chapter", bookId, row.file, (pct) =>
            updateRow(row.localId, { progress: pct })
          );
          const payload = {
            title: row.title.trim() || `${row.chapter_number}-тарау`,
            chapter_number: row.chapter_number,
            audio_url: audioUrl,
            duration: row.duration,
          };
          if (row.id) {
            await api(`/api/admin/chapters/${row.id}`, "PATCH", payload);
          } else {
            const { chapter } = await api("/api/admin/chapters", "POST", {
              ...payload,
              book_id: bookId,
            });
            updateRow(row.localId, { id: chapter.id, file: undefined });
          }
          updateRow(row.localId, { progress: null });
        } else if (row.id) {
          const initial = initialRows.current.get(row.id);
          if (
            initial &&
            (initial.title !== row.title ||
              initial.chapter_number !== row.chapter_number)
          ) {
            await api(`/api/admin/chapters/${row.id}`, "PATCH", {
              title: row.title.trim(),
              chapter_number: row.chapter_number,
            });
          }
        }
      }

      toast.success(isEdit ? "Сақталды" : "Кітап жарияланды");
      router.push("/admin");
      router.refresh();
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Қате шықты — өңдеу бетінен жалғастырыңыз"
      );
    } finally {
      setSaving(false);
    }
  }

  const inputCls =
    "border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs outline-none md:text-sm";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Атауы *</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="author">Автор *</Label>
          <Input id="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="narrator">Диктор</Label>
          <Input id="narrator" value={narrator} onChange={(e) => setNarrator(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="genre">Жанр</Label>
          <select
            id="genre"
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
            className={inputCls}
          >
            <option value="">— Жанрсыз —</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.icon ? `${g.icon} ` : ""}
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="language">Тілі</Label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={inputCls}
          >
            <option value="kk">Қазақша</option>
            <option value="ru">Орысша</option>
          </select>
        </div>
        <div className="flex items-end gap-6 pb-1">
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isNew} onCheckedChange={setIsNew} /> Жаңа
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Switch checked={isPopular} onCheckedChange={setIsPopular} /> Танымал
          </label>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Сипаттама</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="cover">Мұқаба (сурет)</Label>
        <div className="flex items-center gap-4">
          {coverPreview && (
            // eslint-disable-next-line @next/next/no-img-element -- blob: preview URL, next/image not applicable
            <img
              src={coverPreview}
              alt="Мұқаба алдын ала қарау"
              className="h-28 w-20 rounded object-cover"
            />
          )}
          <div className="flex-1 space-y-2">
            <Input
              id="cover"
              type="file"
              accept="image/*"
              onChange={(e) => onCoverChange(e.target.files?.[0])}
            />
            {coverProgress !== null && <Progress value={coverProgress} />}
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Тараулар ({rows.length})</h2>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            + Тарау қосу
          </Button>
        </div>

        {rows.map((row) => (
          <div
            key={row.localId}
            className="space-y-2 rounded-lg border border-border p-3"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={row.chapter_number}
                onChange={(e) =>
                  updateRow(row.localId, { chapter_number: Number(e.target.value) })
                }
                className="w-16"
                aria-label="Тарау нөмірі"
              />
              <Input
                value={row.title}
                onChange={(e) => updateRow(row.localId, { title: e.target.value })}
                placeholder="Тарау атауы"
                className="flex-1"
              />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeRow(row)}
              >
                Өшіру
              </Button>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => onChapterFile(row.localId, e.target.files?.[0])}
                className="flex-1"
              />
              <span className="shrink-0">
                {row.duration != null
                  ? `${Math.floor(row.duration / 60)} мин ${row.duration % 60} с`
                  : row.audio_url
                    ? "жүктелген"
                    : "файл жоқ"}
              </span>
            </div>
            {row.progress !== null && <Progress value={row.progress} />}
          </div>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Әзірге тарау жоқ — «Тарау қосу» батырмасын басыңыз.
          </p>
        )}
      </div>

      <Button type="submit" disabled={saving} className="w-full sm:w-auto">
        {saving ? "Сақталуда…" : isEdit ? "Сақтау" : "Жариялау"}
      </Button>
    </form>
  );
}

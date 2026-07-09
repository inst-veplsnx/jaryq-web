"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, BookOpen, Loader2, Plus, Trash2 } from "lucide-react";
import { Book, Chapter, Genre } from "@/types";
import { presignAndUpload, readAudioDuration } from "@/lib/uploadToR2";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";

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

  // Shared premium field styling — warm hairline, jaryq-primary focus ring.
  const fieldCls =
    "rounded-lg border-jaryq-border-light bg-white shadow-jaryq-xs focus-visible:border-jaryq-primary focus-visible:ring-jaryq-primary/20";
  const selectCls =
    "flex h-9 w-full min-w-0 rounded-lg border border-jaryq-border-light bg-white px-3 py-1 text-base text-jaryq-text-primary shadow-jaryq-xs outline-none transition-colors focus-visible:border-jaryq-primary focus-visible:ring-2 focus-visible:ring-jaryq-primary/20 md:text-sm";
  const sectionTitle = "font-display text-lg font-bold text-jaryq-text-primary";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* — Мәліметтер — */}
      <section className="jaryq-card space-y-5 p-5 sm:p-6">
        <h2 className={sectionTitle}>Мәліметтер</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Атауы *</Label>
            <Input id="title" className={fieldCls} value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">Автор *</Label>
            <Input id="author" className={fieldCls} value={author} onChange={(e) => setAuthor(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="narrator">Диктор</Label>
            <Input id="narrator" className={fieldCls} value={narrator} onChange={(e) => setNarrator(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="genre">Жанр</Label>
            <select
              id="genre"
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
              className={selectCls}
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
              className={selectCls}
            >
              <option value="kk">Қазақша</option>
              <option value="ru">Орысша</option>
            </select>
          </div>
          <div className="flex items-end gap-2.5 pb-0.5">
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                isNew
                  ? "border-jaryq-primary/40 bg-jaryq-primary-soft text-jaryq-primary"
                  : "border-jaryq-border-light bg-white text-jaryq-text-secondary hover:border-jaryq-primary/30"
              }`}
            >
              <Switch
                checked={isNew}
                onCheckedChange={setIsNew}
                className="data-unchecked:bg-jaryq-text-muted/45"
              />{" "}
              Жаңа
            </label>
            <label
              className={`flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-colors ${
                isPopular
                  ? "border-jaryq-primary/40 bg-jaryq-primary-soft text-jaryq-primary"
                  : "border-jaryq-border-light bg-white text-jaryq-text-secondary hover:border-jaryq-primary/30"
              }`}
            >
              <Switch
                checked={isPopular}
                onCheckedChange={setIsPopular}
                className="data-unchecked:bg-jaryq-text-muted/45"
              />{" "}
              Танымал
            </label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Сипаттама</Label>
          <Textarea
            id="description"
            rows={4}
            className={fieldCls}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </section>

      {/* — Мұқаба — */}
      <section className="jaryq-card space-y-4 p-5 sm:p-6">
        <h2 className={sectionTitle}>Мұқаба</h2>
        <div className="flex items-center gap-5">
          {coverPreview ? (
            // Nested "hardware tray" bezel — a warm outer plate holding the cover.
            <div className="shrink-0 rounded-2xl border border-jaryq-border-warm bg-jaryq-primary-soft p-1.5 shadow-jaryq-xs">
              {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview URL, next/image not applicable */}
              <img
                src={coverPreview}
                alt="Мұқаба алдын ала қарау"
                className="h-32 w-[5.5rem] rounded-[calc(1rem-0.375rem)] object-cover"
              />
            </div>
          ) : (
            <div className="flex h-[9.5rem] w-[6.25rem] shrink-0 items-center justify-center rounded-2xl border border-dashed border-jaryq-border-warm bg-jaryq-primary-soft/40">
              <BookOpen className="size-7 text-jaryq-primary opacity-40" strokeWidth={1.5} />
            </div>
          )}
          <div className="flex-1 space-y-2">
            <Input
              id="cover"
              type="file"
              accept="image/*"
              className="rounded-lg border-jaryq-border-light bg-white"
              onChange={(e) => onCoverChange(e.target.files?.[0])}
            />
            <p className="text-xs text-jaryq-text-muted">
              JPG / PNG / WebP — бастапқы сапада сақталады.
            </p>
            {coverProgress !== null && <Progress value={coverProgress} />}
          </div>
        </div>
      </section>

      {/* — Тараулар — */}
      <section className="jaryq-card space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className={sectionTitle}>
            Тараулар{" "}
            <span className="ml-1 rounded-full bg-jaryq-ink-soft px-2 py-0.5 text-sm font-semibold tabular-nums text-jaryq-text-secondary">
              {rows.length}
            </span>
          </h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-jaryq-border-light bg-white px-3.5 py-1.5 text-sm font-medium text-jaryq-text-secondary transition-colors duration-jaryq-fast hover:border-jaryq-primary/40 hover:bg-jaryq-primary-soft hover:text-jaryq-primary"
          >
            <Plus className="size-4" strokeWidth={1.75} /> Тарау қосу
          </button>
        </div>

        {rows.map((row) => (
          <div
            key={row.localId}
            className="space-y-3 rounded-xl border border-jaryq-border-warm bg-jaryq-bg-cream p-3.5"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={1}
                value={row.chapter_number}
                onChange={(e) =>
                  updateRow(row.localId, { chapter_number: Number(e.target.value) })
                }
                className={`w-16 tabular-nums ${fieldCls}`}
                aria-label="Тарау нөмірі"
              />
              <Input
                value={row.title}
                onChange={(e) => updateRow(row.localId, { title: e.target.value })}
                placeholder="Тарау атауы"
                className={`flex-1 ${fieldCls}`}
              />
              <button
                type="button"
                onClick={() => removeRow(row)}
                aria-label="Тарауды өшіру"
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-jaryq-text-muted transition-colors duration-jaryq-fast hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex items-center gap-3 text-sm text-jaryq-text-muted">
              <Input
                type="file"
                accept="audio/*"
                onChange={(e) => onChapterFile(row.localId, e.target.files?.[0])}
                className="flex-1 rounded-lg border-jaryq-border-light bg-white"
              />
              <span className="shrink-0 tabular-nums">
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
          <p className="rounded-xl border border-dashed border-jaryq-border-warm bg-jaryq-bg-cream px-4 py-6 text-center text-sm text-jaryq-text-muted">
            Әзірге тарау жоқ — «Тарау қосу» батырмасын басыңыз.
          </p>
        )}
      </section>

      {/* — Magnetic submit pill with nested trailing icon — */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="group inline-flex items-center gap-2.5 rounded-full bg-jaryq-text-primary py-2.5 pl-6 pr-2.5 text-sm font-semibold text-white shadow-jaryq-sm transition-all duration-jaryq-base ease-jaryq-out hover:shadow-jaryq-glow-sm active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
        >
          {saving ? "Сақталуда…" : isEdit ? "Сақтау" : "Жариялау"}
          <span className="flex size-8 items-center justify-center rounded-full bg-white/15 transition-transform duration-jaryq-base ease-jaryq-out group-hover:translate-x-0.5 group-hover:-translate-y-px motion-reduce:transform-none">
            {saving ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <ArrowRight className="size-4" strokeWidth={1.75} />
            )}
          </span>
        </button>
      </div>
    </form>
  );
}

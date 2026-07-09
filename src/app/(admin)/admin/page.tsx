import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Book } from "@/types";
import { CoverImage } from "@/components/books/CoverImage";
import { DeleteBookButton } from "@/components/admin/DeleteBookButton";

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return h > 0 ? `${h} сағ ${m} мин` : `${m} мин`;
}

export default async function AdminBooksPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("books")
    .select("*, genre:genres(*)")
    .order("created_at", { ascending: false });
  const books: Book[] = data ?? [];

  return (
    <div className="jaryq-reveal space-y-8">
      <header className="space-y-3">
        <span className="inline-block rounded-full bg-jaryq-primary-soft px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-jaryq-primary">
          Каталог
        </span>
        <div className="flex flex-wrap items-baseline gap-3">
          <h1 className="font-display text-3xl font-bold tracking-tight text-jaryq-text-primary sm:text-4xl">
            Кітаптар
          </h1>
          <span className="rounded-full bg-jaryq-ink-soft px-2.5 py-0.5 text-sm font-semibold tabular-nums text-jaryq-text-secondary">
            {books.length}
          </span>
        </div>
      </header>

      {books.length === 0 ? (
        <div className="jaryq-card flex flex-col items-center gap-5 px-6 py-16 text-center">
          <span className="flex size-14 items-center justify-center rounded-2xl bg-jaryq-primary-soft">
            <BookOpen className="size-7 text-jaryq-primary" strokeWidth={1.5} />
          </span>
          <div className="space-y-1">
            <p className="font-display text-xl font-bold text-jaryq-text-primary">
              Әзірге кітап жоқ
            </p>
            <p className="text-sm text-jaryq-text-muted">
              Бірінші аудиокітапты каталогқа қосыңыз.
            </p>
          </div>
          <Link
            href="/admin/books/new"
            className="group inline-flex items-center gap-2 rounded-full bg-jaryq-text-primary py-2 pl-5 pr-2 text-sm font-semibold text-white shadow-jaryq-sm transition-all duration-jaryq-base ease-jaryq-out hover:shadow-jaryq-md active:scale-[0.98]"
          >
            Жаңа кітап
            <span className="flex size-7 items-center justify-center rounded-full bg-white/15 transition-transform duration-jaryq-base ease-jaryq-out group-hover:translate-x-0.5 group-hover:-translate-y-px motion-reduce:transform-none">
              <Plus className="size-4" strokeWidth={1.75} />
            </span>
          </Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {books.map((book) => (
            <li key={book.id}>
              <div className="jaryq-card jaryq-card-hover flex items-center gap-4 p-3 motion-reduce:hover:translate-y-0">
                <Link
                  href={`/admin/books/${book.id}`}
                  className="flex min-w-0 flex-1 items-center gap-4 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary/50"
                >
                  <span
                    className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5"
                    style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
                  >
                    <CoverImage src={book.cover_url} alt="" width={44} height={58} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-jaryq-primary">
                      {book.author}
                    </p>
                    <p className="truncate font-bold tracking-tight text-jaryq-text-primary">
                      {book.title}
                    </p>
                    <p className="truncate text-xs text-jaryq-text-muted">
                      {book.genre?.name ? `${book.genre.name} • ` : ""}
                      {book.total_chapters ?? 0} тарау •{" "}
                      <span className="tabular-nums">
                        {formatDuration(book.total_duration)}
                      </span>
                    </p>
                  </div>
                </Link>
                <div className="flex shrink-0 items-center gap-1">
                  <Link
                    href={`/admin/books/${book.id}`}
                    className="rounded-full px-3.5 py-1.5 text-sm font-medium text-jaryq-text-secondary transition-colors duration-jaryq-fast hover:bg-jaryq-primary-soft hover:text-jaryq-primary"
                  >
                    Өңдеу
                  </Link>
                  <DeleteBookButton bookId={book.id} title={book.title} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Book } from "@/types";
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
    <div>
      <h1 className="mb-4 text-xl font-bold">Кітаптар ({books.length})</h1>
      {books.length === 0 ? (
        <p className="text-muted-foreground">
          Әзірге кітап жоқ.{" "}
          <Link href="/admin/books/new" className="underline">
            Жаңа кітап қосыңыз
          </Link>
          .
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {books.map((book) => (
            <li
              key={book.id}
              className="flex items-center justify-between gap-4 p-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{book.title}</p>
                <p className="truncate text-sm text-muted-foreground">
                  {book.author}
                  {book.genre?.name ? ` • ${book.genre.name}` : ""} •{" "}
                  {book.total_chapters ?? 0} тарау •{" "}
                  {formatDuration(book.total_duration)}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href={`/admin/books/${book.id}`}
                  className="text-sm underline hover:text-foreground"
                >
                  Өңдеу
                </Link>
                <DeleteBookButton bookId={book.id} title={book.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

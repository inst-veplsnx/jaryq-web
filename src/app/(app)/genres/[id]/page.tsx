"use client";

import { useEffect, useState, use } from "react";
import { Layers } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book, Genre } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SkeletonCover, SkeletonText } from "@/components/ui/skeleton";

const BOOK_GRID =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5";

export default function GenreBooksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [books, setBooks] = useState<Book[]>([]);
  const [genre, setGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      bookService.getGenreById(id),
      bookService.getBooksByGenre(id),
    ]).then(([g, b]) => {
      setGenre(g);
      setBooks(b);
      setLoading(false);
    });
  }, [id]);

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 lg:pt-10 pb-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Кітаптар жүктелуде…"
            : books.length === 0
              ? "Кітап жоқ"
              : `${books.length} кітап жүктелді`}
        </div>

        <PageHeader
          icon={Layers}
          eyebrow="Жанр"
          title={genre?.name || "Жанр"}
          meta={!loading ? `${books.length} кітап` : undefined}
        />

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className={BOOK_GRID}>
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonCover />
                  <SkeletonText className="h-4 w-3/4" />
                  <SkeletonText className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Кітап жоқ"
              description="Бұл жанрда кітаптар табылмады."
              tone="muted"
            />
          ) : (
            <ul className={BOOK_GRID}>
              {books.map((book) => (
                <li key={book.id}>
                  <BookCard book={book} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

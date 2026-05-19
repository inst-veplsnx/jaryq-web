"use client";

import { useEffect, useState, use } from "react";
import { Layers } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book, Genre } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="bg-white border-b border-[#E8E8E8] px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            aria-hidden="true"
            className="w-10 h-10 bg-[#F0F9FF] rounded-xl flex items-center justify-center"
          >
            <span className="text-xl">{genre?.icon || "📚"}</span>
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0F0F0F]">
              {genre?.name || "Жанр"}
            </h1>
            <p className="text-sm text-[#5C5C5C]">{books.length} кітап</p>
          </div>
        </div>
      </div>

      <div className="p-6" aria-busy={loading || undefined}>
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Кітаптар жүктелуде…"
            : books.length === 0
              ? "Кітап жоқ"
              : `${books.length} кітап жүктелді`}
        </div>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-[3/4] rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState
            title="Кітап жоқ"
            description="Бұл жанрда кітаптар табылмады."
          />
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {books.map((book) => (
              <li key={book.id}>
                <BookCard book={book} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

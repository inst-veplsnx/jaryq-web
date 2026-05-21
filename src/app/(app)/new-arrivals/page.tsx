"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SkeletonCover, SkeletonText } from "@/components/ui/skeleton";

const BOOK_GRID =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5";

export default function NewArrivalsPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookService.getNewArrivals().then((data) => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 lg:pt-10 pb-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Жаңа кітаптар жүктелуде…"
            : books.length === 0
              ? "Жаңа кітаптар жоқ"
              : `${books.length} жаңа кітап жүктелді`}
        </div>

        <PageHeader
          icon={Sparkles}
          title="Жаңа кітаптар"
          subtitle="Соңғы қосылған"
          meta={!loading && books.length > 0 ? `${books.length} кітап` : undefined}
        />

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className={BOOK_GRID}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <SkeletonCover />
                  <SkeletonText className="h-4 w-3/4" />
                  <SkeletonText className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Жаңа кітаптар жоқ"
              icon={<Sparkles size={36} />}
              tone="default"
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

"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

const PAGE_SIZE = 24;

export default function AllBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    bookService.getAllBooks(0, PAGE_SIZE).then((data) => {
      setBooks(data);
      setHasMore(data.length === PAGE_SIZE);
      setLoading(false);
    });
  }, []);

  const loadMore = useCallback(async () => {
    setLoadingMore(true);
    const data = await bookService.getAllBooks(books.length, PAGE_SIZE);
    setBooks((prev) => [...prev, ...data]);
    setHasMore(data.length === PAGE_SIZE);
    setLoadingMore(false);
  }, [books.length]);

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Кітаптар жүктелуде…"
            : books.length === 0
              ? "Кітап табылмады"
              : `${books.length} кітап жүктелді`}
        </div>

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-jaryq-text-primary">
              Барлық кітаптар
            </h1>
            <p className="text-jaryq-text-muted mt-1">Толық каталог</p>
          </div>
          {!loading && books.length > 0 && (
            <p className="text-sm text-jaryq-text-muted shrink-0 tabular-nums">
              {books.length} кітап
            </p>
          )}
        </div>

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-3/4 rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Кітап табылмады"
              description="Каталог бос."
              icon={<BookOpen className="text-violet-500" size={36} />}
            />
          ) : (
            <>
              <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                {books.map((book) => (
                  <li key={book.id}>
                    <BookCard book={book} />
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 rounded-xl bg-jaryq-bg-card border border-jaryq-border-light text-jaryq-text-primary font-semibold hover:border-jaryq-primary hover:text-jaryq-primary hover:bg-jaryq-primary-soft active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
                  >
                    {loadingMore ? "Жүктелуде…" : "Көбірек жүктеу"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

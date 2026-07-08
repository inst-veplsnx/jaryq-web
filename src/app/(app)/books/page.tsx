"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SkeletonCover, SkeletonText } from "@/components/ui/skeleton";

const PAGE_SIZE = 24;
const BOOK_GRID =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5";

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
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Кітаптар жүктелуде…"
            : books.length === 0
              ? "Кітап табылмады"
              : `${books.length} кітап жүктелді`}
        </div>

        <PageHeader
          icon={BookOpen}
          title="Барлық кітаптар"
          subtitle="Толық каталог"
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
              title="Кітап табылмады"
              description="Каталог бос."
              tone="muted"
            />
          ) : (
            <>
              <ul className={BOOK_GRID}>
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
                    className="px-8 py-3 rounded-xl bg-jaryq-bg-card border border-jaryq-border-light text-jaryq-text-primary font-semibold hover:border-jaryq-primary hover:text-jaryq-primary-strong hover:bg-jaryq-primary-soft active:scale-[0.98] transition-[background-color,border-color,color,transform] duration-(--duration-jaryq-fast) ease-jaryq-out disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
                    style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
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

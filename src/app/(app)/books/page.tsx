"use client";

import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookService.getAllBooks(0, 100).then((data) => {
      setBooks(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
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
            <h1 className="text-3xl font-black text-[#0F0F0F]">Барлық кітаптар</h1>
            <p className="text-[#5C5C5C] mt-1">Толық каталог</p>
          </div>
          {!loading && books.length > 0 && (
            <p className="text-sm text-[#888888] shrink-0">{books.length} кітап</p>
          )}
        </div>

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title="Кітап табылмады"
              description="Каталог бос."
              icon={<BookOpen className="text-[#8B5CF6]" size={36} />}
            />
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
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

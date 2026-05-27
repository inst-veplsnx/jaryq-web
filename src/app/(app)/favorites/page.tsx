"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Favorite } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { PageHeader } from "@/components/layout/PageHeader";
import { SkeletonCover, SkeletonText } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

const BOOK_GRID =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5";

export default function FavoritesPage() {
  const { user } = useAuthStore();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    bookService.getFavorites(user.id).then((data) => {
      setFavorites(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-[88rem] mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Таңдаулы кітаптар жүктелуде…"
            : favorites.length === 0
              ? "Таңдаулы кітаптар жоқ"
              : `${favorites.length} таңдаулы кітап жүктелді`}
        </div>

        <PageHeader
          icon={Heart}
          title="Таңдаулы"
          subtitle="Сіздің жинағыңыз"
          meta={
            !loading && favorites.length > 0
              ? `${favorites.length} кітап`
              : undefined
          }
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
          ) : favorites.length === 0 ? (
            <EmptyState
              title="Таңдаулы кітаптар жоқ"
              description="Кітап бетінде жүрек белгісін басып, таңдаулыларға қосыңыз."
              icon={<Heart size={36} />}
              tone="default"
            />
          ) : (
            <ul className={BOOK_GRID}>
              {favorites.map((fav) =>
                fav.book ? (
                  <li key={fav.id}>
                    <BookCard book={fav.book} />
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

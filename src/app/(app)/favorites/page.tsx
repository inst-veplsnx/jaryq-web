"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Favorite } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { EmptyState } from "@/components/books/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";

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
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Таңдаулы кітаптар жүктелуде…"
            : favorites.length === 0
              ? "Таңдаулы кітаптар жоқ"
              : `${favorites.length} таңдаулы кітап жүктелді`}
        </div>

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-[#0F0F0F]">Таңдаулы</h1>
            <p className="text-[#5C5C5C] mt-1">Сіздің жинағыңыз</p>
          </div>
          {!loading && favorites.length > 0 && (
            <p className="text-sm text-[#888888] shrink-0">{favorites.length} кітап</p>
          )}
        </div>

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="aspect-[3/4] rounded-xl" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : favorites.length === 0 ? (
            <EmptyState
              title="Таңдаулы кітаптар жоқ"
              description="Кітап бетінде жүрек белгісін басып, таңдаулыларға қосыңыз."
              icon={<Heart className="text-[#EC4899]" size={36} />}
            />
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
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

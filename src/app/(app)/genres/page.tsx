"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Genre } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const ACCENT_COLORS = [
  { text: "text-[#0EA5E9]", bg: "bg-[#F0F9FF]", border: "border-[#0EA5E9]/20" },
  { text: "text-[#EF4444]", bg: "bg-[#FEF2F2]", border: "border-[#EF4444]/20" },
  { text: "text-[#8B5CF6]", bg: "bg-[#F5F3FF]", border: "border-[#8B5CF6]/20" },
  { text: "text-[#EC4899]", bg: "bg-[#FDF2F8]", border: "border-[#EC4899]/20" },
  { text: "text-[#22C55E]", bg: "bg-[#F0FDF4]", border: "border-[#22C55E]/20" },
  { text: "text-[#F59E0B]", bg: "bg-[#FFFBEB]", border: "border-[#F59E0B]/20" },
  { text: "text-[#D946EF]", bg: "bg-[#FDF4FF]", border: "border-[#D946EF]/20" },
  { text: "text-[#06B6D4]", bg: "bg-[#F0FDFF]", border: "border-[#06B6D4]/20" },
  { text: "text-[#F43F5E]", bg: "bg-[#FFF1F2]", border: "border-[#F43F5E]/20" },
  { text: "text-[#84CC16]", bg: "bg-[#F7FEE7]", border: "border-[#84CC16]/20" },
];

export default function GenresPage() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookService.getGenres().then((data) => {
      setGenres(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading ? "Жанрлар жүктелуде…" : `${genres.length} жанр жүктелді`}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-[#0F0F0F]">Жанрлар</h1>
          <p className="text-[#5C5C5C] mt-1">Категория бойынша таңдаңыз</p>
        </div>

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {genres.map((genre, index) => {
                const color = ACCENT_COLORS[index % ACCENT_COLORS.length];
                return (
                  <li key={genre.id}>
                    <Link
                      href={`/genres/${genre.id}`}
                      aria-label={`Жанр: ${genre.name}`}
                      className={`block ${color.bg} border ${color.border} rounded-2xl p-5 lg:p-6 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:opacity-90 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2`}
                    >
                      <span aria-hidden="true" className="mb-3 block">
                        <BookOpen className={`${color.text} w-7 h-7 lg:w-8 lg:h-8`} />
                      </span>
                      <p className={`font-bold text-sm lg:text-base ${color.text}`}>
                        {genre.name}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Genre } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

const ACCENT_COLORS = [
  { text: "text-sky-500", bg: "bg-sky-50", border: "border-sky-500/20" },
  { text: "text-red-500", bg: "bg-red-50", border: "border-red-500/20" },
  { text: "text-violet-500", bg: "bg-violet-50", border: "border-violet-500/20" },
  { text: "text-pink-500", bg: "bg-pink-50", border: "border-pink-500/20" },
  { text: "text-green-500", bg: "bg-green-50", border: "border-green-500/20" },
  { text: "text-amber-500", bg: "bg-amber-50", border: "border-amber-500/20" },
  { text: "text-fuchsia-500", bg: "bg-fuchsia-50", border: "border-fuchsia-500/20" },
  { text: "text-cyan-500", bg: "bg-cyan-50", border: "border-cyan-500/20" },
  { text: "text-rose-500", bg: "bg-rose-50", border: "border-rose-500/20" },
  { text: "text-lime-500", bg: "bg-lime-50", border: "border-lime-500/20" },
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
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-7xl mx-auto px-8 py-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading ? "Жанрлар жүктелуде…" : `${genres.length} жанр жүктелді`}
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-jaryq-text-primary">
            Жанрлар
          </h1>
          <p className="text-jaryq-text-secondary mt-1">Категория бойынша таңдаңыз</p>
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
                      className={`group block ${color.bg} border ${color.border} rounded-2xl p-5 lg:p-6 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0`}
                    >
                      <span aria-hidden="true" className="mb-3 block">
                        <BookOpen
                          className={`${color.text} w-7 h-7 lg:w-8 lg:h-8 transition-transform duration-200 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:scale-100`}
                        />
                      </span>
                      <p
                        className={`font-bold tracking-tight text-sm lg:text-base ${color.text}`}
                      >
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

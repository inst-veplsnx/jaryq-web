"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Layers } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Genre } from "@/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { genreAccentAt } from "@/lib/genreColors";
import { cn } from "@/lib/utils";

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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 lg:pt-10 pb-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading ? "Жанрлар жүктелуде…" : `${genres.length} жанр жүктелді`}
        </div>

        <PageHeader
          icon={Layers}
          title="Жанрлар"
          subtitle="Категория бойынша таңдаңыз"
          meta={!loading && genres.length > 0 ? `${genres.length} жанр` : undefined}
        />

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
                const accent = genreAccentAt(index);
                return (
                  <li key={genre.id}>
                    <Link
                      href={`/genres/${genre.id}`}
                      aria-label={`Жанр: ${genre.name}`}
                      className={cn(
                        "group relative block rounded-2xl p-5 lg:p-6 overflow-hidden border transition-[box-shadow,transform,border-color] duration-[var(--duration-jaryq-base)] ease-[var(--ease-jaryq-out)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
                        accent.bg,
                        accent.border
                      )}
                      style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "pointer-events-none absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl opacity-70 bg-gradient-to-br",
                          accent.glow
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className="relative mb-3 block"
                      >
                        <BookOpen
                          className={cn(
                            "w-7 h-7 lg:w-8 lg:h-8 transition-transform duration-[var(--duration-jaryq-base)] group-hover:scale-110 group-hover:rotate-[-4deg] motion-reduce:transition-none motion-reduce:group-hover:scale-100 motion-reduce:group-hover:rotate-0",
                            accent.text
                          )}
                        />
                      </span>
                      <p
                        className={cn(
                          "relative font-bold tracking-tight text-sm lg:text-base",
                          accent.text
                        )}
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

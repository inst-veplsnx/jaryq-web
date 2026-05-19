"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Play, Loader2, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { bookService } from "@/lib/services/bookService";
import { UserProgress, Chapter, Book } from "@/types";
import { CoverImage } from "@/components/books/CoverImage";
import { BookCard } from "@/components/books/BookCard";
import { Skeleton } from "@/components/ui/skeleton";
import { formatTime } from "@/lib/utils";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const playerStore = usePlayerStore();
  const [recentProgress, setRecentProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [isLaunching, setIsLaunching] = useState(false);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    bookService.getAllProgress(user.id).then((list) => {
      setRecentProgress(list[0] ?? null);
      setProgressLoading(false);
    });
  }, [user]);

  useEffect(() => {
    Promise.all([bookService.getNewArrivals(), bookService.getPopular()]).then(
      ([arrivals, popular]) => {
        setNewBooks(arrivals.slice(0, 10));
        setPopularBooks(popular.slice(0, 10));
        setCatalogLoading(false);
      }
    );
  }, []);

  const launchResume = useCallback(async () => {
    if (!recentProgress?.book || isLaunching) return;
    setIsLaunching(true);
    const book = recentProgress.book;
    const chapters: Chapter[] = await bookService.getChapters(book.id);
    if (!chapters.length) { setIsLaunching(false); return; }
    const resumeIndex = chapters.findIndex(
      (c) => c.chapter_number === recentProgress.chapter_number
    );
    const idx = resumeIndex >= 0 ? resumeIndex : 0;
    playerStore.set({ currentBook: book, chapters, chapterIndex: idx, isLoading: true });
    const loadFn = (window as unknown as Record<string, (i: number, p: number) => void>).__jaryq_loadChapter;
    if (loadFn) loadFn(idx, recentProgress.position ?? 0);
    setIsLaunching(false);
  }, [recentProgress, isLaunching, playerStore]);

  const greetingName = user?.full_name?.split(" ")[0] || "Пайдаланушы";

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">

        {/* Greeting */}
        <div>
          <p className="text-sm text-[#888888] mb-1">Сәлем,</p>
          <h1 className="text-4xl font-black text-[#0F0F0F]">
            {greetingName}
            <span aria-hidden="true"> 👋</span>
          </h1>
          <p className="text-[#5C5C5C] mt-2">Бүгін не тыңдайсыз?</p>
        </div>

        {/* Continue Listening */}
        {progressLoading ? (
          <section aria-label="Жалғастыру жүктелуде">
            <Skeleton className="h-3 w-24 rounded mb-3" />
            <div className="flex items-center gap-5 bg-white rounded-2xl p-5 border border-[#E8E8E8] max-w-2xl">
              <Skeleton className="w-20 h-[108px] rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded" />
                <Skeleton className="h-4 w-1/2 rounded" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
              <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            </div>
          </section>
        ) : recentProgress?.book ? (
          <section aria-labelledby="continue-heading">
            <h2
              id="continue-heading"
              className="text-xs font-semibold text-[#888888] uppercase tracking-widest mb-3"
            >
              Жалғастыру
            </h2>
            <div className="flex items-center gap-5 bg-white rounded-2xl p-5 border border-[#F97316]/20 shadow-sm max-w-2xl hover:shadow-md transition-shadow">
              <Link
                href={`/books/${recentProgress.book.id}`}
                aria-label={`${recentProgress.book.title} кітабына өту`}
                tabIndex={-1}
                className="flex-shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
              >
                <CoverImage
                  src={recentProgress.book.cover_url}
                  alt=""
                  width={80}
                  height={108}
                  className="rounded-xl"
                />
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/books/${recentProgress.book.id}`}
                  className="group focus-visible:outline-none"
                >
                  <p className="font-bold text-[#0F0F0F] text-base truncate group-hover:text-[#F97316] transition-colors">
                    {recentProgress.book.title}
                  </p>
                </Link>
                <p className="text-sm text-[#5C5C5C] truncate mt-1">
                  {recentProgress.chapter_number}-тарау
                  {recentProgress.position
                    ? ` • ${formatTime(recentProgress.position)} өткен`
                    : ""}
                </p>
                <div
                  role="progressbar"
                  aria-label="Тыңдау прогресі"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={
                    recentProgress.book.total_duration
                      ? Math.round(
                          (recentProgress.position /
                            recentProgress.book.total_duration) *
                            100
                        )
                      : 0
                  }
                  className="mt-3 h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-[#F97316] rounded-full"
                    style={{
                      width: recentProgress.book.total_duration
                        ? `${Math.min(100, (recentProgress.position / recentProgress.book.total_duration) * 100)}%`
                        : "0%",
                    }}
                  />
                </div>
              </div>

              <button
                onClick={launchResume}
                disabled={isLaunching}
                aria-busy={isLaunching || undefined}
                aria-label={`${recentProgress.book.title} кітабын жалғастыру`}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-[#F97316] text-white hover:bg-[#EA580C] active:scale-95 disabled:opacity-60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2 flex-shrink-0"
              >
                {isLaunching ? (
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Play size={20} className="fill-white" aria-hidden="true" />
                )}
              </button>
            </div>
          </section>
        ) : null}

        {/* New arrivals */}
        {(catalogLoading || newBooks.length > 0) && (
          <section aria-labelledby="new-arrivals-heading">
            <div className="flex items-center justify-between mb-5">
              <h2 id="new-arrivals-heading" className="text-xl font-black text-[#0F0F0F]">
                Жаңа кітаптар
              </h2>
              <Link
                href="/new-arrivals"
                className="flex items-center gap-1 text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded"
              >
                Барлығы <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            {catalogLoading ? (
              <div className="flex gap-4 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-none w-40 space-y-2">
                    <Skeleton className="aspect-[3/4] rounded-xl" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <ul
                className="flex gap-4 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
                aria-label="Жаңа кітаптар"
              >
                {newBooks.map((book) => (
                  <li key={book.id} className="flex-none w-40">
                    <BookCard book={book} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Popular */}
        {(catalogLoading || popularBooks.length > 0) && (
          <section aria-labelledby="popular-heading">
            <div className="flex items-center justify-between mb-5">
              <h2 id="popular-heading" className="text-xl font-black text-[#0F0F0F]">
                Танымал
              </h2>
              <Link
                href="/popular"
                className="flex items-center gap-1 text-sm font-semibold text-[#F97316] hover:text-[#EA580C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded"
              >
                Барлығы <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            {catalogLoading ? (
              <div className="flex gap-4 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-none w-40 space-y-2">
                    <Skeleton className="aspect-[3/4] rounded-xl" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <ul
                className="flex gap-4 overflow-x-auto pb-1"
                style={{ scrollbarWidth: "none" }}
                aria-label="Танымал кітаптар"
              >
                {popularBooks.map((book) => (
                  <li key={book.id} className="flex-none w-40">
                    <BookCard book={book} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

      </div>
    </div>
  );
}

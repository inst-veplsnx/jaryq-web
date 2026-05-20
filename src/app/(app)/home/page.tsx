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
  const isPlayerLoading = usePlayerStore((s) => s.isLoading);
  const loadChapter = usePlayerStore((s) => s.loadChapter);
  const [recentProgress, setRecentProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    bookService.getRecentProgress(user.id).then((progress) => {
      setRecentProgress(progress);
      setProgressLoading(false);
    });
  }, [user]);

  useEffect(() => {
    Promise.all([bookService.getNewArrivals(10), bookService.getPopular(10)]).then(
      ([arrivals, popular]) => {
        setNewBooks(arrivals);
        setPopularBooks(popular);
        setCatalogLoading(false);
      }
    );
  }, []);

  const launchResume = useCallback(async () => {
    if (!recentProgress?.book || isPlayerLoading) return;
    const book = recentProgress.book;
    const chapters: Chapter[] = await bookService.getChapters(book.id);
    if (!chapters.length) return;
    const resumeIndex = chapters.findIndex(
      (c) => c.chapter_number === recentProgress.chapter_number
    );
    const idx = resumeIndex >= 0 ? resumeIndex : 0;
    loadChapter(book, chapters, idx, recentProgress.position ?? 0);
  }, [recentProgress, isPlayerLoading, loadChapter]);

  const greetingName = user?.full_name?.trim() || "Пайдаланушы";

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-7xl mx-auto px-8 py-10 space-y-12">

        {/* Greeting */}
        <div>
          <p className="text-sm text-jaryq-text-muted mb-1">Сәлем,</p>
          <h1 className="text-4xl font-black tracking-tight text-jaryq-text-primary">
            {greetingName}
            <span aria-hidden="true"> 👋</span>
          </h1>
          <p className="text-jaryq-text-secondary mt-2">Бүгін не тыңдайсыз?</p>
        </div>

        {/* Continue Listening */}
        {progressLoading ? (
          <section aria-label="Жалғастыру жүктелуде">
            <Skeleton className="h-3 w-24 rounded mb-3" />
            <div className="flex items-center gap-5 bg-white rounded-2xl p-5 border border-jaryq-border-light max-w-2xl">
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
              className="text-xs font-semibold text-jaryq-text-muted uppercase tracking-widest mb-3"
            >
              Жалғастыру
            </h2>
            <div className="group flex items-center gap-5 bg-white rounded-2xl p-5 border border-jaryq-primary/20 shadow-sm max-w-2xl hover:shadow-lg hover:border-jaryq-primary/40 transition-all duration-200 motion-reduce:transition-none">
              <Link
                href={`/books/${recentProgress.book.id}`}
                aria-label={`${recentProgress.book.title} кітабына өту`}
                tabIndex={-1}
                className="flex-shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
              >
                <span className="block rounded-xl overflow-hidden ring-1 ring-black/5 shadow-sm transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100">
                  <CoverImage
                    src={recentProgress.book.cover_url}
                    alt=""
                    width={80}
                    height={108}
                    className="rounded-xl block"
                  />
                </span>
              </Link>

              <div className="flex-1 min-w-0">
                <Link
                  href={`/books/${recentProgress.book.id}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded"
                >
                  <p className="font-bold tracking-tight text-jaryq-text-primary text-base truncate hover:text-jaryq-primary transition-colors duration-150 motion-reduce:transition-none">
                    {recentProgress.book.title}
                  </p>
                </Link>
                <p className="text-sm text-jaryq-text-secondary truncate mt-1 tabular-nums">
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
                  className="mt-3 h-1.5 bg-jaryq-border-light rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-jaryq-primary rounded-full transition-[width] duration-300 motion-reduce:transition-none"
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
                disabled={isPlayerLoading}
                aria-busy={isPlayerLoading || undefined}
                aria-label={`${recentProgress.book.title} кітабын жалғастыру`}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-jaryq-primary text-white shadow-sm hover:bg-jaryq-primary-dark hover:shadow-[0_10px_30px_-10px_rgba(249,115,22,0.55)] hover:scale-[1.05] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 flex-shrink-0 motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                {isPlayerLoading ? (
                  <Loader2
                    size={20}
                    className="animate-spin motion-reduce:animate-none"
                    aria-hidden="true"
                  />
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
              <h2
                id="new-arrivals-heading"
                className="text-xl font-black tracking-tight text-jaryq-text-primary"
              >
                Жаңа кітаптар
              </h2>
              <Link
                href="/new-arrivals"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-jaryq-primary hover:text-jaryq-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded motion-reduce:transition-none"
              >
                Барлығы
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
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
              <h2
                id="popular-heading"
                className="text-xl font-black tracking-tight text-jaryq-text-primary"
              >
                Танымал
              </h2>
              <Link
                href="/popular"
                className="group inline-flex items-center gap-1 text-sm font-semibold text-jaryq-primary hover:text-jaryq-primary-dark transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded motion-reduce:transition-none"
              >
                Барлығы
                <ArrowRight
                  size={14}
                  aria-hidden="true"
                  className="transition-transform duration-150 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
                />
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

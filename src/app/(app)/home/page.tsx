"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { bookService } from "@/lib/services/bookService";
import { UserProgress, Chapter, Book } from "@/types";
import { BookCard } from "@/components/books/BookCard";
import { ContinueListeningCard } from "@/components/books/ContinueListeningCard";
import { SectionTitle } from "@/components/layout/SectionTitle";
import { SkeletonText, SkeletonCover } from "@/components/ui/skeleton";

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const isPlayerLoading = usePlayerStore((s) => s.isLoading);
  const loadChapter = usePlayerStore((s) => s.loadChapter);
  const [recentProgress, setRecentProgress] = useState<UserProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(true);
  const [newBooks, setNewBooks] = useState<Book[]>([]);
  const [popularBooks, setPopularBooks] = useState<Book[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const chaptersRef = useRef<Chapter[]>([]);

  useEffect(() => {
    if (!user) return;
    bookService.getRecentProgress(user.id).then((progress) => {
      setRecentProgress(progress);
      setProgressLoading(false);
    });
  }, [user]);

  // Pre-fetch chapters as soon as we know the resume book so the resume button
  // responds instantly without a network round-trip at click time.
  useEffect(() => {
    if (!recentProgress?.book) return;
    bookService.getChapters(recentProgress.book.id).then((ch) => {
      chaptersRef.current = ch;
    });
  }, [recentProgress]);

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
    const chapters: Chapter[] =
      chaptersRef.current.length
        ? chaptersRef.current
        : await bookService.getChapters(book.id);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 lg:pt-10 pb-10 space-y-12">

        {/* Greeting */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-jaryq-text-muted mb-2">
            Сәлем,
          </p>
          <h1 className="font-display text-3xl lg:text-4xl font-black tracking-tight text-jaryq-text-primary leading-[1.1] flex items-center gap-3">
            <span>{greetingName}</span>
            <Sparkles
              aria-hidden="true"
              className="text-jaryq-primary"
              size={28}
            />
          </h1>
          <p className="text-jaryq-text-secondary mt-2 text-sm lg:text-base">
            Бүгін не тыңдайсыз?
          </p>
        </div>

        {/* Continue Listening */}
        {progressLoading ? (
          <section aria-label="Жалғастыру жүктелуде">
            <SkeletonText className="h-3 w-24 mb-3" />
            <div className="flex items-center gap-5 jaryq-card p-5 max-w-2xl">
              <SkeletonCover className="w-20 aspect-[3/4] flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <SkeletonText className="h-5 w-3/4" />
                <SkeletonText className="h-4 w-1/2" />
                <SkeletonText className="h-1.5 w-full rounded-full" />
              </div>
              <div className="w-12 h-12 jaryq-shimmer rounded-full flex-shrink-0" />
            </div>
          </section>
        ) : recentProgress?.book ? (
          <section aria-labelledby="continue-heading">
            <SectionTitle id="continue-heading" variant="eyebrow">
              Жалғастыру
            </SectionTitle>
            <ContinueListeningCard
              progress={recentProgress as UserProgress & { book: Book }}
              isLoading={isPlayerLoading}
              onResume={launchResume}
            />
          </section>
        ) : null}

        {/* New arrivals */}
        {(catalogLoading || newBooks.length > 0) && (
          <section aria-labelledby="new-arrivals-heading">
            <SectionTitle
              id="new-arrivals-heading"
              href="/new-arrivals"
            >
              Жаңа кітаптар
            </SectionTitle>
            {catalogLoading ? (
              <div className="flex gap-4 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-none w-40 space-y-2">
                    <SkeletonCover />
                    <SkeletonText className="h-4 w-3/4" />
                    <SkeletonText className="h-3 w-1/2" />
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
            <SectionTitle id="popular-heading" href="/popular">
              Танымал
            </SectionTitle>
            {catalogLoading ? (
              <div className="flex gap-4 overflow-hidden" aria-hidden="true">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-none w-40 space-y-2">
                    <SkeletonCover />
                    <SkeletonText className="h-4 w-3/4" />
                    <SkeletonText className="h-3 w-1/2" />
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

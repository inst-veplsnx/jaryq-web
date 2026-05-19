"use client";

import { useEffect, useState, useCallback } from "react";
import { Play, Heart, HeartOff, Loader2, ListMusic } from "lucide-react";
import { Book, Chapter, UserProgress } from "@/types";
import { useAuthStore } from "@/store/authStore";
import { usePlayerStore } from "@/store/playerStore";
import { bookService } from "@/lib/services/bookService";
import { formatDuration, formatTime } from "@/lib/utils";
import { CoverImage } from "./CoverImage";
import { cn } from "@/lib/utils";

interface BookDetailProps {
  book: Book;
  chapters: Chapter[];
}

export function BookDetail({ book, chapters }: BookDetailProps) {
  const { user } = useAuthStore();
  const playerStore = usePlayerStore();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);

  useEffect(() => {
    if (!user) return;
    bookService.isFavorite(user.id, book.id).then(setIsFavorite);
    bookService.getProgress(user.id, book.id).then(setProgress);
  }, [user, book.id]);

  const toggleFavorite = async () => {
    if (!user || favLoading) return;
    setFavLoading(true);
    try {
      if (isFavorite) {
        await bookService.removeFavorite(user.id, book.id);
        setIsFavorite(false);
      } else {
        await bookService.addFavorite(user.id, book.id);
        setIsFavorite(true);
      }
    } finally {
      setFavLoading(false);
    }
  };

  const launchPlayer = useCallback(
    (chapterIndex = 0, startPosition = 0) => {
      setIsLaunching(true);
      playerStore.set({
        currentBook: book,
        chapters,
        chapterIndex,
        isLoading: true,
      });

      // Trigger load via the global function exposed by PlayerBar
      const loadFn = (window as unknown as Record<string, (i: number, p: number) => void>).__jaryq_loadChapter;
      if (loadFn) {
        loadFn(chapterIndex, startPosition);
      }
      setIsLaunching(false);
    },
    [book, chapters, playerStore]
  );

  const resumeIndex = progress
    ? chapters.findIndex((c) => c.chapter_number === progress.chapter_number)
    : -1;
  const resumeChapter =
    resumeIndex >= 0 ? chapters[resumeIndex] : null;

  const progressPercent = resumeChapter
    ? (progress!.position / (resumeChapter.duration || 1)) * 100
    : 0;

  return (
    <article className="min-h-screen bg-[#F5F5F5]">
      {/* Hero */}
      <header className="bg-white border-b border-[#E8E8E8]">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex gap-6">
            <div className="flex-shrink-0">
              <CoverImage
                src={book.cover_url}
                alt=""
                width={120}
                height={160}
                className="rounded-xl shadow-lg"
              />
            </div>
            <div className="flex-1 min-w-0">
              {book.genre && (
                <span className="text-xs font-bold text-[#F97316] uppercase tracking-widest">
                  {book.genre.name}
                </span>
              )}
              <h1 className="text-2xl font-black text-[#0F0F0F] mt-1 leading-tight">
                {book.title}
              </h1>
              <p className="text-[#3B3B3B] font-medium mt-1">
                <span className="sr-only">Автор: </span>
                {book.author}
              </p>
              {book.narrator && (
                <p className="text-[#5C5C5C] text-sm italic mt-0.5">
                  Диктор: {book.narrator}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {book.total_duration && (
                  <span className="text-sm text-[#5C5C5C]">
                    <span className="sr-only">Ұзақтығы: </span>
                    {formatDuration(book.total_duration)}
                  </span>
                )}
                {book.total_chapters && (
                  <span className="text-sm text-[#5C5C5C]">
                    {book.total_chapters} тарау
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {progress && resumeChapter && (
                <div className="mt-3">
                  <div
                    className="h-1.5 bg-[#E8E8E8] rounded-full overflow-hidden w-48"
                    role="progressbar"
                    aria-label="Тыңдау прогресі"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progressPercent)}
                  >
                    <div
                      className="h-full bg-[#F97316] rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#5C5C5C] mt-1">
                    {resumeChapter.chapter_number}-тарау •{" "}
                    {formatTime(progress.position)} өткен
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 mt-6">
            {progress && resumeIndex >= 0 ? (
              <>
                <button
                  onClick={() =>
                    launchPlayer(resumeIndex, progress.position)
                  }
                  disabled={isLaunching || chapters.length === 0}
                  aria-busy={isLaunching || undefined}
                  className="flex items-center gap-2 bg-[#F97316] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#EA580C] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
                >
                  {isLaunching ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Play size={18} className="fill-white" aria-hidden="true" />
                  )}
                  {resumeIndex + 1}-тараудан жалғастыру
                </button>
                <button
                  onClick={() => launchPlayer(0, 0)}
                  className="flex items-center gap-2 bg-white text-[#0F0F0F] font-semibold px-5 py-3 rounded-xl border border-[#E8E8E8] hover:border-[#F97316] hover:text-[#F97316] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
                >
                  Басынан тыңдау
                </button>
              </>
            ) : (
              <button
                onClick={() => launchPlayer(0, 0)}
                disabled={isLaunching || chapters.length === 0}
                aria-busy={isLaunching || undefined}
                className="flex items-center gap-2 bg-[#F97316] text-white font-bold px-6 py-3 rounded-xl hover:bg-[#EA580C] transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
              >
                {isLaunching ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : (
                  <Play size={18} className="fill-white" aria-hidden="true" />
                )}
                Тыңдауды бастау
              </button>
            )}

            <button
              onClick={toggleFavorite}
              disabled={favLoading || !user}
              aria-pressed={isFavorite}
              className={cn(
                "flex items-center gap-2 font-semibold px-5 py-3 rounded-xl border transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2",
                isFavorite
                  ? "bg-[#FDF2F8] text-[#EC4899] border-[#EC4899]/30 hover:bg-[#FDF2F8]"
                  : "bg-white text-[#5C5C5C] border-[#E8E8E8] hover:border-[#EC4899] hover:text-[#EC4899]"
              )}
            >
              {isFavorite ? (
                <HeartOff size={18} aria-hidden="true" />
              ) : (
                <Heart size={18} aria-hidden="true" />
              )}
              {isFavorite ? "Алып тастау" : "Таңдаулыға"}
            </button>
          </div>
        </div>
      </header>

      {/* Description */}
      {book.description && (
        <section className="max-w-3xl mx-auto px-6 py-6" aria-labelledby="book-desc-heading">
          <h2 id="book-desc-heading" className="font-bold text-[#0F0F0F] mb-3">
            Сипаттама
          </h2>
          <p className="text-[#3B3B3B] leading-relaxed text-sm">
            {book.description}
          </p>
        </section>
      )}

      {/* Chapters */}
      {chapters.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-8" aria-labelledby="book-chapters-heading">
          <div className="flex items-center gap-2 mb-4">
            <ListMusic size={18} className="text-[#F97316]" aria-hidden="true" />
            <h2 id="book-chapters-heading" className="font-bold text-[#0F0F0F]">
              Тараулар ({chapters.length})
            </h2>
          </div>
          <ul className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden divide-y divide-[#E8E8E8]">
            {chapters.map((chapter, index) => {
              const isCurrent =
                playerStore.currentChapter?.id === chapter.id;
              const isResume =
                progress?.chapter_number === chapter.chapter_number;
              const chapterLabel = [
                `${index + 1}-тарау`,
                chapter.title,
                `ұзақтығы ${formatDuration(chapter.duration)}`,
                isResume && progress
                  ? `${formatTime(progress.position)} өткен`
                  : null,
                isCurrent ? "қазір ойналуда" : null,
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <li key={chapter.id}>
                  <button
                    onClick={() =>
                      launchPlayer(
                        index,
                        isResume ? progress!.position : 0
                      )
                    }
                    aria-label={chapterLabel}
                    aria-current={isCurrent ? "true" : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F97316]",
                      isCurrent && "bg-[#FFF4ED]"
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                        isCurrent
                          ? "bg-[#F97316] text-white"
                          : "bg-[#F5F5F5] text-[#5C5C5C]"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0" aria-hidden="true">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isCurrent ? "text-[#F97316]" : "text-[#0F0F0F]"
                        )}
                      >
                        {chapter.title}
                      </p>
                      <p className="text-xs text-[#5C5C5C]">
                        {formatDuration(chapter.duration)}
                        {isResume && progress && (
                          <span className="ml-2 text-[#F97316]">
                            • {formatTime(progress.position)} өткен
                          </span>
                        )}
                      </p>
                    </div>
                    <Play
                      size={16}
                      aria-hidden="true"
                      className={cn(
                        isCurrent ? "text-[#F97316]" : "text-[#888888]"
                      )}
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}

"use client";

import { useEffect, useState, useCallback } from "react";
import { Play, Pause, Heart, HeartOff, Loader2, ListMusic } from "lucide-react";
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
  const isPlayerLoading = usePlayerStore((s) => s.isLoading);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentBookId = usePlayerStore((s) => s.currentBook?.id ?? null);
  const currentChapterId = usePlayerStore((s) => s.currentChapter?.id ?? null);
  const loadChapter = usePlayerStore((s) => s.loadChapter);
  const togglePlay = usePlayerStore((s) => s.togglePlay);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(null);

  const isCurrentBook = currentBookId === book.id;

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
      loadChapter(book, chapters, chapterIndex, startPosition);
    },
    [book, chapters, loadChapter]
  );

  // If this book is already loaded in the player, toggling play/pause is the
  // expected behavior. Otherwise we (re)launch from the requested chapter.
  const playOrToggle = useCallback(
    (chapterIndex: number, startPosition: number) => {
      const targetChapterId = chapters[chapterIndex]?.id ?? null;
      if (isCurrentBook && currentChapterId === targetChapterId) {
        togglePlay();
      } else {
        launchPlayer(chapterIndex, startPosition);
      }
    },
    [isCurrentBook, currentChapterId, chapters, togglePlay, launchPlayer]
  );

  const resumeIndex = progress
    ? chapters.findIndex((c) => c.chapter_number === progress.chapter_number)
    : -1;
  const resumeChapter = resumeIndex >= 0 ? chapters[resumeIndex] : null;

  const progressPercent = resumeChapter
    ? (progress!.position / (resumeChapter.duration || 1)) * 100
    : 0;

  const isLaunching = isCurrentBook && isPlayerLoading;
  const showsPauseOnResume =
    isCurrentBook &&
    isPlaying &&
    resumeChapter != null &&
    currentChapterId === resumeChapter.id;
  const showsPauseOnStart =
    isCurrentBook &&
    isPlaying &&
    chapters.length > 0 &&
    currentChapterId === chapters[0].id;

  return (
    <article className="min-h-screen bg-jaryq-bg-main">
      {/* Hero */}
      <header className="bg-jaryq-bg-card border-b border-jaryq-border-light">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <div className="flex gap-6">
            <div className="shrink-0">
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
                <span className="text-xs font-bold text-jaryq-primary uppercase tracking-widest">
                  {book.genre.name}
                </span>
              )}
              <h1 className="text-2xl font-black text-jaryq-text-primary mt-1 leading-tight">
                {book.title}
              </h1>
              <p className="text-jaryq-text-secondary font-medium mt-1">
                <span className="sr-only">Автор: </span>
                {book.author}
              </p>
              {book.narrator && (
                <p className="text-jaryq-text-muted text-sm italic mt-0.5">
                  Диктор: {book.narrator}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                {book.total_duration && (
                  <span className="text-sm text-jaryq-text-muted">
                    <span className="sr-only">Ұзақтығы: </span>
                    {formatDuration(book.total_duration)}
                  </span>
                )}
                {book.total_chapters && (
                  <span className="text-sm text-jaryq-text-muted">
                    {book.total_chapters} тарау
                  </span>
                )}
              </div>

              {/* Progress bar */}
              {progress && resumeChapter && (
                <div className="mt-3">
                  <div
                    className="h-1.5 bg-jaryq-border-light rounded-full overflow-hidden w-48"
                    role="progressbar"
                    aria-label="Тыңдау прогресі"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progressPercent)}
                  >
                    <div
                      className="h-full bg-jaryq-primary rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-xs text-jaryq-text-muted mt-1">
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
                  onClick={() => playOrToggle(resumeIndex, progress.position)}
                  disabled={isLaunching || chapters.length === 0}
                  aria-busy={isLaunching || undefined}
                  aria-pressed={showsPauseOnResume}
                  className="flex items-center gap-2 bg-jaryq-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-jaryq-primary-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
                >
                  {isLaunching ? (
                    <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                  ) : showsPauseOnResume ? (
                    <Pause size={18} className="fill-white" aria-hidden="true" />
                  ) : (
                    <Play size={18} className="fill-white" aria-hidden="true" />
                  )}
                  {showsPauseOnResume
                    ? "Тоқтату"
                    : `${resumeIndex + 1}-тараудан жалғастыру`}
                </button>
                <button
                  onClick={() => launchPlayer(0, 0)}
                  className="flex items-center gap-2 bg-jaryq-bg-card text-jaryq-text-primary font-semibold px-5 py-3 rounded-xl border border-jaryq-border-light hover:border-jaryq-primary hover:text-jaryq-primary transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
                >
                  Басынан тыңдау
                </button>
              </>
            ) : (
              <button
                onClick={() => playOrToggle(0, 0)}
                disabled={isLaunching || chapters.length === 0}
                aria-busy={isLaunching || undefined}
                aria-pressed={showsPauseOnStart}
                className="flex items-center gap-2 bg-jaryq-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-jaryq-primary-dark transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
              >
                {isLaunching ? (
                  <Loader2 size={18} className="animate-spin" aria-hidden="true" />
                ) : showsPauseOnStart ? (
                  <Pause size={18} className="fill-white" aria-hidden="true" />
                ) : (
                  <Play size={18} className="fill-white" aria-hidden="true" />
                )}
                {showsPauseOnStart ? "Тоқтату" : "Тыңдауды бастау"}
              </button>
            )}

            <button
              onClick={toggleFavorite}
              disabled={favLoading || !user}
              aria-pressed={isFavorite}
              className={cn(
                "flex items-center gap-2 font-semibold px-5 py-3 rounded-xl border transition-all disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2",
                isFavorite
                  ? "bg-pink-50 text-pink-500 border-pink-200 hover:bg-pink-50"
                  : "bg-jaryq-bg-card text-jaryq-text-muted border-jaryq-border-light hover:border-pink-300 hover:text-pink-500"
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
          <h2 id="book-desc-heading" className="font-bold text-jaryq-text-primary mb-3">
            Сипаттама
          </h2>
          <p className="text-jaryq-text-secondary leading-relaxed text-sm">
            {book.description}
          </p>
        </section>
      )}

      {/* Chapters */}
      {chapters.length > 0 && (
        <section className="max-w-3xl mx-auto px-6 pb-8" aria-labelledby="book-chapters-heading">
          <div className="flex items-center gap-2 mb-4">
            <ListMusic size={18} className="text-jaryq-primary" aria-hidden="true" />
            <h2 id="book-chapters-heading" className="font-bold text-jaryq-text-primary">
              Тараулар ({chapters.length})
            </h2>
          </div>
          <ul className="bg-jaryq-bg-card rounded-2xl border border-jaryq-border-light overflow-hidden divide-y divide-jaryq-border-light">
            {chapters.map((chapter, index) => {
              const isCurrent = isCurrentBook && currentChapterId === chapter.id;
              const isCurrentPlaying = isCurrent && isPlaying;
              const isResume = progress?.chapter_number === chapter.chapter_number;
              const chapterLabel = [
                `${index + 1}-тарау`,
                chapter.title,
                `ұзақтығы ${formatDuration(chapter.duration)}`,
                isResume && progress
                  ? `${formatTime(progress.position)} өткен`
                  : null,
                isCurrentPlaying
                  ? "қазір ойналуда"
                  : isCurrent
                    ? "таңдалған"
                    : null,
              ]
                .filter(Boolean)
                .join(", ");
              return (
                <li key={chapter.id}>
                  <button
                    onClick={() =>
                      playOrToggle(index, isResume ? progress!.position : 0)
                    }
                    aria-label={chapterLabel}
                    aria-current={isCurrent ? "true" : undefined}
                    aria-pressed={isCurrentPlaying}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-jaryq-bg-main transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jaryq-primary",
                      isCurrent && "bg-jaryq-primary-soft"
                    )}
                  >
                    <div
                      aria-hidden="true"
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isCurrent
                          ? "bg-jaryq-primary text-white"
                          : "bg-jaryq-bg-main text-jaryq-text-muted"
                      )}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0" aria-hidden="true">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          isCurrent ? "text-jaryq-primary" : "text-jaryq-text-primary"
                        )}
                      >
                        {chapter.title}
                      </p>
                      <p className="text-xs text-jaryq-text-muted">
                        {formatDuration(chapter.duration)}
                        {isResume && progress && (
                          <span className="ml-2 text-jaryq-primary">
                            • {formatTime(progress.position)} өткен
                          </span>
                        )}
                      </p>
                    </div>
                    {isCurrentPlaying ? (
                      <Pause
                        size={16}
                        aria-hidden="true"
                        className="text-jaryq-primary"
                      />
                    ) : (
                      <Play
                        size={16}
                        aria-hidden="true"
                        className={cn(
                          isCurrent ? "text-jaryq-primary" : "text-jaryq-text-muted"
                        )}
                      />
                    )}
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

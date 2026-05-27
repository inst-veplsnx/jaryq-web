"use client";

import { useEffect, useRef, useState, useCallback, memo, useMemo } from "react";
import { Play, Pause, Heart, HeartOff, Loader2, ListMusic } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
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
  initialFavorite?: boolean;
  initialProgress?: UserProgress | null;
}

interface ChapterRowProps {
  chapter: Chapter;
  index: number;
  isCurrent: boolean;
  isCurrentPlaying: boolean;
  isResume: boolean;
  resumePosition: number;
  onPlay: (index: number, startPosition: number) => void;
}

const ChapterRow = memo(function ChapterRow({
  chapter,
  index,
  isCurrent,
  isCurrentPlaying,
  isResume,
  resumePosition,
  onPlay,
}: ChapterRowProps) {
  const chapterLabel = useMemo(
    () =>
      [
        `${index + 1}-тарау`,
        chapter.title,
        `ұзақтығы ${formatDuration(chapter.duration)}`,
        isResume ? `${formatTime(resumePosition)} өткен` : null,
        isCurrentPlaying ? "қазір ойналуда" : isCurrent ? "таңдалған" : null,
      ]
        .filter(Boolean)
        .join(", "),
    [chapter, index, isCurrent, isCurrentPlaying, isResume, resumePosition]
  );

  return (
    <li>
      <button
        onClick={() => onPlay(index, isResume ? resumePosition : 0)}
        aria-label={chapterLabel}
        aria-current={isCurrent ? "true" : undefined}
        aria-pressed={isCurrentPlaying}
        className={cn(
          "group w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-jaryq-bg-main active:bg-jaryq-primary-soft/60 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jaryq-primary motion-reduce:transition-none",
          isCurrent && "bg-jaryq-primary-soft"
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-150 motion-reduce:transition-none",
            isCurrent
              ? "bg-jaryq-primary text-white shadow-sm"
              : "bg-jaryq-bg-main text-jaryq-text-muted group-hover:bg-jaryq-primary-soft group-hover:text-jaryq-primary"
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
            {isResume && (
              <span className="ml-2 text-jaryq-primary">
                • {formatTime(resumePosition)} өткен
              </span>
            )}
          </p>
        </div>
        {isCurrentPlaying ? (
          <Pause size={16} aria-hidden="true" className="text-jaryq-primary" />
        ) : (
          <Play
            size={16}
            aria-hidden="true"
            className={cn(isCurrent ? "text-jaryq-primary" : "text-jaryq-text-muted")}
          />
        )}
      </button>
    </li>
  );
});

export function BookDetail({
  book,
  chapters,
  initialFavorite,
  initialProgress,
}: BookDetailProps) {
  const user = useAuthStore((s) => s.user);
  const {
    isPlayerLoading,
    isPlaying,
    currentBookId,
    currentChapterId,
    loadChapter,
    togglePlay,
  } = usePlayerStore(
    useShallow((s) => ({
      isPlayerLoading: s.isLoading,
      isPlaying: s.isPlaying,
      currentBookId: s.currentBook?.id ?? null,
      currentChapterId: s.currentChapter?.id ?? null,
      loadChapter: s.loadChapter,
      togglePlay: s.togglePlay,
    }))
  );
  const [isFavorite, setIsFavorite] = useState(initialFavorite ?? false);
  const [favLoading, setFavLoading] = useState(false);
  const [progress, setProgress] = useState<UserProgress | null>(initialProgress ?? null);

  const isCurrentBook = currentBookId === book.id;

  // Sync when server re-renders the page with fresh props (router.refresh).
  useEffect(() => {
    if (initialFavorite !== undefined) setIsFavorite(initialFavorite);
  }, [initialFavorite]);
  useEffect(() => {
    if (initialProgress !== undefined) setProgress(initialProgress);
  }, [initialProgress]);

  // Skip the first client fetch when the server already seeded values for
  // this mount, but always refetch when `user` changes after mount so
  // client-side sign-in / sign-out is reflected immediately.
  const didHydrateRef = useRef(
    initialFavorite !== undefined && initialProgress !== undefined
  );
  useEffect(() => {
    if (didHydrateRef.current) {
      didHydrateRef.current = false;
      return;
    }
    if (!user) {
      setIsFavorite(false);
      setProgress(null);
      return;
    }
    let cancelled = false;
    Promise.all([
      bookService.isFavorite(user.id, book.id),
      bookService.getProgress(user.id, book.id),
    ]).then(([fav, prog]) => {
      if (cancelled) return;
      setIsFavorite(fav);
      setProgress(prog);
    });
    return () => {
      cancelled = true;
    };
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
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="flex gap-4 sm:gap-6">
            <div className="shrink-0">
              <span
                className="block rounded-xl overflow-hidden ring-1 ring-black/5"
                style={{ boxShadow: "var(--shadow-jaryq-glow)" }}
              >
                <CoverImage
                  src={book.cover_url}
                  alt=""
                  width={96}
                  height={128}
                  className="rounded-xl w-24 h-32 sm:w-30 sm:h-40"
                />
              </span>
            </div>
            <div className="flex-1 min-w-0">
              {book.genre && (
                <span className="text-xs font-bold text-jaryq-primary uppercase tracking-widest">
                  {book.genre.name}
                </span>
              )}
              <h1 className="font-display text-2xl lg:text-3xl font-black tracking-tight text-jaryq-text-primary mt-1 leading-[1.1]">
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
                    className="h-1.5 bg-jaryq-border-light rounded-full overflow-hidden w-full max-w-48"
                    role="progressbar"
                    aria-label="Тыңдау прогресі"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(progressPercent)}
                  >
                    <div
                      className="h-full jaryq-gradient-cta rounded-full"
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
                  className="flex items-center gap-2 jaryq-gradient-cta text-white font-bold px-6 py-3 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-[transform,box-shadow] duration-(--duration-jaryq-base) ease-jaryq-spring disabled:opacity-50 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
                  style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
                >
                  {isLaunching ? (
                    <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
                  className="flex items-center gap-2 bg-jaryq-bg-card text-jaryq-text-primary font-semibold px-5 py-3 rounded-xl border border-jaryq-border-light hover:border-jaryq-primary hover:text-jaryq-primary hover:bg-jaryq-primary-soft active:scale-[0.98] transition-[background-color,border-color,color,transform] duration-(--duration-jaryq-base) ease-jaryq-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none"
                  style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
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
                className="flex items-center gap-2 bg-jaryq-primary text-white font-bold px-6 py-3 rounded-xl shadow-sm hover:bg-jaryq-primary-dark hover:shadow-[0_10px_30px_-10px_rgba(249,115,22,0.55)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
              >
                {isLaunching ? (
                  <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
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
                "group/fav flex items-center gap-2 font-semibold px-5 py-3 rounded-xl border active:scale-[0.98] transition-[background-color,border-color,color,transform] duration-(--duration-jaryq-base) ease-jaryq-out disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none",
                isFavorite
                  ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                  : "bg-jaryq-bg-card text-jaryq-text-muted border-jaryq-border-light hover:border-rose-300 hover:text-rose-600 hover:bg-rose-50/40"
              )}
              style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
            >
              {isFavorite ? (
                <HeartOff
                  size={18}
                  aria-hidden="true"
                  className="transition-transform duration-(--duration-jaryq-base) group-hover/fav:scale-110 motion-reduce:transition-none motion-reduce:group-hover/fav:scale-100"
                />
              ) : (
                <Heart
                  size={18}
                  aria-hidden="true"
                  className="transition-transform duration-(--duration-jaryq-base) group-hover/fav:scale-110 motion-reduce:transition-none motion-reduce:group-hover/fav:scale-100"
                />
              )}
              {isFavorite ? "Алып тастау" : "Таңдаулыға"}
            </button>
          </div>
        </div>
      </header>

      {/* Description */}
      {book.description && (
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-6" aria-labelledby="book-desc-heading">
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
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-8" aria-labelledby="book-chapters-heading">
          <div className="flex items-center gap-2 mb-4">
            <ListMusic size={18} className="text-jaryq-primary" aria-hidden="true" />
            <h2 id="book-chapters-heading" className="font-bold text-jaryq-text-primary">
              Тараулар ({chapters.length})
            </h2>
          </div>
          <ul className="bg-jaryq-bg-card rounded-2xl border border-jaryq-border-light overflow-hidden divide-y divide-jaryq-border-light">
            {chapters.map((chapter, index) => (
              <ChapterRow
                key={chapter.id}
                chapter={chapter}
                index={index}
                isCurrent={isCurrentBook && currentChapterId === chapter.id}
                isCurrentPlaying={isCurrentBook && currentChapterId === chapter.id && isPlaying}
                isResume={progress?.chapter_number === chapter.chapter_number}
                resumePosition={progress?.position ?? 0}
                onPlay={playOrToggle}
              />
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

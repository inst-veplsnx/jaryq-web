"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronUp, X } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { usePlayerStore } from "@/store/playerStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { howlerService } from "@/lib/audio/howlerService";
import { bookService } from "@/lib/services/bookService";
import { cn, formatTime } from "@/lib/utils";
import { CoverImage } from "@/components/books/CoverImage";
import dynamic from "next/dynamic";

const FullPlayer = dynamic(
  () => import("./FullPlayer").then((m) => m.FullPlayer),
  { ssr: false }
);

const AUTOSAVE_INTERVAL_MS = 30_000;
const SPEED_STEPS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];
const KEY_SEEK_DELTA = 5;

interface PlayerBarProps {
  isNavigationCollapsed?: boolean;
}

export function PlayerBar({ isNavigationCollapsed = false }: PlayerBarProps) {
  const {
    currentBook,
    currentChapter,
    chapterIndex,
    isPlaying,
    position,
    duration,
    chapters,
    isLoading,
    playerError,
  } = usePlayerStore(
    useShallow((s) => ({
      currentBook: s.currentBook,
      currentChapter: s.currentChapter,
      chapterIndex: s.chapterIndex,
      isPlaying: s.isPlaying,
      position: s.position,
      duration: s.duration,
      chapters: s.chapters,
      isLoading: s.isLoading,
      playerError: s.error,
    }))
  );
  const { user } = useAuthStore();
  const { autoSave, speed, setSpeed } = useSettingsStore();
  const [showFull, setShowFull] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Speed ref keeps the callback stable while always reading the latest value
  const speedRef = useRef(speed);
  useEffect(() => { speedRef.current = speed; }, [speed]);

  const loadChapter = useCallback(
    function loadChapterImpl(index: number, startPosition = 0) {
      // Read chapters directly from the store: the parent's `loadChapter`
      // updates `chapters` and calls us synchronously, so any ref/state
      // derived from React render would still be stale here.
      const chapter = usePlayerStore.getState().chapters[index];
      if (!chapter) return;

      usePlayerStore.setState({
        currentChapter: chapter,
        chapterIndex: index,
        isPlaying: true,
        isLoading: true,
        error: null,
        position: startPosition,
        duration: 0,
      });

      howlerService.load(
        chapter.audio_url,
        () => {
          const nextIndex = index + 1;
          if (nextIndex < usePlayerStore.getState().chapters.length) {
            loadChapterImpl(nextIndex, 0);
          } else {
            usePlayerStore.setState({ isPlaying: false });
          }
        },
        () => {
          const dur = howlerService.getDuration();
          usePlayerStore.setState({ isLoading: false, duration: dur });
          if (startPosition > 0) {
            howlerService.seekTo(startPosition);
          }
          howlerService.setSpeed(speedRef.current);
        },
        () => {
          usePlayerStore.setState({
            isLoading: false,
            isPlaying: false,
            error: "Аудио жүктелмеді. Суретіңіздегі сілтемені тексеріңіз.",
          });
        }
      );
      // Call play synchronously so the browser preserves the user-gesture
      // context from the click that triggered this load. Howler queues the
      // play action and runs it as soon as the audio is ready.
      howlerService.play();
    },
    []
  );

  // Register loadChapter with the store so BookDetail can trigger it
  useEffect(() => {
    usePlayerStore.getState().registerLoadChapter(loadChapter);
    return () => {
      usePlayerStore.getState().registerLoadChapter(null);
    };
  }, [loadChapter]);

  // Position tick — updates store at 4fps (250ms) to prevent 60fps Zustand re-renders.
  // The progress bar uses a CSS transition to stay visually smooth at 60fps.
  // Gated on isPlaying so the interval doesn't run forever when nothing is playing.
  useEffect(() => {
    if (!isPlaying) return;
    const tick = () => {
      if (howlerService.isPlaying()) {
        usePlayerStore.setState({
          position: howlerService.getPosition(),
          duration: howlerService.getDuration(),
        });
      }
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Auto-save progress — reads position from store (single source of truth)
  useEffect(() => {
    if (!autoSave || !user || !currentBook || !currentChapter) return;

    const save = () => {
      const pos = usePlayerStore.getState().position;
      bookService.saveProgress(
        user.id,
        currentBook.id,
        currentChapter.id,
        currentChapter.chapter_number,
        Math.floor(pos)
      );
    };

    saveTimerRef.current = setInterval(save, AUTOSAVE_INTERVAL_MS);
    return () => {
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [autoSave, user, currentBook, currentChapter]);

  const togglePlay = useCallback(() => {
    usePlayerStore.getState().togglePlay();
  }, []);

  const skipPrev = useCallback(() => {
    const idx = usePlayerStore.getState().chapterIndex;
    if (idx > 0) {
      loadChapter(idx - 1, 0);
    } else {
      howlerService.seekTo(0);
      usePlayerStore.setState({ position: 0 });
    }
  }, [loadChapter]);

  const skipNext = useCallback(() => {
    const idx = usePlayerStore.getState().chapterIndex;
    if (idx < usePlayerStore.getState().chapters.length - 1) {
      loadChapter(idx + 1, 0);
    }
  }, [loadChapter]);

  const cycleSpeed = useCallback(() => {
    const idx = SPEED_STEPS.indexOf(speedRef.current);
    const next = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
    howlerService.setSpeed(next);
    setSpeed(next);
  }, [setSpeed]);

  const close = useCallback(() => {
    howlerService.unload();
    usePlayerStore.getState().reset();
  }, []);

  const openFull = useCallback(() => setShowFull(true), []);
  const closeFull = useCallback(() => setShowFull(false), []);

  // Scrub by clicking/dragging on the progress bar.
  const seekToRatio = useCallback((ratio: number) => {
    const dur = usePlayerStore.getState().duration;
    if (!dur) return;
    const newPos = Math.max(0, Math.min(dur, ratio * dur));
    howlerService.seekTo(newPos);
    usePlayerStore.setState({ position: newPos });
  }, []);

  const handleScrubPointer = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (rect.width <= 0) return;
      seekToRatio((e.clientX - rect.left) / rect.width);
    },
    [seekToRatio]
  );

  const handleScrubKey = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      const dur = usePlayerStore.getState().duration;
      if (!dur) return;
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        const pos = usePlayerStore.getState().position;
        const delta = e.key === "ArrowLeft" ? -KEY_SEEK_DELTA : KEY_SEEK_DELTA;
        const newPos = Math.max(0, Math.min(dur, pos + delta));
        howlerService.seekTo(newPos);
        usePlayerStore.setState({ position: newPos });
      } else if (e.key === "Home") {
        e.preventDefault();
        howlerService.seekTo(0);
        usePlayerStore.setState({ position: 0 });
      } else if (e.key === "End") {
        e.preventDefault();
        howlerService.seekTo(dur);
        usePlayerStore.setState({ position: dur });
      }
    },
    []
  );

  if (!currentBook) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;
  const chapterNum = currentChapter?.chapter_number;
  const chapterTitle = currentChapter?.title;

  return (
    <>
      {/* Full player sheet */}
      {showFull && (
        <FullPlayer
          onClose={closeFull}
          onLoadChapter={loadChapter}
          togglePlay={togglePlay}
          skipPrev={skipPrev}
          skipNext={skipNext}
          cycleSpeed={cycleSpeed}
        />
      )}

      {/* Mini player bar */}
      <section
        aria-label="Аудио ойнатқыш"
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-jaryq-bg-card/95 backdrop-blur-md border-t-2 border-jaryq-primary/20 pb-safe transition-[left] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none",
          isNavigationCollapsed ? "lg:left-[4.5rem]" : "lg:left-60"
        )}
        style={{ boxShadow: "0 -12px 28px -10px rgba(15,15,15,0.12), var(--shadow-jaryq-md)" }}
      >
        {/* Error banner */}
        {playerError && (
          <p className="text-xs text-red-400 text-center py-1 px-4 bg-red-950/30">
            {playerError}
          </p>
        )}

        {/* Scrubbable progress bar.
           Outer wrapper provides a generous y-padded hit area; inner track
           is visually thin but easy to tap. */}
        <div
          role="slider"
          tabIndex={duration > 0 ? 0 : -1}
          aria-label="Тарау прогресі"
          aria-valuemin={0}
          aria-valuemax={Math.round(duration) || 0}
          aria-valuenow={Math.round(position)}
          aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
          onPointerDown={handleScrubPointer}
          onKeyDown={handleScrubKey}
          className="group relative py-1.5 -my-1 cursor-pointer focus-visible:outline-none touch-none"
        >
          <div className="relative h-1 group-hover:h-1.5 group-focus-visible:h-1.5 bg-jaryq-border-light transition-[height] duration-150 motion-reduce:transition-none overflow-hidden">
            {isLoading ? (
              <div className="absolute inset-0 bg-jaryq-primary/40 overflow-hidden">
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent motion-reduce:hidden"
                  style={{ animation: "jaryq-shimmer 1.4s linear infinite" }}
                />
              </div>
            ) : (
              <div
                className="h-full jaryq-gradient-cta transition-[width] duration-250 linear motion-reduce:transition-none"
                style={{ width: `${progress}%` }}
              />
            )}
          </div>
          {/* Hover thumb */}
          {!isLoading && duration > 0 && (
            <span
              aria-hidden="true"
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-jaryq-primary shadow-sm ring-2 ring-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity duration-150 motion-reduce:transition-none"
              style={{ left: `${progress}%` }}
            />
          )}
        </div>

        {/* Live region for chapter / state changes */}
        <div role="status" aria-live="polite" className="sr-only">
          {currentChapter
            ? `${currentChapter.chapter_number}-тарау: ${currentChapter.title}${isPlaying ? ", ойналуда" : ", тоқтатылды"}`
            : ""}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 h-16">
          {/* Cover + info */}
          <button
            onClick={openFull}
            aria-label={`Толық ойнатқышты ашу: ${currentBook.title}${currentChapter ? `, ${currentChapter.title}` : ""}`}
            className="group flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-md"
          >
            <span className="relative shrink-0 overflow-hidden rounded-md ring-1 ring-black/5 shadow-sm">
              <CoverImage
                src={currentBook.cover_url}
                alt=""
                width={40}
                height={52}
                className="block transition-transform duration-300 ease-out group-hover:scale-[1.04] motion-reduce:transition-none"
              />
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold tracking-tight text-jaryq-text-primary text-sm truncate leading-tight">
                {currentBook.title}
              </p>
              <p className="text-jaryq-text-muted text-[11px] font-medium truncate leading-tight">
                {chapterTitle ? (
                  <>
                    {chapterNum ? (
                      <span className="text-jaryq-primary/80 font-semibold">
                        {chapterNum}-тарау
                      </span>
                    ) : null}
                    {chapterNum ? <span className="mx-1 opacity-50">·</span> : null}
                    {chapterTitle}
                  </>
                ) : (
                  currentBook.author
                )}
              </p>
            </div>
          </button>

          {/* Time + speed group (secondary metadata, subordinated) */}
          <div className="hidden sm:flex items-center gap-2">
            <span
              className="text-[11px] text-jaryq-text-muted font-mono tabular-nums"
              aria-hidden="true"
            >
              {formatTime(position)}
            </span>
            <button
              onClick={cycleSpeed}
              aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
              className="text-[10px] font-bold text-jaryq-primary bg-jaryq-primary-soft px-1.5 py-0.5 rounded-full transition-transform duration-150 active:scale-95 hover:bg-jaryq-primary-med/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <span aria-hidden="true">{speed}x</span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={skipPrev}
              aria-label="Алдыңғы тарау"
              className="hidden sm:flex w-11 h-11 items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <SkipBack size={18} aria-hidden="true" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
              aria-pressed={isPlaying}
              className="w-11 h-11 flex items-center justify-center rounded-full jaryq-gradient-cta text-white hover:scale-[1.05] active:scale-95 transition-transform duration-(--duration-jaryq-base) ease-jaryq-spring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
              style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
            >
              <span className="relative w-5 h-5 inline-flex items-center justify-center">
                <Play
                  size={20}
                  aria-hidden="true"
                  className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                    isPlaying ? "opacity-0 scale-50" : "opacity-100 scale-100"
                  }`}
                />
                <Pause
                  size={20}
                  aria-hidden="true"
                  className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                    isPlaying ? "opacity-100 scale-100" : "opacity-0 scale-50"
                  }`}
                />
              </span>
            </button>
            <button
              onClick={skipNext}
              disabled={chapterIndex >= chapters.length - 1}
              aria-label="Келесі тарау"
              className="hidden sm:flex w-11 h-11 items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-transform duration-150 active:scale-95 disabled:opacity-30 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <SkipForward size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Expand — redundant on mobile since the cover/info button also opens
              the full player; keep it for tablet/desktop. */}
          <button
            onClick={openFull}
            aria-label="Толық ойнатқышты ашу"
            className="hidden sm:flex w-11 h-11 items-center justify-center text-jaryq-text-muted hover:text-jaryq-primary transition-transform duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-full motion-reduce:transition-none"
          >
            <ChevronUp size={18} aria-hidden="true" />
          </button>

          {/* Close (subordinated — visually quieter than expand/play) */}
          <button
            onClick={close}
            aria-label="Ойнатқышты жабу"
            className="w-9 h-9 flex items-center justify-center text-jaryq-text-muted/60 hover:text-red-500 transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-full motion-reduce:transition-none"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  );
}

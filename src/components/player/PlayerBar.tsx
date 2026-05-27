"use client";

import { useEffect, useRef, useCallback, useState, useId } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronUp, ChevronDown, X } from "lucide-react";
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
  const user = useAuthStore((s) => s.user);
  const { autoSave, speed, setSpeed } = useSettingsStore();
  const [showFull, setShowFull] = useState(false);
  const fullPlayerDialogId = useId();

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

  // Auto-save progress — reads position from store (single source of truth).
  // Deps use primitive IDs to avoid re-arming when object references change
  // while the actual book/chapter/user hasn't changed.
  // Flushes on cleanup (book/chapter/user change, player close) and on
  // pagehide (tab close, mobile backgrounding) to avoid losing trailing progress.
  useEffect(() => {
    const userId = user?.id;
    const bookId = currentBook?.id;
    const chapterId = currentChapter?.id;
    if (!autoSave || !userId || !bookId || !chapterId) return;

    const flush = () => {
      const state = usePlayerStore.getState();
      if (!state.currentBook || !state.currentChapter) return;
      bookService.saveProgress(
        userId,
        state.currentBook.id,
        state.currentChapter.id,
        state.currentChapter.chapter_number,
        Math.floor(state.position)
      );
    };

    const id = setInterval(flush, AUTOSAVE_INTERVAL_MS);
    window.addEventListener("pagehide", flush);
    return () => {
      clearInterval(id);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [autoSave, user?.id, currentBook?.id, currentChapter?.id]);

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

  const handleMiniSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const dur = usePlayerStore.getState().duration;
    if (!dur) return;
    const newPos = Math.max(0, Math.min(dur, parseFloat(e.target.value)));
    howlerService.seekTo(newPos);
    usePlayerStore.setState({ position: newPos });
  }, []);

  const handleScrubKey = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
  const clampedPosition = duration > 0 ? Math.min(position, duration) : 0;

  return (
    <>
      {/* Full player sheet */}
      <FullPlayer
        isOpen={showFull}
        dialogId={fullPlayerDialogId}
        onClose={closeFull}
        onLoadChapter={loadChapter}
        togglePlay={togglePlay}
        skipPrev={skipPrev}
        skipNext={skipNext}
        cycleSpeed={cycleSpeed}
      />

      {/* Mini player bar */}
      <section
        aria-label="Аудио ойнатқыш"
        aria-hidden={showFull ? "true" : undefined}
        className={cn(
          "fixed bottom-0 left-[4.5rem] right-0 z-50 bg-transparent px-2 pb-safe transition-[left] duration-(--duration-jaryq-slow) ease-jaryq-out motion-reduce:transition-none sm:px-4",
          isNavigationCollapsed ? "lg:left-[4.5rem]" : "lg:left-60"
        )}
      >
        <div
          className="overflow-hidden rounded-t-2xl border border-jaryq-border-warm/80 bg-jaryq-bg-main"
          style={{
            boxShadow:
              "0 -18px 42px -24px rgba(15,15,15,0.28), var(--shadow-jaryq-md)",
          }}
        >
          {/* Error banner */}
          {playerError && (
            <p
              role="alert"
              aria-live="assertive"
              className="bg-red-50 px-4 py-1.5 text-center text-xs font-medium text-red-700"
            >
              {playerError}
            </p>
          )}

          <div className="relative px-3 pt-3 sm:px-4">
            <input
              id="mini-player-progress"
              type="range"
              min={0}
              max={duration || 1}
              step={0.5}
              value={clampedPosition}
              disabled={duration <= 0}
              aria-label="Тарау прогресі"
              aria-valuemin={0}
              aria-valuemax={Math.round(duration) || 1}
              aria-valuenow={Math.round(position)}
              aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
              onChange={handleMiniSeek}
              onKeyDown={handleScrubKey}
              className="jaryq-player-range w-full"
              style={
                {
                  "--jaryq-range-progress": `${progress}%`,
                } as React.CSSProperties
              }
            />
            {isLoading && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-3 top-[1.125rem] h-2 overflow-hidden rounded-full bg-jaryq-primary-soft sm:inset-x-4"
              >
                <span
                  className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/80 to-transparent motion-reduce:hidden"
                  style={{ animation: "jaryq-shimmer 1.4s linear infinite" }}
                />
              </span>
            )}
          </div>

          {/* Live region for chapter / state changes */}
          <div role="status" aria-live="polite" className="sr-only">
            {currentChapter
              ? `${currentChapter.chapter_number}-тарау: ${currentChapter.title}${isPlaying ? ", ойналуда" : ", тоқтатылды"}`
              : ""}
          </div>

          <div className="flex h-[4.25rem] items-center gap-2 px-3 sm:h-[4.5rem] sm:gap-3 sm:px-4">
            {/* Cover + info */}
            <button
              onClick={() => setShowFull(!showFull)}
              aria-label={`${showFull ? 'Толық ойнатқышты жабу' : 'Толық ойнатқышты ашу'}: ${currentBook.title}${currentChapter ? `, ${currentChapter.title}` : ""}`}
              aria-haspopup="dialog"
              aria-expanded={showFull}
              aria-controls={fullPlayerDialogId}
              className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl p-1 text-left transition-colors duration-(--duration-jaryq-fast) hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <span
                className="relative shrink-0 overflow-hidden rounded-xl ring-1 ring-black/5"
                style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
              >
                <CoverImage
                  src={currentBook.cover_url}
                  alt=""
                  width={46}
                  height={60}
                  className="block transition-transform duration-300 ease-jaryq-out group-hover:scale-[1.04] motion-reduce:transition-none"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold leading-tight tracking-tight text-jaryq-text-primary">
                  {currentBook.title}
                </p>
                <p className="truncate text-[11px] font-medium leading-tight text-jaryq-text-muted sm:text-xs">
                  {chapterTitle ? (
                    <>
                      {chapterNum ? (
                        <span className="font-semibold text-jaryq-primary/80">
                          {chapterNum}-тарау
                        </span>
                      ) : null}
                      {chapterNum ? <span className="mx-1 opacity-50">-</span> : null}
                      {chapterTitle}
                    </>
                  ) : (
                    currentBook.author
                  )}
                </p>
              </div>
            </button>

            {/* Time + speed group (secondary metadata, subordinated) */}
            <div className="hidden items-center gap-2 rounded-full border border-jaryq-border-warm bg-white/70 px-2.5 py-1 sm:flex">
              <span
                className="font-mono text-[11px] tabular-nums text-jaryq-text-muted"
                aria-hidden="true"
              >
                {formatTime(position)}
              </span>
              <button
                onClick={cycleSpeed}
                aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
                className="rounded-full bg-jaryq-primary-soft px-2 py-1 text-[10px] font-bold text-jaryq-primary transition-transform duration-150 hover:bg-jaryq-primary-med/40 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
              >
                <span aria-hidden="true">{speed}x</span>
              </button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 rounded-full bg-white/65 p-1 ring-1 ring-jaryq-border-warm/80">
              <button
                onClick={skipPrev}
                aria-label="Алдыңғы тарау"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none sm:flex"
              >
                <SkipBack size={18} aria-hidden="true" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
                aria-pressed={isPlaying}
                className="flex h-11 w-11 items-center justify-center rounded-full text-white jaryq-gradient-cta transition-transform duration-(--duration-jaryq-base) ease-jaryq-spring hover:scale-[1.05] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
                style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
              >
                <span className="relative inline-flex h-5 w-5 items-center justify-center">
                  <Play
                    size={20}
                    aria-hidden="true"
                    className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                      isPlaying ? "scale-50 opacity-0" : "scale-100 opacity-100"
                    }`}
                  />
                  <Pause
                    size={20}
                    aria-hidden="true"
                    className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                      isPlaying ? "scale-100 opacity-100" : "scale-50 opacity-0"
                    }`}
                  />
                </span>
              </button>
              <button
                onClick={skipNext}
                disabled={chapterIndex >= chapters.length - 1}
                aria-label="Келесі тарау"
                className="hidden h-10 w-10 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-soft active:scale-95 disabled:opacity-30 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none sm:flex"
              >
                <SkipForward size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Expand — redundant on mobile since the cover/info button also opens
              the full player; keep it for tablet/desktop. */}
            <button
              onClick={() => setShowFull(!showFull)}
              aria-label={showFull ? "Толық ойнатқышты жабу" : "Толық ойнатқышты ашу"}
              aria-haspopup="dialog"
              aria-expanded={showFull}
              aria-controls={fullPlayerDialogId}
              className="hidden h-11 w-11 items-center justify-center rounded-full text-jaryq-text-muted transition-[background-color,color,transform] duration-150 hover:bg-jaryq-primary-soft hover:text-jaryq-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none sm:flex"
            >
              {showFull ? (
                <ChevronDown size={18} aria-hidden="true" />
              ) : (
                <ChevronUp size={18} aria-hidden="true" />
              )}
            </button>

            {/* Close (subordinated — visually quieter than expand/play) */}
            <button
              onClick={close}
              aria-label="Ойнатқышты жабу"
              className="flex h-10 w-10 items-center justify-center rounded-full text-jaryq-text-muted/70 transition-[background-color,color,transform] duration-150 hover:bg-red-50 hover:text-red-600 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

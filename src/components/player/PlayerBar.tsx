"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, ChevronUp, X } from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useAuthStore } from "@/store/authStore";
import { useSettingsStore } from "@/store/settingsStore";
import { howlerService } from "@/lib/audio/howlerService";
import { bookService } from "@/lib/services/bookService";
import { formatTime } from "@/lib/utils";
import { CoverImage } from "@/components/books/CoverImage";
import dynamic from "next/dynamic";

const FullPlayer = dynamic(
  () => import("./FullPlayer").then((m) => m.FullPlayer),
  { ssr: false }
);

const AUTOSAVE_INTERVAL_MS = 30_000;
const SPEED_STEPS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function PlayerBar() {
  const currentBook = usePlayerStore((s) => s.currentBook);
  const currentChapter = usePlayerStore((s) => s.currentChapter);
  const chapterIndex = usePlayerStore((s) => s.chapterIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const chapters = usePlayerStore((s) => s.chapters);
  const { user } = useAuthStore();
  const { autoSave, speed, setSpeed } = useSettingsStore();
  const [showFull, setShowFull] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs keep callbacks stable while always reading the latest chapters/speed
  const chaptersRef = useRef(chapters);
  const speedRef = useRef(speed);
  useEffect(() => { chaptersRef.current = chapters; });
  useEffect(() => { speedRef.current = speed; });

  const loadChapter = useCallback(
    (index: number, startPosition = 0) => {
      const chapter = chaptersRef.current[index];
      if (!chapter) return;

      usePlayerStore.setState({
        currentChapter: chapter,
        chapterIndex: index,
        isPlaying: true,
        isLoading: true,
        position: startPosition,
        duration: 0,
      });

      howlerService.load(
        chapter.audio_url,
        () => {
          const nextIndex = index + 1;
          if (nextIndex < chaptersRef.current.length) {
            loadChapter(nextIndex, 0);
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
          usePlayerStore.setState({ isLoading: false, isPlaying: false });
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
  useEffect(() => {
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
  }, []);

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
    if (idx < chaptersRef.current.length - 1) {
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

  if (!currentBook) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

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
        className="fixed bottom-0 left-0 right-0 lg:left-60 z-50 bg-jaryq-bg-card border-t-2 border-jaryq-primary/20 shadow-lg"
      >
        {/* Progress bar */}
        <div
          className="h-1 bg-jaryq-border-light"
          role="progressbar"
          aria-label="Тарау прогресі"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
        >
          <div
            className="h-full bg-jaryq-primary transition-[width] duration-250 linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Live region for chapter / state changes */}
        <div role="status" aria-live="polite" className="sr-only">
          {currentChapter
            ? `${currentChapter.chapter_number}-тарау: ${currentChapter.title}${isPlaying ? ", ойналуда" : ", тоқтатылды"}`
            : ""}
        </div>

        <div className="flex items-center gap-3 px-4 h-16 pb-safe">
          {/* Cover + info */}
          <button
            onClick={openFull}
            aria-label={`Толық ойнатқышты ашу: ${currentBook.title}${currentChapter ? `, ${currentChapter.title}` : ""}`}
            className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-md"
          >
            <CoverImage
              src={currentBook.cover_url}
              alt=""
              width={40}
              height={52}
              className="rounded-md shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-jaryq-text-primary text-sm truncate leading-tight">
                {currentBook.title}
              </p>
              <p className="text-jaryq-text-muted text-xs truncate">
                {currentChapter?.title || currentBook.author}
              </p>
            </div>
          </button>

          {/* Time */}
          <span
            className="text-xs text-jaryq-text-muted font-mono hidden xs:block"
            aria-hidden="true"
          >
            {formatTime(position)}
          </span>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
            className="text-xs font-bold text-jaryq-primary bg-jaryq-primary-soft px-2 py-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
          >
            <span aria-hidden="true">{speed}x</span>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={skipPrev}
              aria-label="Алдыңғы тарау"
              className="w-11 h-11 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
            >
              <SkipBack size={18} aria-hidden="true" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
              aria-pressed={isPlaying}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-jaryq-primary text-white hover:bg-jaryq-primary-dark transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
            >
              {isPlaying ? (
                <Pause size={20} aria-hidden="true" />
              ) : (
                <Play size={20} aria-hidden="true" />
              )}
            </button>
            <button
              onClick={skipNext}
              disabled={chapterIndex >= chapters.length - 1}
              aria-label="Келесі тарау"
              className="w-11 h-11 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
            >
              <SkipForward size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Expand */}
          <button
            onClick={openFull}
            aria-label="Толық ойнатқышты ашу"
            className="w-11 h-11 flex items-center justify-center text-jaryq-text-muted hover:text-jaryq-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-full"
          >
            <ChevronUp size={18} aria-hidden="true" />
          </button>

          {/* Close */}
          <button
            onClick={close}
            aria-label="Ойнатқышты жабу"
            className="w-11 h-11 flex items-center justify-center text-jaryq-text-muted hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded-full"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  );
}

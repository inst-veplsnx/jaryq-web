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
import { FullPlayer } from "./FullPlayer";

const AUTOSAVE_INTERVAL_MS = 30_000;
const SPEED_STEPS = [0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

export function PlayerBar() {
  const store = usePlayerStore();
  const { user } = useAuthStore();
  const { autoSave } = useSettingsStore();
  const [showFull, setShowFull] = useState(false);
  const rafRef = useRef<number>(0);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    currentBook,
    currentChapter,
    chapterIndex,
    isPlaying,
    speed,
    position,
    duration,
    chapters,
  } = store;

  const loadChapter = useCallback(
    (index: number, startPosition = 0) => {
      const chapter = chapters[index];
      if (!chapter) return;

      store.set({
        currentChapter: chapter,
        chapterIndex: index,
        isPlaying: false,
        isLoading: true,
        position: startPosition,
        duration: 0,
      });

      howlerService.load(
        chapter.audio_url,
        () => {
          const nextIndex = index + 1;
          if (nextIndex < chapters.length) {
            loadChapter(nextIndex, 0);
          } else {
            store.set({ isPlaying: false });
          }
        },
        () => {
          const dur = howlerService.getDuration();
          store.set({ isLoading: false, duration: dur });
          if (startPosition > 0) {
            howlerService.seekTo(startPosition);
          }
          howlerService.setSpeed(speed);
          howlerService.play();
          store.set({ isPlaying: true });
        },
        () => {
          store.set({ isLoading: false });
        }
      );
    },
    [chapters, speed, store]
  );

  // expose loadChapter so BookDetailClient can call it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__jaryq_loadChapter = loadChapter;
    return () => {
      delete (window as unknown as Record<string, unknown>).__jaryq_loadChapter;
    };
  }, [loadChapter]);

  // RAF position loop
  useEffect(() => {
    const tick = () => {
      if (howlerService.isPlaying()) {
        const pos = howlerService.getPosition();
        const dur = howlerService.getDuration();
        store.set({ position: pos, duration: dur });
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [store]);

  // Auto-save progress
  useEffect(() => {
    if (!autoSave || !user || !currentBook || !currentChapter) return;

    const save = () => {
      const pos = howlerService.getPosition();
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

  const togglePlay = () => {
    if (isPlaying) {
      howlerService.pause();
      store.set({ isPlaying: false });
    } else {
      howlerService.play();
      store.set({ isPlaying: true });
    }
  };

  const skipPrev = () => {
    if (chapterIndex > 0) {
      loadChapter(chapterIndex - 1, 0);
    } else {
      howlerService.seekTo(0);
      store.set({ position: 0 });
    }
  };

  const skipNext = () => {
    if (chapterIndex < chapters.length - 1) {
      loadChapter(chapterIndex + 1, 0);
    }
  };

  const cycleSpeed = () => {
    const idx = SPEED_STEPS.indexOf(speed);
    const next = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
    howlerService.setSpeed(next);
    store.set({ speed: next });
  };

  const close = () => {
    howlerService.unload();
    store.reset();
  };

  if (!currentBook) return null;

  const progress = duration > 0 ? (position / duration) * 100 : 0;

  return (
    <>
      {/* Full player sheet */}
      {showFull && (
        <FullPlayer
          onClose={() => setShowFull(false)}
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
        className="fixed bottom-0 left-0 right-0 lg:left-60 z-50 bg-white border-t-2 border-[#F97316]/20 shadow-lg"
      >
        {/* Progress bar */}
        <div
          className="h-1 bg-[#E8E8E8]"
          role="progressbar"
          aria-label="Тарау прогресі"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
        >
          <div
            className="h-full bg-[#F97316] transition-none"
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
            onClick={() => setShowFull(true)}
            aria-label={`Толық ойнатқышты ашу: ${currentBook.title}${currentChapter ? `, ${currentChapter.title}` : ""}`}
            className="flex items-center gap-3 flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-md"
          >
            <CoverImage
              src={currentBook.cover_url}
              alt=""
              width={40}
              height={52}
              className="rounded-md flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0F0F0F] text-sm truncate leading-tight">
                {currentBook.title}
              </p>
              <p className="text-[#5C5C5C] text-xs truncate">
                {currentChapter?.title || currentBook.author}
              </p>
            </div>
          </button>

          {/* Time */}
          <span
            className="text-xs text-[#5C5C5C] font-mono hidden xs:block"
            aria-hidden="true"
          >
            {formatTime(position)}
          </span>

          {/* Speed */}
          <button
            onClick={cycleSpeed}
            aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
            className="text-xs font-bold text-[#F97316] bg-[#FFF4ED] px-2 py-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <span aria-hidden="true">{speed}x</span>
          </button>

          {/* Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={skipPrev}
              aria-label="Алдыңғы тарау"
              className="w-11 h-11 flex items-center justify-center rounded-full text-[#3B3B3B] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              <SkipBack size={18} aria-hidden="true" />
            </button>
            <button
              onClick={togglePlay}
              aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
              aria-pressed={isPlaying}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-[#F97316] text-white hover:bg-[#EA580C] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
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
              className="w-11 h-11 flex items-center justify-center rounded-full text-[#3B3B3B] hover:bg-[#F5F5F5] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              <SkipForward size={18} aria-hidden="true" />
            </button>
          </div>

          {/* Expand */}
          <button
            onClick={() => setShowFull(true)}
            aria-label="Толық ойнатқышты ашу"
            className="w-11 h-11 flex items-center justify-center text-[#5C5C5C] hover:text-[#F97316] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-full"
          >
            <ChevronUp size={18} aria-hidden="true" />
          </button>

          {/* Close */}
          <button
            onClick={close}
            aria-label="Ойнатқышты жабу"
            className="w-11 h-11 flex items-center justify-center text-[#5C5C5C] hover:text-[#EF4444] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] rounded-full"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </section>
    </>
  );
}

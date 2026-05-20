"use client";

import { memo, useState, useEffect, useRef, useId } from "react";
import { ChevronDown, List } from "lucide-react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  RotateCw,
  Gauge,
  Loader2,
} from "lucide-react";
import { usePlayerStore } from "@/store/playerStore";
import { useSettingsStore } from "@/store/settingsStore";
import { howlerService } from "@/lib/audio/howlerService";
import { formatTime } from "@/lib/utils";
import { CoverImage } from "@/components/books/CoverImage";
import { ChapterList } from "./ChapterList";

interface FullPlayerProps {
  onClose: () => void;
  onLoadChapter: (index: number, startPosition?: number) => void;
  togglePlay: () => void;
  skipPrev: () => void;
  skipNext: () => void;
  cycleSpeed: () => void;
}

export const FullPlayer = memo(function FullPlayer({
  onClose,
  onLoadChapter,
  togglePlay,
  skipPrev,
  skipNext,
  cycleSpeed,
}: FullPlayerProps) {
  const {
    currentBook,
    currentChapter,
    chapterIndex,
    isPlaying,
    position,
    duration,
    chapters,
    isLoading,
  } = usePlayerStore();
  const store = usePlayerStore();
  const { speed } = useSettingsStore();
  const [showChapters, setShowChapters] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const sliderLabelId = useId();

  const progress = duration > 0 ? position / duration : 0;

  // Focus management: save previous focus, focus close button on open, restore on close
  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, []);

  // Escape to close + simple focus trap inside the dialog
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (showChapters) return;
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose, showChapters]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseFloat(e.target.value);
    howlerService.seekTo(newPos);
    store.set({ position: newPos });
  };

  const seekRelative = (delta: number) => {
    const newPos = Math.max(0, Math.min(duration, position + delta));
    howlerService.seekTo(newPos);
    store.set({ position: newPos });
  };

  if (!currentBook) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 bg-gradient-to-b from-jaryq-primary-soft via-white to-white flex flex-col overflow-hidden"
    >
      {/* Layered ambient gradient — two drifting blurred orbs */}
      <div
        aria-hidden="true"
        className="absolute top-[18%] left-1/2 -translate-x-1/2 w-72 h-72 bg-jaryq-primary/15 rounded-full blur-3xl pointer-events-none animate-[jaryq-ambient-drift_18s_ease-in-out_infinite] motion-reduce:animate-none"
      />
      <div
        aria-hidden="true"
        className="absolute top-[42%] right-[12%] w-64 h-64 bg-jaryq-primary-med/25 rounded-full blur-3xl pointer-events-none animate-[jaryq-ambient-drift-alt_24s_ease-in-out_infinite] motion-reduce:animate-none"
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 pt-safe pt-4 pb-2 backdrop-blur-md bg-white/60 border-b border-jaryq-border-light/50">
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Ойнатқышты жабу"
          className="w-11 h-11 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
        >
          <ChevronDown size={24} aria-hidden="true" />
        </button>
        <p
          id={titleId}
          className="text-sm font-semibold text-jaryq-text-primary text-center flex-1 px-4 truncate"
        >
          {currentChapter?.title || "Тыңдап жатырсыз"}
        </p>
        <button
          onClick={() => setShowChapters(true)}
          aria-label="Тараулар тізімі"
          aria-haspopup="dialog"
          className="w-11 h-11 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
        >
          <List size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Cover */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-4 relative">
        <div
          className={`relative w-56 h-72 rounded-2xl overflow-hidden mb-6 shadow-[0_30px_60px_-20px_rgba(249,115,22,0.35)] ${
            isPlaying
              ? "animate-[jaryq-cover-breathe_4s_ease-in-out_infinite] motion-reduce:animate-none"
              : ""
          }`}
        >
          <CoverImage
            src={currentBook.cover_url}
            alt=""
            width={224}
            height={288}
            className="w-full h-full object-cover"
          />
          {isLoading && (
            <div
              aria-hidden="true"
              className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-sm"
            >
              <Loader2
                size={36}
                className="text-jaryq-primary animate-spin motion-reduce:animate-none"
              />
            </div>
          )}
        </div>

        {/* Book info */}
        <div className="text-center w-full max-w-xs">
          <p className="text-jaryq-text-secondary text-xs font-semibold uppercase tracking-wide mb-1">
            {currentBook.author}
          </p>
          <h2 className="text-xl font-black tracking-tight text-jaryq-text-primary leading-tight mb-1">
            {currentBook.title}
          </h2>
          {currentBook.narrator && (
            <p className="text-jaryq-text-secondary text-sm italic">
              <span className="sr-only">Диктор: </span>
              {currentBook.narrator}
            </p>
          )}
          {chapters.length > 0 && (
            <button
              type="button"
              onClick={() => setShowChapters(true)}
              aria-label={`${chapterIndex + 1}-тарау ${chapters.length} тараудан. Тараулар тізімін ашу.`}
              aria-haspopup="dialog"
              className="mt-2 inline-flex items-center gap-1 bg-jaryq-primary-soft text-jaryq-primary text-xs font-semibold px-3 py-1 rounded-full transition-all duration-150 active:scale-95 hover:bg-jaryq-primary-med/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <span aria-hidden="true">
                {chapterIndex + 1} / {chapters.length} тарау
              </span>
            </button>
          )}
        </div>

        {/* Seek slider */}
        <div className="w-full max-w-xs mt-6">
          <label id={sliderLabelId} className="sr-only">
            Ойнату орны
          </label>
          <input
            type="range"
            min={0}
            max={duration || 1}
            step={0.5}
            value={position}
            onChange={handleSeek}
            aria-labelledby={sliderLabelId}
            aria-valuemin={0}
            aria-valuemax={Math.round(duration) || 1}
            aria-valuenow={Math.round(position)}
            aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
            className="w-full h-1.5 hover:h-2 transition-[height] duration-150 appearance-none rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-jaryq-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150 [&:hover::-webkit-slider-thumb]:scale-125 [&:active::-webkit-slider-thumb]:scale-125 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-jaryq-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white"
            style={{
              background: `linear-gradient(to right, var(--color-jaryq-primary) ${
                progress * 100
              }%, var(--color-jaryq-border-light) ${progress * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1" aria-hidden="true">
            <span className="text-xs text-jaryq-text-secondary font-mono tabular-nums">
              {formatTime(position)}
            </span>
            <span className="text-xs text-jaryq-text-secondary font-mono tabular-nums">
              -{formatTime(Math.max(0, duration - position))}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => seekRelative(-30)}
            aria-label="30 секундқа артқа"
            className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
          >
            <RotateCcw size={22} aria-hidden="true" strokeWidth={2.25} />
            <span
              aria-hidden="true"
              className="text-[9px] font-bold leading-none -mt-0.5"
            >
              30
            </span>
          </button>
          <button
            onClick={skipPrev}
            aria-label="Алдыңғы тарау"
            className="w-12 h-12 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
          >
            <SkipBack size={26} aria-hidden="true" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
            aria-pressed={isPlaying}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-jaryq-primary text-white shadow-lg hover:bg-jaryq-primary-dark hover:scale-[1.04] hover:shadow-[0_10px_30px_-10px_rgba(249,115,22,0.55)] active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
          >
            <span className="relative w-7 h-7 inline-flex items-center justify-center">
              <Play
                size={28}
                aria-hidden="true"
                className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                  isPlaying ? "opacity-0 scale-50" : "opacity-100 scale-100"
                }`}
              />
              <Pause
                size={28}
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
            className="w-12 h-12 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 disabled:opacity-30 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
          >
            <SkipForward size={26} aria-hidden="true" />
          </button>
          <button
            onClick={() => seekRelative(30)}
            aria-label="30 секундқа алға"
            className="w-12 h-12 flex flex-col items-center justify-center gap-0.5 rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main transition-all duration-150 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
          >
            <RotateCw size={22} aria-hidden="true" strokeWidth={2.25} />
            <span
              aria-hidden="true"
              className="text-[9px] font-bold leading-none -mt-0.5"
            >
              30
            </span>
          </button>
        </div>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
          className="mt-5 inline-flex items-center justify-center gap-1.5 bg-jaryq-primary-soft text-jaryq-primary text-sm font-bold px-6 py-2 rounded-full min-w-[150px] transition-all duration-150 active:scale-95 hover:bg-jaryq-primary-med/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
        >
          <Gauge size={14} aria-hidden="true" />
          <span aria-hidden="true" className="tabular-nums">
            {speed}x жылдамдық
          </span>
        </button>
      </div>

      {/* Chapter list drawer */}
      {showChapters && (
        <ChapterList
          chapters={chapters}
          currentIndex={chapterIndex}
          onSelectChapter={(index) => {
            onLoadChapter(index, 0);
            setShowChapters(false);
          }}
          onClose={() => setShowChapters(false)}
        />
      )}
    </div>
  );
});

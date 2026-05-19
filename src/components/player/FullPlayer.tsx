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
  const { currentBook, currentChapter, chapterIndex, isPlaying, position, duration, chapters } =
    usePlayerStore();
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
      className="fixed inset-0 z-50 bg-gradient-to-b from-[#FFF4ED] via-white to-white flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-safe pt-4 pb-2">
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Ойнатқышты жабу"
          className="w-11 h-11 flex items-center justify-center rounded-full text-[#5C5C5C] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        >
          <ChevronDown size={24} aria-hidden="true" />
        </button>
        <p
          id={titleId}
          className="text-sm font-semibold text-[#0F0F0F] text-center flex-1 px-4 truncate"
        >
          {currentChapter?.title || "Тыңдап жатырсыз"}
        </p>
        <button
          onClick={() => setShowChapters(true)}
          aria-label="Тараулар тізімі"
          aria-haspopup="dialog"
          className="w-11 h-11 flex items-center justify-center rounded-full text-[#5C5C5C] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        >
          <List size={20} aria-hidden="true" />
        </button>
      </div>

      {/* Ambient blur behind cover */}
      <div
        aria-hidden="true"
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#F97316]/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Cover */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-4 relative">
        <div className="w-56 h-72 rounded-2xl overflow-hidden shadow-xl mb-6">
          <CoverImage
            src={currentBook.cover_url}
            alt=""
            width={224}
            height={288}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Book info */}
        <div className="text-center w-full max-w-xs">
          <p className="text-[#5C5C5C] text-xs font-semibold uppercase tracking-wide mb-1">
            {currentBook.author}
          </p>
          <h2 className="text-xl font-black text-[#0F0F0F] leading-tight mb-1">
            {currentBook.title}
          </h2>
          {currentBook.narrator && (
            <p className="text-[#5C5C5C] text-sm italic">
              <span className="sr-only">Диктор: </span>
              {currentBook.narrator}
            </p>
          )}
          {chapters.length > 0 && (
            <div
              className="mt-2 inline-flex items-center gap-1 bg-[#FFF4ED] text-[#F97316] text-xs font-semibold px-3 py-1 rounded-full"
              aria-label={`${chapterIndex + 1}-тарау ${chapters.length} тараудан`}
            >
              <span aria-hidden="true">
                {chapterIndex + 1} / {chapters.length} тарау
              </span>
            </div>
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
            className="w-full h-1.5 appearance-none bg-[#E8E8E8] rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#F97316] [&::-webkit-slider-thumb]:rounded-full"
            style={{
              background: `linear-gradient(to right, #F97316 ${progress * 100}%, #E8E8E8 ${progress * 100}%)`,
            }}
          />
          <div className="flex justify-between mt-1" aria-hidden="true">
            <span className="text-xs text-[#5C5C5C] font-mono">{formatTime(position)}</span>
            <span className="text-xs text-[#5C5C5C] font-mono">
              -{formatTime(Math.max(0, duration - position))}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6">
          <button
            onClick={() => seekRelative(-30)}
            aria-label="30 секундқа артқа"
            className="w-12 h-12 flex items-center justify-center rounded-full text-[#3B3B3B] hover:bg-[#F5F5F5] relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <RotateCcw size={24} aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute text-[8px] font-bold text-[#3B3B3B]"
              style={{ bottom: "11px" }}
            >
              30
            </span>
          </button>
          <button
            onClick={skipPrev}
            aria-label="Алдыңғы тарау"
            className="w-12 h-12 flex items-center justify-center rounded-full text-[#3B3B3B] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <SkipBack size={26} aria-hidden="true" />
          </button>
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
            aria-pressed={isPlaying}
            className="w-16 h-16 flex items-center justify-center rounded-full bg-[#F97316] text-white shadow-lg hover:bg-[#EA580C] transition-colors active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
          >
            {isPlaying ? (
              <Pause size={28} aria-hidden="true" />
            ) : (
              <Play size={28} aria-hidden="true" />
            )}
          </button>
          <button
            onClick={skipNext}
            disabled={chapterIndex >= chapters.length - 1}
            aria-label="Келесі тарау"
            className="w-12 h-12 flex items-center justify-center rounded-full text-[#3B3B3B] hover:bg-[#F5F5F5] disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <SkipForward size={26} aria-hidden="true" />
          </button>
          <button
            onClick={() => seekRelative(30)}
            aria-label="30 секундқа алға"
            className="w-12 h-12 flex items-center justify-center rounded-full text-[#3B3B3B] hover:bg-[#F5F5F5] relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
          >
            <RotateCw size={24} aria-hidden="true" />
            <span
              aria-hidden="true"
              className="absolute text-[8px] font-bold text-[#3B3B3B]"
              style={{ bottom: "11px" }}
            >
              30
            </span>
          </button>
        </div>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
          className="mt-5 bg-[#FFF4ED] text-[#F97316] text-sm font-bold px-6 py-2 rounded-full hover:bg-[#FDBA74]/30 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        >
          <span aria-hidden="true">{speed}x жылдамдық</span>
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

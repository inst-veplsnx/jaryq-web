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
import { cn, formatTime } from "@/lib/utils";
import { CoverImage } from "@/components/books/CoverImage";
import { ChapterList } from "./ChapterList";

interface FullPlayerProps {
  isOpen: boolean;
  dialogId: string;
  onClose: () => void;
  onLoadChapter: (index: number, startPosition?: number) => void;
  togglePlay: () => void;
  skipPrev: () => void;
  skipNext: () => void;
  cycleSpeed: () => void;
}

export const FullPlayer = memo(function FullPlayer({
  isOpen,
  dialogId,
  onClose,
  onLoadChapter,
  togglePlay,
  skipPrev,
  skipNext,
  cycleSpeed,
}: FullPlayerProps) {
  const currentBook = usePlayerStore((s) => s.currentBook);
  const currentChapter = usePlayerStore((s) => s.currentChapter);
  const chapterIndex = usePlayerStore((s) => s.chapterIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const position = usePlayerStore((s) => s.position);
  const duration = usePlayerStore((s) => s.duration);
  const chapters = usePlayerStore((s) => s.chapters);
  const isLoading = usePlayerStore((s) => s.isLoading);
  const speed = useSettingsStore((s) => s.speed);
  const [showChapters, setShowChapters] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const sliderLabelId = useId();
  const chapterListId = useId();

  const progress = duration > 0 ? position / duration : 0;

  useEffect(() => {
    if (!isOpen) return;
    const selectors = [
      "main#main-content",
      'aside[aria-label="Бүйір мәзір"]',
      'nav[aria-label="Мобильді мәзір"]',
      'a[href="#main-content"]',
    ];
    const hiddenElements = selectors
      .map((selector) => document.querySelector<HTMLElement>(selector))
      .filter((element): element is HTMLElement => Boolean(element))
      .map((element) => ({
        element,
        previousValue: element.getAttribute("aria-hidden"),
      }));

    hiddenElements.forEach(({ element }) => {
      element.setAttribute("aria-hidden", "true");
    });

    return () => {
      hiddenElements.forEach(({ element, previousValue }) => {
        if (previousValue === null) {
          element.removeAttribute("aria-hidden");
        } else {
          element.setAttribute("aria-hidden", previousValue);
        }
      });
    };
  }, [isOpen]);

  // Focus management: save previous focus, focus close button on open, restore on close
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      closeBtnRef.current?.focus();
    } else {
      previousFocusRef.current?.focus?.();
    }
  }, [isOpen]);

  // Escape to close + simple focus trap inside the dialog
  useEffect(() => {
    if (!isOpen) return;
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
  }, [onClose, showChapters, isOpen]);

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPos = parseFloat(e.target.value);
    howlerService.seekTo(newPos);
    usePlayerStore.setState({ position: newPos });
  };

  const seekRelative = (delta: number) => {
    const newPos = Math.max(0, Math.min(duration, position + delta));
    howlerService.seekTo(newPos);
    usePlayerStore.setState({ position: newPos });
  };

  if (!currentBook) return null;
  const progressPercent = progress * 100;
  const remaining = Math.max(0, duration - position);
  const chapterLabel =
    chapters.length > 0 ? `${chapterIndex + 1} / ${chapters.length} тарау` : "Тарау";

  return (
    <div
      id={dialogId}
      ref={dialogRef}
      role="dialog"
      aria-modal={isOpen ? "true" : "false"}
      aria-hidden={!isOpen}
      aria-labelledby={titleId}
      className={cn(
        "fixed inset-0 z-50 flex flex-col overflow-hidden bg-jaryq-bg-main transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
        isOpen ? "translate-y-0" : "translate-y-full"
      )}
    >
      {/* Header — top padding uses max() so devices with a notch get more
          than 1rem; everyone else gets exactly 1rem. */}
      <div
        className="relative z-10 flex shrink-0 items-center justify-between border-b border-jaryq-border-warm/80 bg-white/75 px-4 pb-2 backdrop-blur-xl sm:px-6"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1rem)" }}
      >
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Ойнатқышты жабу"
          className="flex h-11 w-11 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,color,transform] duration-150 hover:bg-jaryq-primary-soft hover:text-jaryq-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
        >
          <ChevronDown size={24} aria-hidden="true" />
        </button>
        <p
          id={titleId}
          className="flex-1 truncate px-4 text-center text-sm font-semibold text-jaryq-text-primary"
        >
          {currentChapter?.title || "Тыңдап жатырсыз"}
        </p>
        <button
          onClick={() => setShowChapters(true)}
          aria-label="Тараулар тізімі"
          aria-haspopup="dialog"
          aria-expanded={showChapters}
          aria-controls={chapterListId}
          className="flex h-11 w-11 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,color,transform] duration-150 hover:bg-jaryq-primary-soft hover:text-jaryq-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
        >
          <List size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:px-6 lg:px-10">
        <div className="mx-auto grid min-h-full max-w-6xl content-center gap-6 py-5 lg:grid-cols-[minmax(0,1fr)_minmax(360px,430px)] lg:items-center lg:gap-10 lg:py-8">
          <section className="flex min-w-0 flex-col items-center text-center lg:items-start lg:text-left">
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-3 rounded-[2rem] border border-white/80 bg-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
              />
              <div
                className={cn(
                  "relative aspect-[3/4] w-56 overflow-hidden rounded-2xl ring-1 ring-black/5 sm:w-64 lg:w-72",
                  isPlaying &&
                    "animate-[jaryq-cover-breathe_4s_ease-in-out_infinite] motion-reduce:animate-none"
                )}
                style={{
                  boxShadow: "var(--shadow-jaryq-lg), var(--shadow-jaryq-glow)",
                }}
              >
                <CoverImage
                  src={currentBook.cover_url}
                  alt=""
                  width={288}
                  height={384}
                  className="h-full w-full object-cover"
                />
                {isLoading && (
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center bg-white/45 backdrop-blur-sm"
                  >
                    <Loader2
                      size={36}
                      className="animate-spin text-jaryq-primary motion-reduce:animate-none"
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 w-full max-w-md">
              <p className="mb-1 truncate text-xs font-semibold uppercase text-jaryq-text-secondary">
                {currentBook.author}
              </p>
              <h2 className="font-display text-2xl font-black leading-[1.1] tracking-tight text-jaryq-text-primary sm:text-3xl">
                {currentBook.title}
              </h2>
              {currentBook.narrator && (
                <p className="mt-2 text-sm italic text-jaryq-text-secondary">
                  <span className="sr-only">Диктор: </span>
                  {currentBook.narrator}
                </p>
              )}
            </div>
          </section>

          <section
            className="mx-auto w-full max-w-md rounded-2xl border border-jaryq-border-warm bg-white/85 p-4 backdrop-blur-xl sm:p-5 lg:max-w-none lg:p-6"
            style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase text-jaryq-primary">
                  {chapterLabel}
                </p>
                <h3 className="mt-1 truncate text-lg font-bold tracking-tight text-jaryq-text-primary sm:text-xl">
                  {currentChapter?.title || "Тыңдап жатырсыз"}
                </h3>
              </div>
              {chapters.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowChapters(true)}
                  aria-label={`${chapterIndex + 1}-тарау ${chapters.length} тараудан. Тараулар тізімін ашу.`}
                  aria-haspopup="dialog"
                  aria-expanded={showChapters}
                  aria-controls={chapterListId}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-jaryq-primary-soft text-jaryq-primary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-med/30 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
                >
                  <List size={18} aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="mt-6">
              <label id={sliderLabelId} className="sr-only">
                Ойнату орны
              </label>
              <input
                type="range"
                min={0}
                max={duration || 1}
                step={0.5}
                value={Math.min(position, duration || 1)}
                onChange={handleSeek}
                disabled={duration <= 0}
                aria-labelledby={sliderLabelId}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration) || 1}
                aria-valuenow={Math.round(position)}
                aria-valuetext={`${formatTime(position)} / ${formatTime(duration)}`}
                className="jaryq-player-range w-full"
                style={
                  {
                    "--jaryq-range-progress": `${progressPercent}%`,
                  } as React.CSSProperties
                }
              />
              <div className="mt-1 flex justify-between" aria-hidden="true">
                <span className="font-mono text-xs tabular-nums text-jaryq-text-secondary">
                  {formatTime(position)}
                </span>
                <span className="font-mono text-xs tabular-nums text-jaryq-text-secondary">
                  -{formatTime(remaining)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-center gap-1.5 sm:gap-3">
              <button
                onClick={() => seekRelative(-30)}
                aria-label="30 секундқа артқа"
                className="flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-full text-jaryq-text-secondary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
              >
                <RotateCcw size={22} aria-hidden="true" strokeWidth={2.25} />
                <span aria-hidden="true" className="-mt-0.5 text-[9px] font-bold leading-none">
                  30
                </span>
              </button>
              <button
                onClick={skipPrev}
                aria-label="Алдыңғы тарау"
                className="flex h-12 w-12 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
              >
                <SkipBack size={26} aria-hidden="true" />
              </button>
              <button
                onClick={togglePlay}
                aria-label={isPlaying ? "Тоқтату" : "Ойнату"}
                aria-pressed={isPlaying}
                className="flex h-16 w-16 items-center justify-center rounded-full text-white jaryq-gradient-cta transition-transform duration-(--duration-jaryq-base) ease-jaryq-spring hover:scale-[1.05] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 motion-reduce:transition-none motion-reduce:hover:scale-100"
                style={{ boxShadow: "var(--shadow-jaryq-glow)" }}
              >
                <span className="relative inline-flex h-7 w-7 items-center justify-center">
                  <Play
                    size={28}
                    aria-hidden="true"
                    className={`absolute transition-all duration-200 motion-reduce:transition-none ${
                      isPlaying ? "scale-50 opacity-0" : "scale-100 opacity-100"
                    }`}
                  />
                  <Pause
                    size={28}
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
                className="flex h-12 w-12 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-soft active:scale-95 disabled:opacity-30 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
              >
                <SkipForward size={26} aria-hidden="true" />
              </button>
              <button
                onClick={() => seekRelative(30)}
                aria-label="30 секундқа алға"
                className="flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-full text-jaryq-text-secondary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-soft active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
              >
                <RotateCw size={22} aria-hidden="true" strokeWidth={2.25} />
                <span aria-hidden="true" className="-mt-0.5 text-[9px] font-bold leading-none">
                  30
                </span>
              </button>
            </div>

            <button
              onClick={cycleSpeed}
              aria-label={`Ойнату жылдамдығы: ${speed} есе. Өзгерту үшін басыңыз.`}
              className="mt-6 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl border border-jaryq-primary/20 bg-jaryq-primary-soft px-4 py-2.5 text-sm font-bold text-jaryq-primary transition-[background-color,transform] duration-150 hover:bg-jaryq-primary-med/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
            >
              <Gauge size={15} aria-hidden="true" />
              <span aria-hidden="true" className="tabular-nums">
                {speed}x жылдамдық
              </span>
            </button>
          </section>
        </div>
      </div>

      {/* Chapter list drawer */}
      {showChapters && (
        <ChapterList
          dialogId={chapterListId}
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

"use client";

import { useEffect, useId, useRef, useCallback } from "react";
import { X, PlayCircle } from "lucide-react";
import { Chapter } from "@/types";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChapterListProps {
  chapters: Chapter[];
  currentIndex: number;
  onSelectChapter: (index: number) => void;
  onClose: () => void;
}

export function ChapterList({
  chapters,
  currentIndex,
  onSelectChapter,
  onClose,
}: ChapterListProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  const titleId = useId();

  // Keep the ref current so the keyboard handler always calls the latest version
  // without needing to be re-registered on every render.
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onCloseRef.current();
      return;
    }
    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
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
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-60 flex flex-col bg-jaryq-bg-card"
    >
      <div
        className="flex items-center justify-between px-4 py-4 border-b border-jaryq-border-light"
        style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
      >
        <h2
          id={titleId}
          className="font-display text-lg lg:text-xl font-bold text-jaryq-text-primary tracking-tight"
        >
          Тараулар
        </h2>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Тараулар тізімін жабу"
          className="w-11 h-11 flex items-center justify-center rounded-full text-jaryq-text-secondary hover:bg-jaryq-bg-main hover:text-jaryq-text-primary active:scale-95 transition-[background-color,color,transform] duration-(--duration-jaryq-fast) ease-jaryq-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-jaryq-border-light">
        {chapters.map((chapter, index) => {
          const active = index === currentIndex;
          return (
            <li key={chapter.id}>
              <button
                onClick={() => onSelectChapter(index)}
                aria-pressed={active}
                aria-label={`${index + 1}-тарау, ${chapter.title}, ұзақтығы ${formatDuration(chapter.duration)}${active ? ", қазір ойналуда" : ""}`}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-(--duration-jaryq-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jaryq-primary",
                  active
                    ? "bg-jaryq-primary-soft"
                    : "hover:bg-jaryq-bg-main"
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 tabular-nums transition-colors duration-(--duration-jaryq-fast)",
                    active
                      ? "text-white"
                      : "bg-jaryq-bg-main text-jaryq-text-secondary"
                  )}
                  style={
                    active
                      ? {
                          backgroundImage:
                            "linear-gradient(90deg, var(--color-jaryq-primary) 0%, var(--color-jaryq-primary-dark) 100%)",
                          boxShadow: "var(--shadow-jaryq-glow-sm)",
                        }
                      : undefined
                  }
                >
                  {active ? <PlayCircle size={18} /> : index + 1}
                </div>
                <div className="flex-1 min-w-0" aria-hidden="true">
                  <p
                    className={cn(
                      "font-medium text-sm truncate",
                      active
                        ? "text-jaryq-primary font-semibold"
                        : "text-jaryq-text-primary"
                    )}
                  >
                    {chapter.title}
                  </p>
                  <p className="text-xs text-jaryq-text-secondary tabular-nums">
                    {formatDuration(chapter.duration)}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

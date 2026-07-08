"use client";

import { useEffect, useId, useRef, useCallback } from "react";
import { X, PlayCircle } from "lucide-react";
import { Chapter } from "@/types";
import { formatDuration } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ChapterListProps {
  dialogId: string;
  chapters: Chapter[];
  currentIndex: number;
  onSelectChapter: (index: number) => void;
  onClose: () => void;
}

export function ChapterList({
  dialogId,
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
      id={dialogId}
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-[60] flex items-end bg-jaryq-text-primary/10 backdrop-blur-sm lg:items-stretch lg:justify-end"
    >
      <div
        className="flex max-h-[86dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-jaryq-border-warm bg-white/95 backdrop-blur-xl lg:h-full lg:max-h-none lg:w-[28rem] lg:rounded-l-2xl lg:rounded-tr-none"
        style={{ boxShadow: "var(--shadow-jaryq-lg)" }}
      >
        <div
          className="flex items-center justify-between border-b border-jaryq-border-warm bg-jaryq-bg-cream/80 px-4 py-4"
          style={{ boxShadow: "var(--shadow-jaryq-xs)" }}
        >
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-lg font-bold tracking-tight text-jaryq-text-primary lg:text-xl"
            >
              Тараулар
            </h2>
            <p className="text-xs font-medium text-jaryq-text-secondary">
              {chapters.length} тарау
            </p>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Тараулар тізімін жабу"
            className="flex h-11 w-11 items-center justify-center rounded-full text-jaryq-text-secondary transition-[background-color,color,transform] duration-(--duration-jaryq-fast) ease-jaryq-out hover:bg-white hover:text-jaryq-text-primary active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <ul className="flex-1 space-y-2 overflow-y-auto p-3">
          {chapters.map((chapter, index) => {
            const active = index === currentIndex;
            return (
              <li key={chapter.id}>
                <button
                  onClick={() => onSelectChapter(index)}
                  aria-pressed={active}
                  aria-label={`${index + 1}-тарау, ${chapter.title}, ұзақтығы ${formatDuration(chapter.duration)}${active ? ", қазір ойналуда" : ""}`}
                  className={cn(
                    "flex min-h-16 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-[background-color,border-color,transform] duration-(--duration-jaryq-fast) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-jaryq-primary motion-reduce:transition-none",
                    active
                      ? "border-jaryq-primary/30 bg-jaryq-primary-soft"
                      : "border-transparent bg-white hover:border-jaryq-border-warm hover:bg-jaryq-bg-cream"
                  )}
                >
                  <div
                    aria-hidden="true"
                    className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums transition-colors duration-(--duration-jaryq-fast)",
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
                  <div className="min-w-0 flex-1" aria-hidden="true">
                    <p
                      className={cn(
                        "truncate text-sm font-medium",
                        active
                          ? "font-semibold text-jaryq-primary"
                          : "text-jaryq-text-primary"
                      )}
                    >
                      {chapter.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-xs tabular-nums text-jaryq-text-secondary">
                        {formatDuration(chapter.duration)}
                      </p>
                      {active && (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-jaryq-primary">
                          Қазір ойналуда
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

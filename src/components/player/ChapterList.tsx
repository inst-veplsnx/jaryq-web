"use client";

import { useEffect, useId, useRef } from "react";
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
  const titleId = useId();

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();
    return () => {
      previousFocusRef.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
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
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-60 flex flex-col bg-white"
    >
      <div className="flex items-center justify-between px-4 py-4 border-b border-[#E8E8E8]">
        <h2 id={titleId} className="text-lg font-bold text-[#0F0F0F]">
          Тараулар
        </h2>
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Тараулар тізімін жабу"
          className="w-11 h-11 flex items-center justify-center rounded-full text-[#5C5C5C] hover:bg-[#F5F5F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>
      <ul className="flex-1 overflow-y-auto divide-y divide-[#E8E8E8]">
        {chapters.map((chapter, index) => {
          const active = index === currentIndex;
          return (
            <li key={chapter.id}>
              <button
                onClick={() => onSelectChapter(index)}
                aria-current={active ? "true" : undefined}
                aria-label={`${index + 1}-тарау, ${chapter.title}, ұзақтығы ${formatDuration(chapter.duration)}${active ? ", қазір ойналуда" : ""}`}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#F97316]",
                  active && "bg-[#FFF4ED]"
                )}
              >
                <div
                  aria-hidden="true"
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    active
                      ? "bg-[#F97316] text-white"
                      : "bg-[#F5F5F5] text-[#5C5C5C]"
                  )}
                >
                  {active ? <PlayCircle size={18} /> : index + 1}
                </div>
                <div className="flex-1 min-w-0" aria-hidden="true">
                  <p
                    className={cn(
                      "font-medium text-sm truncate",
                      active ? "text-[#F97316]" : "text-[#0F0F0F]"
                    )}
                  >
                    {chapter.title}
                  </p>
                  <p className="text-xs text-[#5C5C5C]">
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

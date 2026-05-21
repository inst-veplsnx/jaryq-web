"use client";

import Link from "next/link";
import { Play, Loader2 } from "lucide-react";
import { Book, UserProgress } from "@/types";
import { CoverImage } from "@/components/books/CoverImage";
import { formatTime } from "@/lib/utils";

interface ContinueListeningCardProps {
  progress: UserProgress & { book: Book };
  isLoading: boolean;
  onResume: () => void;
}

export function ContinueListeningCard({
  progress,
  isLoading,
  onResume,
}: ContinueListeningCardProps) {
  const totalDuration = progress.book.total_duration ?? 0;
  const percent = totalDuration
    ? Math.min(100, (progress.position / totalDuration) * 100)
    : 0;
  const roundedPercent = Math.round(percent);

  return (
    <div
      className="group jaryq-card flex items-center gap-5 p-5 max-w-2xl border-jaryq-primary/20 hover:border-jaryq-primary/40"
      style={{ boxShadow: "var(--shadow-jaryq-sm)" }}
    >
      <Link
        href={`/books/${progress.book.id}`}
        aria-label={`${progress.book.title} кітабына өту`}
        tabIndex={-1}
        className="flex-shrink-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary"
      >
        <span
          className="block rounded-xl overflow-hidden ring-1 ring-black/5 transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
        >
          <CoverImage
            src={progress.book.cover_url}
            alt=""
            width={80}
            height={108}
            className="rounded-xl block"
          />
        </span>
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/books/${progress.book.id}`}
          className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary rounded"
        >
          <p className="font-bold tracking-tight text-jaryq-text-primary text-base truncate hover:text-jaryq-primary transition-colors duration-150 motion-reduce:transition-none">
            {progress.book.title}
          </p>
        </Link>
        <p className="text-sm text-jaryq-text-secondary truncate mt-1 tabular-nums">
          {progress.chapter_number}-тарау
          {progress.position
            ? ` • ${formatTime(progress.position)} өткен`
            : ""}
        </p>
        <div
          role="progressbar"
          aria-label="Тыңдау прогресі"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={roundedPercent}
          className="mt-3 h-1.5 bg-jaryq-border-light rounded-full overflow-hidden"
        >
          <div
            className="h-full jaryq-gradient-cta rounded-full transition-[width] duration-300 motion-reduce:transition-none"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <button
        onClick={onResume}
        disabled={isLoading}
        aria-busy={isLoading || undefined}
        aria-label={`${progress.book.title} кітабын жалғастыру`}
        className="w-12 h-12 flex items-center justify-center rounded-full jaryq-gradient-cta text-white hover:scale-[1.06] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-transform duration-[var(--duration-jaryq-base)] ease-[var(--ease-jaryq-spring)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2 flex-shrink-0 motion-reduce:transition-none motion-reduce:hover:scale-100"
        style={{ boxShadow: "var(--shadow-jaryq-glow-sm)" }}
      >
        {isLoading ? (
          <Loader2
            size={20}
            className="animate-spin motion-reduce:animate-none"
            aria-hidden="true"
          />
        ) : (
          <Play size={20} className="fill-white" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

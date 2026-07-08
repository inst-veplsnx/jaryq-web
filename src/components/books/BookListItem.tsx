"use client";

import { memo } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CoverImage } from "./CoverImage";
import { Book } from "@/types";
import { formatDuration } from "@/lib/utils";

interface BookListItemProps {
  book: Book;
  progress?: number;
  subtitle?: string;
}

export const BookListItem = memo(function BookListItem({ book, progress, subtitle }: BookListItemProps) {
  const progressPct =
    progress !== undefined && progress > 0 ? Math.min(100, Math.round(progress)) : null;
  const ariaLabel = [
    book.title,
    book.author,
    book.narrator ? `диктор ${book.narrator}` : null,
    subtitle,
    book.total_duration ? `ұзақтығы ${formatDuration(book.total_duration)}` : null,
    progressPct !== null ? `прогресс ${progressPct} пайыз` : null,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/books/${book.id}`}
      aria-label={ariaLabel}
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary focus-visible:ring-offset-2"
    >
      <div className="jaryq-card jaryq-card-hover flex items-center gap-3 p-3 active:scale-[0.99] motion-reduce:hover:translate-y-0">
        <span className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-black/5" style={{ boxShadow: "var(--shadow-jaryq-xs)" }}>
          <CoverImage
            src={book.cover_url}
            alt=""
            width={60}
            height={80}
            className="rounded-lg block transition-transform duration-300 group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        </span>
        <div className="flex-1 min-w-0" aria-hidden="true">
          <p className="text-xs font-semibold text-jaryq-primary uppercase tracking-wide truncate">
            {book.author}
          </p>
          <h3 className="font-bold tracking-tight text-jaryq-text-primary text-sm leading-snug line-clamp-2 mt-0.5">
            {book.title}
          </h3>
          {book.narrator && (
            <p className="text-jaryq-text-secondary text-xs italic truncate mt-0.5">
              {book.narrator}
            </p>
          )}
          {subtitle && (
            <p className="text-jaryq-text-secondary text-xs truncate mt-0.5">{subtitle}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {book.total_duration && (
              <span className="text-jaryq-text-secondary text-xs tabular-nums">
                {formatDuration(book.total_duration)}
              </span>
            )}
            {book.language && (
              <span className="text-xs bg-jaryq-bg-main text-jaryq-text-secondary px-1.5 py-0.5 rounded uppercase font-semibold">
                {book.language}
              </span>
            )}
          </div>
          {progressPct !== null && (
            <div className="mt-2">
              <div
                role="progressbar"
                aria-label={`Прогресс ${progressPct}%`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progressPct}
                className="h-1 bg-jaryq-border-light rounded-full overflow-hidden"
              >
                <div
                  className="h-full jaryq-gradient-cta rounded-full transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="text-jaryq-text-muted group-hover:text-jaryq-primary group-hover:translate-x-0.5 flex-shrink-0 transition-all duration-150 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
        />
      </div>
    </Link>
  );
});

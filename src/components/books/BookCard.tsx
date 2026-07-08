"use client";

import { memo } from "react";
import Link from "next/link";
import { CoverImage } from "./CoverImage";
import { Book } from "@/types";
import { formatDuration } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface BookCardProps {
  book: Book;
  progress?: number;
}

export const BookCard = memo(function BookCard({ book, progress }: BookCardProps) {
  const progressPct =
    progress !== undefined && progress > 0 ? Math.min(100, Math.round(progress)) : null;
  const ariaLabel = [
    book.genre?.name,
    book.title,
    book.author,
    book.is_new ? "Жаңа" : book.is_popular ? "Танымал" : null,
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
      <div className="jaryq-card jaryq-card-hover overflow-hidden active:scale-[0.98] motion-reduce:hover:translate-y-0">
        <div className="relative aspect-[3/4] overflow-hidden bg-jaryq-primary-soft">
          <CoverImage
            src={book.cover_url}
            alt=""
            fill
            className="w-full h-full transition-transform duration-(--duration-jaryq-slow) ease-jaryq-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
          {/* Cover bottom fade for legibility of overlay chips */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-(--duration-jaryq-base) motion-reduce:transition-none"
          />
          {book.is_new && (
            <div className="absolute top-2 left-2" aria-hidden="true">
              <Badge variant="default" size="sm" className="border-0">
                Жаңа
              </Badge>
            </div>
          )}
          {book.is_popular && !book.is_new && (
            <div className="absolute top-2 left-2" aria-hidden="true">
              <Badge
                variant="default"
                size="sm"
                className="bg-jaryq-ink hover:bg-jaryq-ink border-0"
              >
                Танымал
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3" aria-hidden="true">
          {book.genre && (
            <p className="text-xs font-semibold text-jaryq-primary-strong uppercase tracking-wide mb-1 truncate">
              {book.genre.name}
            </p>
          )}
          <h3 className="font-bold tracking-tight text-jaryq-text-primary text-sm leading-tight line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-jaryq-text-secondary text-xs truncate">{book.author}</p>
          {book.total_duration && (
            <p className="text-jaryq-text-muted text-xs mt-1 tabular-nums">
              {formatDuration(book.total_duration)}
            </p>
          )}
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
      </div>
    </Link>
  );
});

"use client";

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

export function BookListItem({ book, progress, subtitle }: BookListItemProps) {
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
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
    >
      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-[#E8E8E8] hover:border-[#F97316]/30 hover:shadow-sm active:scale-[0.98] active:opacity-90 transition-all duration-200">
        <CoverImage
          src={book.cover_url}
          alt=""
          width={60}
          height={80}
          className="rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0" aria-hidden="true">
          <p className="text-xs font-semibold text-[#F97316] uppercase tracking-wide truncate">
            {book.author}
          </p>
          <h3 className="font-bold text-[#0F0F0F] text-sm leading-snug line-clamp-2 mt-0.5">
            {book.title}
          </h3>
          {book.narrator && (
            <p className="text-[#5C5C5C] text-xs italic truncate mt-0.5">
              {book.narrator}
            </p>
          )}
          {subtitle && (
            <p className="text-[#5C5C5C] text-xs truncate mt-0.5">{subtitle}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {book.total_duration && (
              <span className="text-[#5C5C5C] text-xs">
                {formatDuration(book.total_duration)}
              </span>
            )}
            {book.language && (
              <span className="text-xs bg-[#F5F5F5] text-[#5C5C5C] px-1.5 py-0.5 rounded uppercase">
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
                className="h-1 bg-[#E8E8E8] rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-[#F97316] rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <ChevronRight
          size={16}
          aria-hidden="true"
          className="text-[#888888] group-hover:text-[#F97316] flex-shrink-0 transition-colors"
        />
      </div>
    </Link>
  );
}

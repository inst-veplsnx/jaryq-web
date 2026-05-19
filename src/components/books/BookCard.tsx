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
      className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316] focus-visible:ring-offset-2"
    >
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#E8E8E8] hover:shadow-md hover:border-[#F97316]/30 active:scale-[0.98] active:shadow-sm transition-all duration-200">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#FFF4ED]">
          <CoverImage
            src={book.cover_url}
            alt=""
            fill
            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          {book.is_new && (
            <div className="absolute top-2 left-2" aria-hidden="true">
              <Badge className="bg-[#F97316] text-white text-xs px-2 py-0.5 rounded-full border-0">
                Жаңа
              </Badge>
            </div>
          )}
          {book.is_popular && !book.is_new && (
            <div className="absolute top-2 left-2" aria-hidden="true">
              <Badge className="bg-[#EF4444] text-white text-xs px-2 py-0.5 rounded-full border-0">
                Танымал
              </Badge>
            </div>
          )}
        </div>
        <div className="p-3" aria-hidden="true">
          {book.genre && (
            <p className="text-xs font-semibold text-[#F97316] uppercase tracking-wide mb-1 truncate">
              {book.genre.name}
            </p>
          )}
          <h3 className="font-bold text-[#0F0F0F] text-sm leading-tight line-clamp-2 mb-1">
            {book.title}
          </h3>
          <p className="text-[#5C5C5C] text-xs truncate">{book.author}</p>
          {book.total_duration && (
            <p className="text-[#5C5C5C] text-xs mt-1">
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
      </div>
    </Link>
  );
});

"use client";

import { useEffect, useState } from "react";
import { BookMarked } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { UserProgress } from "@/types";
import { BookListItem } from "@/components/books/BookListItem";
import { EmptyState } from "@/components/books/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/store/authStore";
import { formatTime } from "@/lib/utils";

export default function LibraryPage() {
  const { user } = useAuthStore();
  const [progressList, setProgressList] = useState<UserProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    bookService.getAllProgress(user.id).then((data) => {
      setProgressList(data);
      setLoading(false);
    });
  }, [user]);

  return (
    <div className="min-h-screen bg-jaryq-bg-main">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div role="status" aria-live="polite" className="sr-only">
          {loading
            ? "Кітап сөресі жүктелуде…"
            : progressList.length === 0
              ? "Кітап сөресі бос"
              : `${progressList.length} кітап жүктелді`}
        </div>

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-jaryq-text-primary">
              Кітап сөресі
            </h1>
            <p className="text-jaryq-text-secondary mt-1">Тыңдап жатқандарыңыз</p>
          </div>
          {!loading && progressList.length > 0 && (
            <p className="text-sm text-jaryq-text-muted shrink-0 tabular-nums">
              {progressList.length} кітап
            </p>
          )}
        </div>

        <div aria-busy={loading || undefined}>
          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : progressList.length === 0 ? (
            <EmptyState
              title="Кітап сөресі бос"
              description="Аудиокітапты тыңдай бастасаңыз, прогресс осында сақталады."
              icon={<BookMarked className="text-green-500" size={36} />}
            />
          ) : (
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {progressList.map((prog) =>
                prog.book ? (
                  <li key={prog.id}>
                    <BookListItem
                      book={prog.book}
                      subtitle={`${prog.chapter_number}-тарау • ${formatTime(prog.position)} өткен`}
                      progress={
                        prog.book.total_duration
                          ? (prog.position / prog.book.total_duration) * 100
                          : undefined
                      }
                    />
                  </li>
                ) : null
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

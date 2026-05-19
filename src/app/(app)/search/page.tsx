"use client";

import { useId, useRef, useState, useCallback } from "react";
import { Search, X } from "lucide-react";
import { bookService } from "@/lib/services/bookService";
import { Book } from "@/types";
import { BookListItem } from "@/components/books/BookListItem";
import { EmptyState } from "@/components/books/EmptyState";

const DEBOUNCE_MS = 400;

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef("");
  const searchInputId = useId();
  const statusId = useId();

  const statusMessage = loading
    ? "Іздеу жүріп жатыр…"
    : searched
      ? results.length === 0
        ? `"${query}" бойынша нәтиже табылмады`
        : `${results.length} нәтиже табылды`
      : "";

  const search = useCallback((q: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!q.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    currentQueryRef.current = q;
    timerRef.current = setTimeout(async () => {
      setLoading(true);
      const data = await bookService.searchBooks(q);
      if (currentQueryRef.current === q) {
        setResults(data);
        setSearched(true);
        setLoading(false);
      }
    }, DEBOUNCE_MS);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    search(val);
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSearched(false);
    currentQueryRef.current = "";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Search bar — sticky */}
      <div className="bg-white border-b border-[#E8E8E8] px-8 py-4 sticky top-0 z-10">
        <div className="max-w-2xl relative">
          <label htmlFor={searchInputId} className="sr-only">
            Кітап іздеу
          </label>
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#888888]"
          />
          <input
            id={searchInputId}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder="Кітап атауы, автор немесе диктор..."
            autoFocus
            aria-controls={statusId}
            aria-describedby={statusId}
            className="w-full pl-11 pr-12 py-3 bg-[#F5F5F5] border border-[#E8E8E8] rounded-xl text-[#0F0F0F] placeholder:text-[#888888] focus:outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/40 transition-all"
          />
          {query && (
            <button
              onClick={clearSearch}
              aria-label="Іздеуді тазалау"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-[#E8E8E8] text-[#5C5C5C] hover:bg-[#F97316] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F97316]"
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-8">
        <div id={statusId} role="status" aria-live="polite" className="sr-only">
          {statusMessage}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12" aria-hidden="true">
            <div className="w-8 h-8 border-2 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <EmptyState
            title="Нәтиже табылмады"
            description={`"${query}" бойынша кітап табылмады. Басқа сөздермен іздеп көріңіз.`}
            icon={<Search className="text-[#F97316]" size={36} />}
          />
        )}

        {!loading && !searched && (
          <div className="text-center py-20">
            <div
              aria-hidden="true"
              className="w-20 h-20 rounded-full bg-[#FFF4ED] flex items-center justify-center mx-auto mb-4"
            >
              <Search size={32} className="text-[#F97316]" />
            </div>
            <p className="text-[#0F0F0F] font-semibold text-lg mb-2">
              Іздеуді бастаңыз
            </p>
            <p className="text-[#5C5C5C] text-sm">
              Кітап атауын, автор немесе диктор атын енгізіңіз
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-[#888888] mb-4" aria-hidden="true">
              {results.length} нәтиже табылды
            </p>
            <ul className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {results.map((book) => (
                <li key={book.id}>
                  <BookListItem book={book} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

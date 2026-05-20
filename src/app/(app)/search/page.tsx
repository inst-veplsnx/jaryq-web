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
    <div className="min-h-screen bg-jaryq-bg-main">
      {/* Search bar — sticky */}
      <div className="bg-white/85 backdrop-blur-md border-b border-jaryq-border-light px-8 py-4 sticky top-0 z-10">
        <div className="max-w-2xl relative">
          <label htmlFor={searchInputId} className="sr-only">
            Кітап іздеу
          </label>
          <Search
            size={18}
            aria-hidden="true"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-jaryq-text-muted"
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
            className="w-full pl-11 pr-12 py-3 bg-jaryq-bg-main border border-jaryq-border-light rounded-xl text-jaryq-text-primary placeholder:text-jaryq-text-muted focus:outline-none focus:border-jaryq-primary focus:ring-2 focus:ring-jaryq-primary/40 transition-all duration-150 motion-reduce:transition-none"
          />
          {query && (
            <button
              onClick={clearSearch}
              aria-label="Іздеуді тазалау"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-jaryq-border-light text-jaryq-text-secondary hover:bg-jaryq-primary hover:text-white active:scale-90 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jaryq-primary motion-reduce:transition-none"
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
            <div className="w-8 h-8 border-2 border-jaryq-primary border-t-transparent rounded-full animate-spin motion-reduce:animate-none" />
          </div>
        )}

        {!loading && searched && results.length === 0 && (
          <EmptyState
            title="Нәтиже табылмады"
            description={`"${query}" бойынша кітап табылмады. Басқа сөздермен іздеп көріңіз.`}
            icon={<Search className="text-jaryq-primary" size={36} />}
          />
        )}

        {!loading && !searched && (
          <div className="text-center py-20">
            <div
              aria-hidden="true"
              className="relative w-20 h-20 rounded-full bg-gradient-to-br from-jaryq-primary-soft to-jaryq-primary-med/30 flex items-center justify-center mx-auto mb-4 shadow-sm ring-1 ring-jaryq-primary/10"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-jaryq-primary/10 blur-xl"
              />
              <Search size={32} className="relative text-jaryq-primary" />
            </div>
            <p className="text-jaryq-text-primary font-bold tracking-tight text-lg mb-2">
              Іздеуді бастаңыз
            </p>
            <p className="text-jaryq-text-secondary text-sm">
              Кітап атауын, автор немесе диктор атын енгізіңіз
            </p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-jaryq-text-muted mb-4 tabular-nums" aria-hidden="true">
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

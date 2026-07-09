# 0004 — Search

**Status:** Done
**Phase:** 1
**Platform:** Both
**Implements:** PRD §6, TRD §4, §6  ·  **Depends on:** 0003 (catalogue & book detail)
**Date:** 2026-07-09

---

## 1. Summary
A single search field that matches a listener's query against a book's **title, author, or narrator** and
lists the matching books, with distinct empty and no-results states. It is the fast path into the
catalogue when a listener already knows what they want (PRD §6). Results reuse the catalogue's data layer
(`bookService`, TRD §4) and book components (0003).

## 2. Goals / non-goals
- **Goals:** one input; case-insensitive match across title / author / narrator; a helpful empty prompt
  before searching and a distinct no-results state after; exactly one clear affordance; debounced,
  race-safe querying.
- **Non-goals:** filtering, sorting, facets, or genre scoping (genre listing is 0005); fuzzy/ranked
  relevance or full-text search; search history or suggestions.

## 3. User stories / behavior
Implements PRD §6 acceptance criteria. As a listener I type into a single field and see matching books;
typing a known **author** returns that author's books (title and narrator match the same way). Before I
type anything I see an **"Іздеуді бастаңыз"** prompt; when nothing matches I see a distinct
**"Нәтиже табылмады"** state naming my query — never a blank screen. Both states, and the result count,
are announced to a screen reader. A clear button empties the field and returns to the initial prompt.

## 4. Design
- **Screen** (`app/(app)/search/page.tsx`, client): controlled `type="search"` input; `handleChange`
  calls a `useCallback` `search(q)` that debounces `DEBOUNCE_MS = 400ms` and, on fire, calls
  `bookService.searchBooks(q)`. A `currentQueryRef` guards against out-of-order responses (a stale
  response is dropped unless its query still matches the latest). An empty/whitespace query short-circuits
  to the initial state without a network call.
- **State machine:** `!searched` → initial prompt `EmptyState`; `loading` → spinner; `searched &&
  results.length === 0` → no-results `EmptyState` (quotes the query); `results.length > 0` → a two-column
  grid of `BookListItem`. A visually hidden `role="status"` `aria-live="polite"` region mirrors the
  current state as `statusMessage`.
- **Query** (`bookService.searchBooks`): escapes `%` and `_`, then a single Supabase
  `.or("title.ilike.%q%,author.ilike.%q%,narrator.ilike.%q%")` capped at `limit(50)`, ordered by the
  server default; wrapped in try/catch → `logger.error`, returns `[]` on failure.
- **Single clear affordance:** the component renders its own "×" clear button (shown only when `query`
  is non-empty); the native WebKit control is suppressed in `globals.css`
  (`::-webkit-search-cancel-button` / `::-webkit-search-decoration { appearance: none }`) so there is
  never a double clear control (PRD §6).

## 5. Data & interface changes
- **Data model:** none — reads the public-read `books` table (TRD §6); `genre:genres(*)` is joined for
  the result item.
- **Interfaces:** `bookService.searchBooks(query)` (already present); no new functions, tables, or
  stores.

## 6. Accessibility
- **Labelled input:** the field has an `sr-only` `<label>` ("Кітап іздеу"); the page carries an
  `sr-only` `<h1>` ("Іздеу") because the field, not a visible title, is the primary UI — heading order
  stays intact (WCAG 2.2 AA).
- **Announced states:** the input is wired with `aria-controls` / `aria-describedby` to a hidden
  `role="status"` `aria-live="polite"` region; searching, "N нәтиже табылды", and
  "«q» бойынша нәтиже табылмады" are each announced, so the empty vs. no-results distinction is audible,
  not visual-only (PRD §6).
- **One control, labelled:** the single clear button has `aria-label="Іздеуді тазалау"`; its icon is
  `aria-hidden`. `EmptyState` renders `role="status"` with an `<h2>` under the page `<h1>`.
- **Motion & focus:** the spinner and transitions are `motion-reduce`-gated; the input and clear button
  show a visible focus ring.

## 7. Edge cases & failure handling
- **Empty / whitespace query:** returns to the initial prompt without querying.
- **Rapid typing:** debounce + `currentQueryRef` drop stale responses so results never flicker to an
  older query's set.
- **Special characters:** `%` and `_` are escaped before the `ilike` so they match literally.
- **Query failure / offline:** `searchBooks` returns `[]`; the UI shows the no-results state rather than
  an error crash.
- **Clearing mid-flight:** `clearSearch` resets query/results/`searched` and the ref; a late response
  whose query no longer matches is discarded.

## 8. Cost & performance
One indexed-scan `ilike` read per debounced keystroke, capped at 50 rows — negligible, within Supabase's
free tier (TRD §12). Debounce (400ms) plus the race-guard bound request volume; no new storage or
bandwidth. Results reuse existing components, so no added bundle weight beyond the page.

## 9. Test plan
- **Web a11y:** Playwright + axe-core over `/search` (TRD §9) — labelled input, live-region announcement,
  single clear button, correct heading order — zero violations.
- **Functional:** a known author returns their books; a known narrator/title likewise; a nonsense query
  shows the no-results state quoting the query; an empty field shows the initial prompt; the clear button
  resets; verify only one visible "×" in WebKit.
- **Mobile:** manual TalkBack pass on the equivalent search screen (parity).

## 10. Open questions
None. Behaviour matches shipped code as of 2026-07-09.

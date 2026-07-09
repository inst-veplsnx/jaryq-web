# 0003 — Catalogue & Book Detail

**Status:** Done
**Phase:** 1
**Platform:** Both
**Implements:** PRD §5, TRD §4, §6, §8  ·  **Depends on:** 0001 (foundations), 0002 (auth)
**Date:** 2026-07-09

---

## 1. Summary
The browse surface of JARYQ: the entry points (home shelves), the full catalogue, the curated
`is_new` / `is_popular` shelves, and the per-book detail page from which a listener plays. This is the
"find a book" half of the core loop (PRD §5); the "play it" half lives in the player spec (0006 web /
0018 mobile). All catalogue reads go through one `bookService` module (TRD §4).

## 2. Goals / non-goals
- **Goals:** render home entry points; list the whole catalogue with load-more; filter New / Popular
  shelves; show a book's full metadata + chapter list; play from saved position or chapter 1; favourite
  from detail; never show a broken cover.
- **Non-goals:** the player engine and progress-saving (0006/0018); favourites internals (0007);
  library/continue-listening data model (0008); search (0004); genre listing (0005); admin authoring (0014).

## 3. User stories / behavior
Implements PRD §5 acceptance criteria. A listener can: land on **Home** (`/home`) and see a greeting, a
**continue-listening** card when progress exists, and **Жаңа кітаптар** / **Танымал** shelves; open the
full catalogue (`/books`), **New arrivals** (`/new-arrivals`, `is_new`), or **Popular** (`/popular`,
`is_popular`); open a book (`/books/[id]`) to see cover, title, author, narrator, description, genre,
total duration, chapter count and the chapter list; press the primary action to **resume from the saved
chapter/position** or, when no progress, start at chapter 1; and toggle favourite. Each book card
announces title + author (+ genre, shelf, duration, progress) as one label.

## 4. Design
- **Home** (`app/(app)/home/page.tsx`, client): `getRecentProgress` → `ContinueListeningCard`;
  `getNewArrivals(10)` + `getPopular(10)` → horizontal `BookCard` rails under `SectionTitle`. It
  pre-fetches the resume book's chapters into a ref so `launchResume` → `playerStore.loadChapter` fires
  instantly at click time.
- **Catalogue** (`app/(app)/books/page.tsx`, client): `getAllBooks(offset, 24)` paged by `PAGE_SIZE=24`,
  ordered by author, with a "Көбірек жүктеу" load-more button; `EmptyState` when the catalogue is empty.
- **New / Popular** (`new-arrivals/page.tsx`, `popular/page.tsx`): thin wrappers over
  `getNewArrivals()` / `getPopular()` rendering the shared `BOOK_GRID`.
- **Detail** (`app/(app)/books/[id]/page.tsx`, **server component**): SSR via
  `createSupabaseServerClient` fetches book (`genre:genres(*)` join), chapters (ordered by
  `chapter_number`), and — if authed — favourite + progress in parallel; `notFound()` on a missing book;
  `generateMetadata` sets title/description/OG. Renders `BookDetail` (client) which owns the hero,
  progress bar, actions, and the `ChapterRow` list; resume index is derived from
  `progress.chapter_number`, and the play action routes through `playOrToggle` →
  `loadChapter(book, chapters, index, position)` (TRD §8).
- **Cards & covers:** `BookCard` links to `/books/[id]`; `CoverImage` renders a branded fallback when
  `cover_url` is null or the image errors.

## 5. Data & interface changes
- **Data model:** none new — reads `books`, `chapters`, `genres`, `favorites`, `user_progress` per the
  TRD §6 schema (`is_new` / `is_popular` flags drive the shelves).
- **Interfaces:** consumes existing `bookService` reads — `getNewArrivals`, `getPopular`, `getAllBooks`,
  `getBookById`, `getChapters`, `getRecentProgress`, `getProgress`, `isFavorite`; the detail page also
  reads directly via the SSR Supabase client. No new service functions.

## 6. Accessibility
- **Book card is one label (WCAG 2.2 AA):** `BookCard` composes `genre, title, author, shelf, duration,
  progress` into a single `aria-label` on the `<Link>`; the inner cover/title/badges are `aria-hidden`,
  so a screen reader announces exactly one meaningful string per card (PRD §5).
- **Shelf/status is not colour-alone:** the "Жаңа" / "Танымал" badge is decorative (`aria-hidden`); the
  same fact is carried in the card's `aria-label` text, so low-vision users don't rely on the badge tint.
- **Structure:** one `h1` per page (greeting / page title / book title); shelves use
  `section aria-labelledby`; card rails are `<ul>`/`<li>`; loading uses `role="status"` `aria-live`
  regions and `aria-busy`.
- **Detail controls:** play/resume and favourite buttons are labelled and expose state (`aria-pressed`,
  `aria-busy`); each `ChapterRow` announces number, title, duration, elapsed and current/playing state.
- **Motion:** hover/scale transitions are gated by `motion-reduce:*`. Focus rings are visible on every
  card and button. Fallback cover is a decorative icon (empty `alt`), never a broken image.

## 7. Edge cases & failure handling
- **Missing cover:** `CoverImage` shows the branded `BookOpen` gradient (never a broken-image icon).
- **Missing book:** detail page calls `notFound()` (404).
- **Query failure / offline:** every `bookService` read is wrapped in try/catch → `logger.error` and
  returns `[]` / `null`, so a failed fetch renders an empty/loading state, not a crash.
- **No progress:** primary action falls back to chapter 1; resume index `-1` is treated as `0`.
- **Empty shelves/catalogue:** distinct `EmptyState` per surface; empty shelves are simply not rendered
  on home.
- **Signed-out on detail:** `getBookUserData` returns `{isFavorite:false, progress:null}`; the favourite
  button is disabled when there is no user.

## 8. Cost & performance
Pure Supabase reads on public-read tables — no new infra, within free tiers (TRD §12). Shelves cap at 10
items, catalogue pages at 24. Home pre-fetches resume chapters so resume feels instant; detail
SSR-parallelises its three queries; covers are served from R2 via `next/image`.

## 9. Test plan
- **Web a11y:** the Playwright + axe-core suite (TRD §9) covers home, catalogue, and book detail against
  `NEXT_PUBLIC_A11Y_FIXTURES=1` — zero violations, single `h1`, card single-label assertions.
- **Functional:** New/Popular show only flagged books; load-more appends and stops on a short page; a
  book with progress opens the player at the saved chapter; a null-cover book shows the fallback; an
  unknown id 404s.
- **Mobile:** manual TalkBack pass on the equivalent catalogue/detail screens (parity with 0018).

## 10. Open questions
None. Behaviour matches shipped code as of 2026-07-09.

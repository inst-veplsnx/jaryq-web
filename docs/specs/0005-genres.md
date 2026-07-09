# 0005 — Genres

**Status:** Done
**Phase:** 1
**Platform:** Both
**Implements:** PRD §7, TRD §6  ·  **Depends on:** 0003 (catalogue & book detail)
**Date:** 2026-07-09

---

## 1. Summary
Browsing the catalogue by category: a **genres list** where each tile carries an icon and a restrained,
brand-tinted accent, and a **genre detail** page listing that genre's books. Genres are a third way into
the core loop alongside shelves (0003) and search (0004), per PRD §7. Reads go through `bookService`
against the public-read `genres` / `books` tables (TRD §6).

## 2. Goals / non-goals
- **Goals:** list every genre as a tappable tile with a warm, cycling accent; open a genre to a filtered
  book grid; show an empty state for a genre with no books; keep meaning carried by label + icon, not by
  colour alone.
- **Non-goals:** genre CRUD (admin, 0014); multi-genre / tag filtering; per-genre sort options; the
  book card and detail behaviour themselves (0003).

## 3. User stories / behavior
Implements PRD §7 acceptance criteria. As a listener I open **Жанрлар** (`/genres`) and see every genre
as a tile (icon + name, each with a subtle brand-tinted accent); selecting one opens `/genres/[id]` and
shows **only that genre's books**; a genre with no books shows a distinct empty state rather than a blank
grid. Genre tiles are distinguishable by their label and icon, so a low-vision user never has to rely on
the accent colour to tell them apart.

## 4. Design
- **Genres list** (`app/(app)/genres/page.tsx`, client): `bookService.getGenres()` (1-hour in-memory
  cache + in-flight de-dupe; never caches an empty result) → a responsive grid of `<Link>` tiles to
  `/genres/[id]`. Each tile's accent comes from `genreAccentAt(index)` (`lib/genreColors.ts`), which
  cycles the **6-variant** `GENRE_ACCENTS` palette by list index. A decorative blurred glow and the icon
  are `aria-hidden`; the visible label is the genre name in the accent's text colour.
- **Accent palette** (`lib/genreColors.ts`): six `{text, bg, border, glow}` variations ordered so the
  orange brand leads — primary orange, ink, then amber / rose / teal / indigo — all kept soft and
  restrained (PRD §7, TRD §15 theming). `genreAccentAt(i) = GENRE_ACCENTS[i % 6]`.
- **Genre detail** (`app/(app)/genres/[id]/page.tsx`, client): `Promise.all([getGenreById(id),
  getBooksByGenre(id)])` (books capped at 50, ordered by title) → a `BOOK_GRID` of `BookCard`; a
  `PageHeader` with the "Жанр" eyebrow + genre name; `EmptyState` ("Кітап жоқ") when the genre has no
  books. Loading uses skeletons and an `aria-live` status.

## 5. Data & interface changes
- **Data model:** none new — reads `genres` (`id`, `name`, `icon`) and `books.genre_id → genres` per
  TRD §6. The `genres.icon` column is part of the shared schema; the web tile currently renders a fixed
  `BookOpen` glyph plus the accent, while the label carries the genre identity.
- **Interfaces:** `bookService.getGenres`, `getGenreById`, `getBooksByGenre` (all present); no new
  functions or tables. The accent mapping is presentation-only in `lib/genreColors.ts`.

## 6. Accessibility
- **Meaning is not colour-alone (WCAG 2.2 AA):** the six accents are decorative — every tile is a
  `<Link>` with `aria-label="Жанр: {name}"` and a visible name label + icon, so genres are told apart by
  text and icon, never by tint (PRD §7). The glow/icon are `aria-hidden`.
- **Contrast:** each accent's text token is chosen to meet AA on its own soft background (e.g. `text-
  amber-700` on `bg-amber-50`), so the label stays ≥4.5:1 regardless of which variant an index lands on.
- **Structure & feedback:** one `h1` per page (via `PageHeader`); tiles and book results are
  `<ul>`/`<li>`; loading and counts are announced through `role="status"` `aria-live="polite"` regions;
  the genre-detail empty state uses `EmptyState` (`role="status"`, `<h2>`).
- **Motion & focus:** tile hover lift/rotate transitions are `motion-reduce`-gated; every tile shows a
  visible focus ring on keyboard focus.

## 7. Edge cases & failure handling
- **No books in genre:** distinct `EmptyState` ("Бұл жанрда кітаптар табылмады").
- **Unknown genre id:** `getGenreById` returns `null`; the header falls back to "Жанр" and the grid is
  empty — no crash.
- **Fetch failure / offline:** `getGenres` returns the last cached list (or `[]`); it deliberately does
  **not** cache an empty result, so a transient RLS/network blip doesn't pin an empty catalogue.
- **More than 6 genres:** the accent index simply wraps (`i % 6`), so colours repeat harmlessly — labels
  keep tiles distinct.
- **More than 50 books in a genre:** currently capped at 50 (no pagination on genre detail; noted below).

## 8. Cost & performance
Public-read reads only, within free tiers (TRD §12). The 1-hour genre cache + in-flight de-dupe collapse
repeat visits to zero extra queries; genre detail parallelises its two reads and caps books at 50. No new
storage or bandwidth; the accent palette is static CSS classes (no runtime cost).

## 9. Test plan
- **Web a11y:** Playwright + axe-core over `/genres` and `/genres/[id]` (TRD §9) — labelled tiles,
  AA contrast on each accent, single `h1`, announced counts — zero violations.
- **Functional:** the list renders one tile per genre; selecting a genre shows only that genre's books;
  an empty genre shows the empty state; accents cycle by index and repeat past six without breaking
  labels.
- **Mobile:** manual TalkBack pass on the equivalent genres screens (parity); note mobile uses the
  `genres.icon` field per tile.

## 10. Open questions
- Genre detail caps at 50 books with no load-more (unlike `/books`); revisit if any genre exceeds 50.
  Not blocking — no genre currently does.

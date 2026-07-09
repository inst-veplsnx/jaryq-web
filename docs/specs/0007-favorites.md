# 0007 — Favourites

**Status:** Done
**Phase:** 1
**Platform:** Both
**Implements:** PRD §9, TRD §6  ·  **Depends on:** 0002 (auth), 0003 (book detail)
**Date:** 2026-07-09

---

## 1. Summary
Let a signed-in listener mark books as favourites and find them again in one place. A toggle on the
book detail page adds/removes the book; a **Favourites** screen lists them. State is per-user, unique
per book, and owner-scoped at the database (PRD §9, TRD §6). Web and mobile share the schema and the
`bookService` contract; this spec documents the web implementation with mobile parity required.

## 2. Goals / non-goals
- **Goals:** toggle favourite from book detail; a `/favorites` list with a distinct empty state;
  per-user uniqueness enforced in Postgres; RLS so favourites are unreachable across accounts; the
  toggle announces its state to a screen reader.
- **Non-goals:** favouriting from arbitrary cards (only book detail today); collections/folders;
  sharing; recommendations (out of scope, PRD §18).

## 3. User stories / behavior
Realises PRD §9. On book detail, a heart control shows current state and flips it on tap: favouriting
is reflected immediately and a Kazakh toast confirms ("Таңдаулыларға қосылды" / "Таңдаулылардан
алынды"); it persists across sessions and devices. The `/favorites` page lists favourited books
newest-first; with none it shows a guidance empty state ("Кітап бетінде жүрек белгісін басып…").

## 4. Design
- **Toggle** lives in `BookDetail.tsx`: `isFavorite` local state (seeded from `initialFavorite` or
  `bookService.isFavorite`), `toggleFavorite()` calls `addFavorite`/`removeFavorite`, updates state
  optimistically-after-await and fires a `sonner` toast. The button is disabled while `favLoading` or
  when there is no user (guests are auth-gated anyway).
- **List page** `src/app/(app)/favorites/page.tsx`: on user load calls `bookService.getFavorites`,
  renders a `BookCard` grid, or `EmptyState` when empty, or a skeleton grid while loading.
- **Data access** funnels through `bookService` (TRD §4): `addFavorite` (insert), `removeFavorite`
  (delete by user+book), `isFavorite` (maybeSingle presence check), `getFavorites` (join
  `book:books(*, genre:genres(*))`, ordered `created_at desc`).

## 5. Data & interface changes
- **Data model:** `favorites` table (shared `supabase_schema.sql`, TRD §6) — `id`,
  `user_id→profiles`, `book_id→books`, `created_at`, **`UNIQUE(user_id, book_id)`**. RLS owner-scoped:
  `favorites_select/insert/delete` all `auth.uid() = user_id`; grants `SELECT, INSERT, DELETE` to
  `authenticated` (no UPDATE — favourite is a two-state insert/delete). Schema change applies to both
  repos.
- **Interfaces:** `bookService.addFavorite / removeFavorite / isFavorite / getFavorites` (TRD §13).
  No new API routes (client writes go straight through RLS-guarded Supabase).

## 6. Accessibility
- The toggle is a real `<button aria-pressed={isFavorite}>` with a Kazakh label that reflects the
  action ("Таңдаулыға" / "Алып тастау"); the icon is `aria-hidden`, so the state change is conveyed by
  the pressed state and the toast — never colour alone (PRD §9, §14). Focus-visible ring and
  `motion-reduce` on the hover animation.
- The `/favorites` page carries an sr-only `role="status" aria-live="polite"` region announcing
  loading, the loaded count, or the empty state, and sets `aria-busy` while loading. One `h1` via
  `PageHeader`; each card announces title + author as one meaningful label (0003).

## 7. Edge cases & failure handling
- **Duplicate favourite:** the `UNIQUE` constraint backstops double-inserts; the UI only offers insert
  when not favourited, so races surface as a thrown insert error (surfaced, not silently swallowed, in
  `addFavorite`/`removeFavorite`).
- **Not signed in:** toggle disabled; list page renders nothing until a user is present.
- **Fetch error:** `getFavorites`/`isFavorite` catch and return `[]`/`false` (logged) so the page
  degrades to an empty state rather than crashing.
- **Missing joined book:** rows whose `book` is null are skipped in the list render.

## 8. Cost & performance
Negligible: two-column-indexed table, one query per page load, one row per favourite. Stays well within
Supabase's free tier (TRD §12); no media or storage impact.

## 9. Test plan
Playwright + @axe-core over `/favorites` (loaded, empty, loading) against fixtures — no violations,
live-region announcements present. Functional: favourite a book → appears in `/favorites` and persists
across reload; unfavourite → removed; `aria-pressed` flips and the toast announces the new state.
Mobile: manual TalkBack check that the toggle role/state is spoken (parity, tracked with 0016).

## 10. Open questions
None. Favouriting from grid/list cards (beyond book detail) is a deliberate deferral, not a gap.

# 0008 — Library & Continue Listening

**Status:** Done
**Phase:** 1
**Platform:** Both
**Implements:** PRD §10, TRD §6, §8  ·  **Depends on:** 0006 (web player), 0003 (catalogue)
**Date:** 2026-07-09

---

## 1. Summary
The listener's in-progress and finished books live in one **Library**, and **Home** surfaces a
**Continue Listening** card for the single most-recent in-progress book that deep-links straight back
into the player at the saved place. Both read the `user_progress` row the player writes (0006); this is
the "never lose your place" loop (PRD §10, TRD §8). Documented for web; mobile parity required.

## 2. Goals / non-goals
- **Goals:** `/library` lists every book the user has progress on, most-recent first, each with a
  resume affordance and a progress indicator; a home card resumes the newest book at its exact
  position; progress is one upserted row per user+book keyed in seconds.
- **Non-goals:** manual shelves/collections; "finished" vs "in-progress" filtering; writing progress
  (owned by the player, 0006); cross-device sync semantics beyond the shared row.

## 3. User stories / behavior
Realises PRD §10. Starting a book adds it to the library; the library shows each book with its current
chapter and elapsed time ("N-тарау • mm:ss өткен") and a progress bar. Home shows one Continue
Listening card for the most recent book; its resume button loads that book's chapters and starts
playback at the saved chapter + position, and the cover/title link into book detail.

## 4. Design
- **Library** `src/app/(app)/library/page.tsx`: on user load calls `bookService.getAllProgress`,
  renders a `BookListItem` per row (subtitle = chapter + elapsed, `progress` = `position /
  total_duration * 100`), or `EmptyState`, or skeletons while loading.
- **Continue Listening** `ContinueListeningCard.tsx` on home: home fetches
  `bookService.getRecentProgress`; the card shows cover, title, `N-тарау`, elapsed, and a
  `role="progressbar"` bar. Its `onResume` handler (`launchResume` in home) fetches chapters, finds the
  saved chapter index, and calls `usePlayerStore.loadChapter(book, chapters, idx,
  recentProgress.position)` — deep-linking into the player (0006) at the saved place; `isLoading`
  reflects `usePlayerStore.isLoading`.
- **Data access** funnels through `bookService`: `getAllProgress` (join `book:books(*, genre:
  genres(*))`, order `updated_at desc`, limit 200) and `getRecentProgress` (same join, limit 1,
  `maybeSingle`). The player's `saveProgress` upsert is the write side.

## 5. Data & interface changes
- **Data model:** `user_progress` (shared `supabase_schema.sql`, TRD §6) — `id`, `user_id→profiles`,
  `book_id→books`, `chapter_id→chapters`, `chapter_number`, `position` (**seconds**), `updated_at`,
  **`UNIQUE(user_id, book_id)`** (one row per user+book, upserted `onConflict: user_id,book_id`). RLS
  owner-scoped: `progress_select/insert/update/delete` all `auth.uid() = user_id`. Schema change
  applies to both repos. No new tables.
- **Interfaces:** `bookService.getAllProgress`, `getRecentProgress` (read); `saveProgress` (write,
  0006); `usePlayerStore.loadChapter` for the deep-link (TRD §13).

## 6. Accessibility
- Both pages expose an sr-only `role="status" aria-live="polite"` region announcing loading, the
  loaded count, or the empty state, and set `aria-busy` while loading; one `h1` via `PageHeader`.
- The Continue Listening progress bar is a real `role="progressbar"` with `aria-label` +
  `aria-valuemin/max/now`; the cover link is `tabIndex=-1` (title link carries the accessible name to
  avoid a duplicate stop), and the resume button has a descriptive Kazakh label
  ("…кітабын жалғастыру") with `aria-busy` while loading and a focus-visible ring. All hover/scale
  motion is `motion-reduce`-gated. Library rows carry title + author as one label (0003).

## 7. Edge cases & failure handling
- **No progress yet:** both surfaces show empty states (library) / the card is not rendered (home).
- **Saved chapter missing/removed:** the index lookup falls back so resume still starts the book;
  `position` clamps within the loaded chapter's duration by the player (0006).
- **Fetch error:** `getAllProgress` returns `[]` and `getRecentProgress` returns `null` (logged) →
  graceful empty/absent, never a crash.
- **Missing joined book:** rows with a null `book` are skipped. Resume disabled while the player is
  loading to prevent double-launch.

## 8. Cost & performance
Negligible: one indexed query per surface, capped (limit 200 / limit 1). One `user_progress` row per
user+book keeps the table small and within Supabase's free tier (TRD §12). No media/storage impact;
the resume path reuses the player's existing R2 stream.

## 9. Test plan
Playwright + @axe-core over `/library` and the home continue card (loaded, empty, loading) against
fixtures — no violations; progressbar exposes its value; live regions announce. Functional: play a
book → it appears in `/library` with correct chapter/elapsed; most-recent book surfaces on home; the
resume button starts playback at the saved chapter + position (within ~2s). Mobile: manual TalkBack
parity check (tracked with 0016).

## 10. Open questions
None. Filtering finished vs. in-progress and manual shelves are deliberate deferrals (PRD §18), not
gaps in this spec.

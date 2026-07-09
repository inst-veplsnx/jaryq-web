# 0006 — Web Audio Player

**Status:** Done
**Phase:** 1
**Platform:** Web
**Implements:** PRD §8, TRD §8, §9  ·  **Depends on:** 0003 (catalogue/book detail)
**Date:** 2026-07-09

---

## 1. Summary
The web listening surface: a persistent bottom **PlayerBar** that survives navigation (mounted by
`AppShell`), a full-screen **FullPlayer** sheet, and a **ChapterList** drawer. It wraps a single
Howler.js instance (`howlerService`) and drives all playback state through `usePlayerStore`. This is
JARYQ's centre of gravity and its hardest a11y surface (PRD §8); the shared playback contract lives in
TRD §8 and the a11y architecture in TRD §9.

## 2. Goals / non-goals
- **Goals:** play/pause, scrub, ±30s, prev/next chapter, speed 0.75×–2.0×, auto-advance, auto-save and
  resume — all keyboard- and screen-reader-operable; browser-only audio that never runs in SSR.
- **Non-goals:** offline downloads and background audio (mobile only, 0017/0018); the mobile player
  (0018); catalogue/detail (0003); default-speed persistence lives in settings (0009).

## 3. User stories / behavior
Realises PRD §8. Once a book is launched (from BookDetail or a resume affordance) the mini-bar is
always present; expanding it opens the full sheet with scrubber, chapter controls, ±30s and speed.
When a chapter ends playback **auto-advances** to the next and **stops after the last** (no loop).
Reopening a book **resumes** from the saved chapter + position. Speed changes apply immediately.

## 4. Design
- **`PlayerBar.tsx`** owns the audio lifecycle. It defines `loadChapter(index, startPosition)` and
  registers it on the store via `registerLoadChapter` so `BookDetail`/home can trigger playback. A
  250ms (`4fps`) tick copies `howlerService.getPosition()/getDuration()` into the store (gated on
  `isPlaying`); the visual bar stays 60fps-smooth via CSS transition. It lazy-loads `FullPlayer`
  through `next/dynamic({ ssr: false })`. `SPEED_STEPS = [0.75,1,1.25,1.5,1.75,2]`, cycled by
  `cycleSpeed`; `KEY_SEEK_DELTA = 5` for arrow-key seek.
- **`FullPlayer.tsx`** — `role="dialog" aria-modal`, `inert` while closed, slides in at `z-[60]`.
  Adds ±30s (`seekRelative`), prev/next, a labelled scrubber, speed button, and opens `ChapterList`.
- **`ChapterList.tsx`** — modal drawer; each row is an `aria-pressed` button labelled with number,
  title, duration and current-playing state; selecting calls `onLoadChapter(index, 0)`.
- **`howlerService.ts`** — singleton `Howl` (`html5:true`, `format:["m4a","mp3","aac"]`) exposing
  load/play/pause/seekTo/setSpeed/getPosition/getDuration/isPlaying/unload. Guards SSR
  (`typeof window === "undefined"` → return) and arms a **15s load timeout** that fires `onError`
  against silent CORS/stall failures.
- **`playerStore.ts`** — Zustand: `currentBook/currentChapter/chapterIndex/isPlaying/position/
  duration/chapters/isLoading/error/_pendingLoad`; `loadChapter`, `togglePlay`, `reset`, and the
  `registerLoadChapter` seam (queues `_pendingLoad` when the bar hasn't mounted yet).
- **Auto-save:** an effect keyed on `[autoSave, user.id, book.id, chapter.id]` writes progress on a
  30s interval (`AUTOSAVE_INTERVAL_MS`), on `pagehide` (tab close / backgrounding), and on cleanup
  (chapter change, book change, player close), all via `bookService.saveProgress` (upsert to
  `user_progress`, 0008). **Auto-advance:** the Howler `onend`/`onLoad` chain in `loadChapter` loads
  `index+1` or sets `isPlaying:false` past the last chapter.

## 5. Data & interface changes
- **Data model:** none new. Reads `chapters` (0003); writes `user_progress` (upsert
  `onConflict: user_id,book_id`, `position` in seconds) — table owned by 0008/TRD §6.
- **Interfaces:** `howlerService` (playback seam, TRD §13); `usePlayerStore` (`loadChapter`,
  `togglePlay`, `registerLoadChapter`, `reset`); `bookService.saveProgress`. Speed default read from
  `settingsStore` (0009).

## 6. Accessibility
- The mini-bar is one landmark: `<section aria-label="Аудио ойнатқыш">`, set `aria-hidden`+`inert`
  while the full sheet is open. A `role="status" aria-live="polite"` sr-only region announces the
  current chapter and play/pause state, so a **chapter change is spoken** (PRD §8).
- Both scrubbers are the `.jaryq-player-range` `<input type="range">` — a labelled **adjustable**
  control ("Тарау прогресі" / "Ойнату орны") with `aria-valuemin/max/now` and a human `aria-valuetext`
  (`mm:ss / mm:ss`); operable by ArrowLeft/Right (±5s) and Home/End, with a visible focus-visible ring.
- Every control has a Kazakh `aria-label`; play uses `aria-pressed`; expand uses `aria-haspopup=
  "dialog"`+`aria-controls`. Primary targets are ≥44px (`h-11 w-11`). Opening `FullPlayer` sets
  `aria-hidden` on `main#main-content`, the sidebar, the mobile nav and the skip link, traps Tab,
  closes on Escape, and saves/restores focus. All motion is gated by `motion-reduce:*`.

## 7. Edge cases & failure handling
- **Load failure / CORS / stall:** 15s timeout → `error` state → red `role="alert" aria-live=
  "assertive"` banner ("Аудио жүктелмеді…"); playback stops cleanly.
- **Last chapter:** stops (`isPlaying:false`), never loops. **Prev at chapter 1:** seeks to 0.
- **Bar not yet mounted:** `_pendingLoad` queued and flushed on `registerLoadChapter`.
- **Progress:** idempotent upsert (one row per user+book); missing cover → `CoverImage` fallback
  (0003). Position clamped to `[0, duration]`; disabled scrubber when `duration <= 0`.

## 8. Cost & performance
Zero infra cost: audio streams direct from Cloudflare R2, no app-server transit. Store ticks at 4fps
(not 60fps) to avoid render storms; the 30s save cadence keeps `user_progress` writes minimal.
`FullPlayer` is code-split (`next/dynamic`) so it is off the first-paint bundle. Audio start is bounded
by the 15s timeout (TRD §12).

## 9. Test plan
Playwright + @axe-core against fixture data (`NEXT_PUBLIC_A11Y_FIXTURES=1`) over the player bar and
chapter dialog: no axe violations, scrubber exposes adjustable role + value, focus trap and restore
work, chapter-change is announced. Functional: play→auto-advance→stop-after-last; resume within ~2s of
the saved point; speed cycles 0.75×→2.0× and applies immediately; simulated load error shows the
Kazakh alert.

## 10. Open questions
None. The 30s save interval (vs. PRD §8's "~10s" language) is intentional given the additional
lifecycle + `pagehide` flushes; revisit only if resume drift is reported.

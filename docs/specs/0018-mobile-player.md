# 0018 — Mobile Audio Player

**Status:** Done
**Phase:** 1
**Platform:** Mobile
**Implements:** PRD §8, TRD §8  ·  **Depends on:** 0015 (foundations), 0016 (TalkBack), 0017 (offline)
**Date:** 2026-07-09

---

## 1. Summary
The mobile listening surface and JARYQ's hardest a11y surface (PRD §8): a full `PlayerScreen` driven by
an `expo-av` singleton (`services/audioService.ts`) with state in `store/playerStore.ts`. It plays in
the background, holds a wake lock, offers speed 0.75×–2.0×, auto-saves progress, auto-advances between
chapters, resumes from the saved place, and — when a chapter is downloaded (0017) — plays from disk. It
implements the shared playback contract of TRD §8 for the mobile client.

## 2. Goals / non-goals
- **Goals:** play/pause, scrub, ±seek, prev/next chapter, speed cycle, auto-advance, auto-save (~10s)
  and exact resume; background playback + wake lock; source a local file when downloaded; and expose
  the whole player to TalkBack as one coherent, announced block (PRD §8, §14).
- **Non-goals:** the download mechanics themselves (0017); default-speed persistence beyond the settings
  hook (0019 owns the store); the web player (0006). Chapter list is included here as a modal.

## 3. User stories / behavior
Realises PRD §8: opening a book resumes from the saved chapter + position; play/pause, a scrubber,
±`SEEK_STEP_SECONDS`, prev/next and a speed pill all work without looking; when a chapter ends playback
**auto-advances** to the next and **stops after the last** (no loop); progress is remembered within a
couple of seconds. Speed changes take effect immediately and persist. Audio keeps playing in the
background and the screen won't sleep mid-listen.

## 4. Design
- **`services/audioService.ts`** — wraps one `Audio.Sound` (`soundObject`). `setup()` calls
  `setAudioModeAsync({ staysActiveInBackground:true, … })` for background audio. `loadChapter()` takes
  `{ uri: localUri || chapter.audio_url, overrideFileExtensionAndroid:'m4a' }`, unloads any prior
  sound, and races `createAsync` against a **15s `LOAD_TIMEOUT_MS`**; a `loadGeneration` counter
  discards status callbacks from a superseded load. Also `play/pause/seekTo/setSpeed/getStatus/unload/
  isLoaded` and `getLocalUriForChapter` (the 0017 bridge).
- **`store/playerStore.ts`** — Zustand holding `currentBook/currentChapter/chapterIndex/isPlaying/
  speed/position/duration` with a single `set(partial)`; state and actions are separated so `set`
  can't corrupt the store.
- **`screens/PlayerScreen.tsx`** — owns the lifecycle. `init()` runs `audioService.setup()`, loads
  chapters via `bookService.getChapters`, reads `bookService.getProgress` (when `startIdx===0`) to pick
  the resume chapter/position, then `loadChapter(idx, pos)`. `onStatus` mirrors position/duration into
  local state + store; on `didJustFinish` it advances to `nextIdx` (or announces "Книга завершена").
  Wake lock: `activateKeepAwakeAsync`/`deactivateKeepAwake` gated on the `keepScreenOn` setting.
  **Auto-save:** a `setInterval(AUTOSAVE_INTERVAL_MS)` and the unmount cleanup call `doSave()` →
  `bookService.saveProgress` (skips writes <3s apart). Speed is cycled through
  `SPEEDS=[0.75,1,1.25,1.5,1.75,2]` and persisted via `settingsStore.setSpeed`. A `Modal` + `FlatList`
  renders the chapter list.

## 5. Data & interface changes
- **Data model:** none new. Reads `chapters`; upserts `user_progress` (`chapter_id`, `chapter_number`,
  `position` seconds — one row per user+book, TRD §6) through `bookService.saveProgress`.
- **Interfaces:** `audioService` is the mobile playback seam (TRD §8, §13) — `setup/loadChapter/play/
  pause/seekTo/setSpeed/getStatus/unload/getLocalUriForChapter`; `usePlayerStore.set`; and
  `settingsStore.setSpeed` for the persisted default (0019).

## 6. Accessibility
The whole player is announced as **one block** (PRD §8, §14): a `header` element carries the static
`"<author> — <title>. <chapter>"` label (deliberately without the live position, which changes ~2×/sec),
and a sibling `role="text"` node exposes the live status — chapter N of M, playing/paused, speed,
offline/online. A **chapter change is spoken** via `announceForAccessibility` ("Следующая глава: …" then
the new title). The scrubber is an `accessibilityRole="adjustable"` `Slider` with a Kazakh label, a hint
"Проведите вверх или вниз для перемотки", and an `accessibilityValue.text` reading
`"<pos> из <duration>"` in spoken words — so TalkBack scrubs by **swipe up/down**. Every control is a
labelled+hinted `button` with correct `accessibilityState`; the play button is 88dp and secondary
controls meet 44–52dp (TRD §9). Buffering announces once ("Буферизация…") via a `progressbar` live
region; resume announces "Возобновление с …". Decorative overlays are `accessibilityElementsHidden`.

## 7. Edge cases & failure handling
- **Load stall / CORS:** the 15s timeout rejects → Kazakh error screen with a `role="alert"` label and
  a retry button (bumps `initNonce` to re-fetch); playback stops cleanly.
- **No chapters:** shows a distinct "Қолжетімді тараулар жоқ" error, announced.
- **Last chapter:** stops (`isPlaying:false`), never loops. **Prev when >5s in:** seeks to 0 instead of
  changing chapter.
- **Rapid chapter switches:** `loadGeneration` invalidates stale callbacks and unloads the superseded
  sound; `didFinishRef` guards double-advance.
- **Resume:** `getProgress` maps `chapter_number-1` → index and seeks to `position`; missing progress
  starts at chapter 1, position 0. Save is idempotent (upsert) and debounced (<3s).

## 8. Cost & performance
Zero infra cost: audio streams direct from Cloudflare R2 (or plays from a local file when downloaded,
0017), never through an app server. Status ticks at `progressUpdateIntervalMillis:500` to avoid render
storms; saves are debounced (<3s) and interval-based (`AUTOSAVE_INTERVAL_MS`) to keep `user_progress`
writes minimal. The 15s timeout bounds audio-start latency (TRD §12); the wake lock is released on
pause/unmount so it never drains the battery idle.

## 9. Test plan
Manual on-device: play → auto-advance → stop-after-last; reopen a book and resume within ~2s of the
stop point; cycle speed 0.75×→2.0× and hear/feel it apply immediately and persist; scrub with the
slider and via TalkBack swipe up/down; background the app and confirm audio continues; simulate a load
error and see the Kazakh alert + retry. TalkBack: the player reads as one block, chapter changes and
buffering are announced, the scrubber is adjustable. **Done** = the PRD §8 functional + a11y acceptance
criteria pass on a real device.

## 10. Open questions
None. `AUTOSAVE_INTERVAL_MS` matches PRD §8's ~10s target and is backed by the unmount + cleanup flush;
lock-screen media controls (Now Playing) are a possible enhancement, not required for this spec.

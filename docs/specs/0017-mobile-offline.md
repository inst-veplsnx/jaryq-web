# 0017 — Mobile Offline Mode

**Status:** Done
**Phase:** 1
**Platform:** Mobile
**Implements:** PRD §16, TRD §10  ·  **Depends on:** 0015 (foundations), 0018 (player)
**Date:** 2026-07-09

---

## 1. Summary
Offline listening: chapters download to on-device storage with `expo-file-system`, the player prefers a
local file over the R2 stream, and progress still saves and syncs when connectivity returns. It is the
mobile-only capability of PRD §16 and the subsystem of TRD §10, split between a stateless service
(`services/downloadService.ts`) and its Zustand state (`store/downloadStore.ts`); the reference UX is in
`OFFLINE_MODE_INSTRUCTION.md`.

## 2. Goals / non-goals
- **Goals:** download a chapter (or all chapters) to disk with live progress; detect and list what is
  saved across app restarts; serve local audio to the player; delete per-chapter / per-book / all; keep
  progress-saving working offline; and make every download control screen-reader-announced.
- **Non-goals:** the playback engine itself (0018); pausing/resuming an in-flight download and a
  priority queue (listed as future work in `OFFLINE_MODE_INSTRUCTION.md`); web has no offline (PRD §17).

## 3. User stories / behavior
Realises PRD §16: a listener with unreliable data downloads a book's chapters at home, then plays them
fully offline in the metro — chapter advance and progress-save included, synced when back online. From
the player's download control a chapter shows 📥 → downloading % → ✅; a "📴 Офлайн" badge marks a
chapter that is available offline; downloads survive app restarts and are manageable from Settings.

## 4. Design
- **`services/downloadService.ts`** — files live at
  `${documentDirectory}audio/<bookId>/<chapterId>.m4a`. `downloadChapter()` uses
  `FileSystem.createDownloadResumable` with a progress callback (bytes → %), then writes metadata.
  Readers: `getLocalChapterUri`, `isChapterDownloaded`, `getDownloadedChapters`,
  `getAllDownloadedBooks`, `getDownloadsSize`/`formatFileSize`. Deletes: `deleteChapter`,
  `deleteBookDownloads`, `deleteAllDownloads`. `downloadBookCover`/`getLocalCoverUri` cache the cover.
  A `books_meta.json` index (title/author/chapter list) is written through a **serialised queue**
  (`metaWriteQueue`) so concurrent downloads never clobber each other's entries.
- **`store/downloadStore.ts`** — Zustand: `downloads` (map keyed `bookId-chapterId` → status/progress),
  `downloadedChapters`, `downloadedBooks`, `downloadsSize`, `localCoverUris`. `initialize()` scans disk
  on boot to rebuild state; `downloadChapter` guards against duplicate concurrent downloads and clears
  the completed status after `DOWNLOAD_COMPLETE_CLEAR_DELAY_MS`; `downloadAllChapters` runs
  **sequentially**, skips already-downloaded chapters, and is cancellable via a module flag
  (`_batchDownloadCancelled`, tripped by `deleteAllDownloads`). Selectors: `isChapterDownloaded`,
  `getDownloadedPercent`.
- **Player integration (link to 0018):** in `PlayerScreen`, `loadChapter` calls
  `isChapterDownloaded` and, if true, `audioService.getLocalUriForChapter`, passing the local URI to
  `audioService.loadChapter` — which uses `localUri || chapter.audio_url`. So a downloaded chapter
  plays from disk with the network off.

## 5. Data & interface changes
- **Data model:** none in Postgres — offline state lives entirely on-device (files + `books_meta.json`).
  Progress continues to upsert to `user_progress` (TRD §6) via `bookService.saveProgress`.
- **Interfaces:** the `downloadService` functions above and the `useDownloadStore` contract
  (`downloadChapter/downloadAllChapters/deleteChapter/deleteBookDownloads/deleteAllDownloads/
  isChapterDownloaded/getDownloadedPercent/initialize`); `audioService.getLocalUriForChapter` bridges to
  the player (TRD §10, §13).

## 6. Accessibility
Download state must be announced and manageable by a screen-reader user (PRD §16). The player's
download control is a labelled `button` whose `accessibilityLabel` switches across
"Скачать главу" / "Загрузка: N процентов" / "Глава загружена", with a matching hint and
`accessibilityState={{ disabled, busy }}` while downloading. Lifecycle transitions are voiced with
`announceForAccessibility`: "Начало загрузки главы", "Загрузка завершена", "Загрузка удалена",
"Ошибка загрузки". Deleting a download goes through an `Alert` with explicit confirm/cancel. The
"📴 Офлайн" availability badge is decorative and hidden from TalkBack since the button already conveys
state. Every control meets the 52dp/44dp targets from 0016.

## 7. Edge cases & failure handling
- **No network / bad URL:** `downloadChapter` returns `{ success:false, error }`; the store marks the
  key `error` and the UI announces failure — no half-written file is treated as downloaded.
- **Concurrent / duplicate downloads:** store rejects a second download of the same key; the metadata
  write queue serialises `books_meta.json` updates.
- **Restart mid-session:** `initialize()` re-derives `downloadedChapters` from the actual `.m4a` files
  on disk, so state is truth-from-filesystem, not a stale cache.
- **Missing metadata:** `getAllDownloadedBooks` still lists a book from its files with placeholder
  title/author if `books_meta.json` is absent or unparseable.
- **Offline progress:** `saveProgress` failures are swallowed; the next online save reconciles.

## 8. Cost & performance
Downloads pull straight from Cloudflare R2 (free tier, TRD §2) and cost nothing server-side; storage is
the user's device. The doc budgets ≈30–50 MB/chapter at 64 kbps AAC (≈300–500 MB per 10-chapter book).
Batch download is sequential to avoid saturating a weak connection; completed-status entries are cleared
on a short delay to keep the store small. Playing from a local file removes stream latency entirely.

## 9. Test plan
Manual on-device: download one chapter and watch % → ✅; enable airplane mode and confirm it plays
(with chapter advance and a progress save that syncs on reconnect); "download all" skips existing
chapters and can be cancelled; delete one chapter, one book, and all downloads and confirm disk + state
clear; force-quit mid-library and relaunch → downloaded set is rediscovered. TalkBack: every download
state and transition is announced. **Done** = a book plays fully offline and downloads are voiced and
manageable.

## 10. Open questions
None blocking. Pause/resume of an in-flight download and a prioritised queue are deferred (future work
in `OFFLINE_MODE_INSTRUCTION.md`); `createDownloadResumable` already leaves the door open.

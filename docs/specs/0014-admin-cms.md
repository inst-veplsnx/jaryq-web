# 0014 — Admin CMS & Media Pipeline

**Status:** Done
**Phase:** 4
**Platform:** Web
**Implements:** PRD §13, TRD §7  ·  **Depends on:** 0001-foundations, 0013-security-hardening
**Date:** 2026-07-09

---

## 1. Summary
The admin CMS writes the catalogue that every listener reads. It is a web-only, admin-gated area for
book + chapter CRUD, with audio and cover files uploaded **directly to Cloudflare R2** via presigned PUTs
so raw bytes never transit the app server. This spec covers the `(admin)` route group, the `/api/admin/*`
route handlers behind the server-side admin guard, the service-role write path, the field whitelist, the
presign + direct-upload pipeline, and cascade deletion. It realises PRD §13 and the media pipeline of
TRD §7.

## 2. Goals / non-goals
- **Goals:** let a cataloguer create/edit/delete books and their chapters, upload cover + chapter audio
  straight to R2, and have the result appear (and play) in the listener catalogue — all blocked to
  non-admins server-side, with destructive actions confirmed.
- **Non-goals:** the security primitives themselves (CSP, guard, RLS) live in 0013; listener-facing
  catalogue/player behaviour lives in their specs; there is no end-user upload or review (PRD §18); mobile
  has no admin (PRD §17).

## 3. User stories / behavior
Per PRD §13 acceptance criteria: a non-admin cannot reach or act on any admin route or API (blocked
server-side); a cataloguer can create a book, upload a cover and chapter audio, and that book then shows
in the listener catalogue and plays; editing metadata updates the listener view; deleting removes the book
and its chapters. Observable flow: `/admin` lists books newest-first with edit/delete; `/admin/books/new`
and `/admin/books/[id]` render the same `BookForm`; saving uploads media (with progress), writes rows, and
returns to the list.

## 4. Design
- **Route group (`(admin)`, TRD §4):** `admin/layout.tsx` calls `getAdminUser()` and `redirect("/home")`
  on failure, sets `robots: noindex/nofollow`, and frames the pages. `admin/page.tsx` lists books
  (`DeleteBookButton` per row); `admin/books/new` and `admin/books/[id]` server-load genres (+ book +
  chapters on edit) and render `BookForm`.
- **API handlers (`/api/admin/*`):** every handler first calls `getAdminUser()` → `403` if not admin (0013,
  TRD §7). Routes: `books` (POST), `books/[id]` (PATCH, DELETE), `chapters` (POST), `chapters/[id]`
  (PATCH, DELETE), `presign` (POST). They write via `createSupabaseAdminClient()` — the **service-role**
  client that bypasses the client-write RLS block deliberately, behind the guard.
- **Field whitelist (`api/admin/fields.ts`):** `pickBookFields()` copies only the nine writable book
  columns (no `id`/`created_at`/totals — no mass assignment) and rejects a `cover_url` that isn't under
  `R2_PUBLIC_BASE_URL`; `validAudioUrl()` enforces the same for chapter `audio_url`.
- **Direct-to-R2 upload (TRD §7):** the browser (`presignAndUpload` in `lib/uploadToR2.ts`) POSTs kind +
  bookId + filename + contentType to `POST /api/admin/presign`, which validates (`kind` cover|chapter,
  `bookId` UUID, `contentType` prefix `image/`|`audio/`), builds a deterministic key
  (`books/{id}/cover-{ts}.ext` or `books/{id}/chapters/{uuid}.ext`), and returns a query-signed PUT URL
  (`lib/r2.ts` `presignPut`, aws4fetch SigV4, 1h expiry) + the public URL. The browser then PUTs the raw
  file bytes to R2 via XHR (`uploadToR2`, with upload-progress); nothing is proxied, re-encoded, or
  compressed. The returned public URL is saved on the book/chapter row. `readAudioDuration()` reads
  chapter length from the file's metadata client-side.
- **Totals & cascade:** `recomputeBookTotals()` recomputes `total_duration`/`total_chapters` from chapter
  rows after every chapter mutation. Deleting a book cascades chapters (`ON DELETE CASCADE`); the DELETE
  handler first clears `user_progress` for the book (its `chapter_id` has no cascade), deletes the book
  row, then deletes the R2 objects (cover + all chapter audio via `keyFromPublicUrl`) — row first, storage
  second, so a failed R2 delete leaves only orphaned objects, never broken catalogue rows.

## 5. Data & interface changes
- **Data model:** no schema change — writes `books` / `chapters` (TRD §6) via service-role. `books`
  totals are derived, not client-supplied.
- **Interfaces:** `/api/admin/books`, `/api/admin/books/[id]`, `/api/admin/chapters`,
  `/api/admin/chapters/[id]`, `/api/admin/presign` (the only server write surface, TRD §13);
  `lib/r2.ts` (`presignPut`, `publicUrl`, `keyFromPublicUrl`, `deleteObject`); `lib/uploadToR2.ts`
  (`presignAndUpload`, `uploadToR2`, `readAudioDuration`); `lib/supabase/admin.ts`
  (`createSupabaseAdminClient`, `recomputeBookTotals`); `pickBookFields`/`validAudioUrl`.

## 6. Accessibility
The admin area is `noindex` and admin-gated, so it is outside the axe route sweep (0012) — its controls are
labelled by hand and must stay operable by keyboard + screen reader. `BookForm` associates every field
with a `<Label htmlFor>` (title, author, narrator, genre `<select>`, language, description, cover file);
the compact chapter rows carry `aria-label` ("Тарау нөмірі", "Тарауды өшіру"); the new/popular toggles are
real `Switch` controls; upload progress renders a `Progress` bar (announce the percentage, not colour
alone). All copy and errors are plain Kazakh (PRD §4, §5). Destructive actions confirm before acting, so a
delete is never silent. Focus order follows the form top-to-bottom; the submit pill shows a labelled
saving state. Done = the form is fully completable by keyboard with each control announced.

## 7. Edge cases & failure handling
- **Non-admin** → layout redirect + every API `403` (server-side).
- **Bad presign input** → 400 (`kind`/`bookId`/`contentType` validation); a media URL outside the bucket
  → 400 from the field whitelist.
- **Upload failure** → XHR surfaces a Kazakh error (incl. a CORS hint for R2 mis-config); metadata-read
  failure warns but still uploads the file.
- **New book with no id yet** → `BookForm` creates the book row first to mint the id used for R2 keys, so
  a mid-save error leaves an editable draft (the toast says to continue from the edit page).
- **Cover replace** → the PATCH handler deletes the previous R2 object only after the row update succeeds.
- **Delete** → `user_progress` cleared first (no cascade on `chapter_id`), then row, then storage;
  `deleteObject` treats a 404 as success (idempotent).

## 8. Cost & performance
The direct-to-R2 pipeline is the whole point: file bytes go browser → R2, never through the app server, so
upload bandwidth and storage stay inside R2's free tier and off Vercel's function budget (TRD §2, §7, §12).
Presign is a tiny signed-URL response; `recomputeBookTotals` is one small aggregate per chapter mutation.
No media ever lands in the repo or Supabase Storage.

## 9. Test plan
- **Guard:** non-admin gets a redirect from `/admin` and `403` from each `/api/admin/*` route; admin
  passes (covered by 0013's admin-gate tests).
- **Create → play:** create a book, upload a cover + one chapter audio, confirm the row saves the R2 public
  URLs, then verify the book appears in the listener catalogue and the chapter plays.
- **Edit:** change metadata + replace the cover → listener view updates, old R2 cover removed.
- **Delete cascade:** delete a book → its chapters and `user_progress` rows are gone and R2 objects removed;
  a 404 on an already-missing object doesn't fail the delete.
- **Whitelist:** POST with an `id`/`created_at`/off-bucket `cover_url` → the extra field is ignored / 400.
- **Done** = admin round-trips a book end-to-end and non-admins are blocked server-side.

## 10. Open questions
None blocking. Chapter reordering is manual via the `chapter_number` field (no drag-reorder yet); orphaned
R2 objects from a failed post-row delete are acceptable (storage-cheap) and could be swept later. The
`ADMIN_EMAILS` allowlist gate is shared with 0013 and revisited there if the cataloguer team grows.

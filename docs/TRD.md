# JARYQ — Technical Requirements Document (TRD)

**Answers:** *How is JARYQ built — architecture, data, interfaces, and the non-functional bars?*
**Changes:** when a subsystem, data shape, or interface changes. **Owner:** Engineering.
**Related:** product behaviour in `PRD.md`; per-feature detail in `docs/specs/` (specs reference the
section numbers below).

---

## 1. System overview

JARYQ is **two client apps over one shared backend**:

```
┌──────────────────────┐        ┌──────────────────────┐
│  Web  (jaryq)        │        │  Mobile (audiobook-  │
│  Next.js 16 · React  │        │  expo) · Expo 51 ·   │
│  19 · Tailwind v4    │        │  React Native 0.74   │
│  · shadcn/ui         │        │                      │
│  Howler.js player    │        │  expo-av player      │
└──────────┬───────────┘        └──────────┬───────────┘
           │                               │
           │      Supabase JS client       │
           └───────────────┬───────────────┘
                           ▼
        ┌────────────────────────────────────────┐
        │  Supabase                              │
        │  • Postgres (6 tables, RLS)            │
        │  • Auth (email/password, SSR cookies)  │
        │  • handle_new_user trigger             │
        └────────────────────────────────────────┘
                           │  audio + cover URLs
                           ▼
             ┌──────────────────────────────┐
             │  Cloudflare R2 (media CDN)   │
             └──────────────────────────────┘
```

There is **no shared code package**. The two repos duplicate the domain types and the
`supabase_schema.sql` file; parity is a **convention enforced by review**, not by tooling. This is a
deliberate trade-off — the apps are small and diverge in platform concerns (SSR vs. native audio), so a
shared package would cost more than it saves. **Every schema change is applied to both repos.**

## 2. Design goals & constraints

- **Accessibility-first** (WCAG 2.2 AA on web, TalkBack on mobile) — a hard constraint on every
  subsystem, see §9.
- **Near-zero running cost** — everything must fit Supabase's and Cloudflare R2's free tiers (see
  `BRD.md` §5–7). No paid infra without coordinator sign-off.
- **Public catalogue, private user data** — enforced at the database (RLS), not just the UI (§6).
- **Kazakh (Cyrillic) rendering** — the UI font must carry Cyrillic subsets (§8).

## 3. Stack

| Layer | Web (`jaryq`) | Mobile (`audiobook-expo`) |
|---|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) + React 19 | Expo 51 + React Native 0.74 |
| Language | TypeScript 5 | TypeScript 5 |
| UI | Tailwind CSS v4 + shadcn/ui (base-nova) + `@base-ui/react` + lucide-react | React Native primitives + design tokens |
| Navigation | App Router route groups + `proxy.ts` middleware | React Navigation 6 (Stack + Bottom Tabs) |
| State | Zustand v5 (`authStore`, `playerStore`, `settingsStore`) | Zustand v4 (`authStore`, `playerStore`, `downloadStore`, `settingsStore`) |
| Audio | Howler.js 2.2 (browser singleton) | expo-av (+ expo-keep-awake, background mode) |
| Backend | Supabase (`@supabase/ssr` + `@supabase/supabase-js`) | Supabase (`@supabase/supabase-js`) |
| Media | Cloudflare R2 (audio + covers), signed with `aws4fetch` for admin upload | Cloudflare R2 (read), `expo-file-system` for offline |
| Notifications | sonner (toasts) | — |
| Offline | — | `expo-file-system` + `downloadStore` |
| Testing | Playwright + @axe-core/playwright | — |

## 4. Web application architecture

App Router with **route groups** that map to access tiers:

| Group | Paths | Access | Rendering |
|---|---|---|---|
| `(public)` | `/` (landing) | everyone | mostly static |
| `(auth)` | `/login`, `/register`, `/forgot-password`, `/update-password` | signed-out only | client forms + server actions |
| `(app)` | `/home`, `/books`, `/books/[id]`, `/new-arrivals`, `/popular`, `/genres`, `/genres/[id]`, `/search`, `/favorites`, `/library`, `/profile`, `/profile/settings` | authenticated only | SSR + client islands |
| `(admin)` | `/admin`, `/admin/books/new`, `/admin/books/[id]` | admins only | server-guarded |
| `api` | `/api/admin/books`, `/api/admin/chapters`, `/api/admin/presign` | admins only (route handlers) | server |

- **`src/proxy.ts`** is Next.js 16's renamed middleware entry point. It runs on every non-asset request,
  calls `supabase.auth.getUser()` server-side, and redirects: signed-out → `/login` for `(app)`/`(admin)`,
  signed-in → `/home` for `(auth)`.
- **`AppShell`** hosts the persistent chrome (Sidebar, MobileNav, Header) and always mounts the
  `PlayerBar` so playback survives navigation.
- **Supabase clients:** `lib/supabase/server.ts` (`createSupabaseServerClient`, cookie-based SSR),
  `lib/supabase/client.ts` (`getSupabaseClient()` browser singleton), `lib/supabase/admin.ts`
  (service-role client, server-only, used by admin API routes).
- **Data access** funnels through `lib/services/bookService.ts` — the single module that issues Supabase
  queries for books, chapters, genres, favourites, and progress.

## 5. Mobile application architecture

- **Navigation:** React Navigation — a Stack for auth/detail/player screens over Bottom Tabs for the
  main sections (home, search, genres, favourites/shelf, profile).
- **Services:** `supabase.ts` (client), `bookService.ts` (catalogue queries), `audioService.ts`
  (expo-av playback), `downloadService.ts` (offline chapter downloads via `expo-file-system`).
- **Theme:** `theme/designTokens.ts` (colours, spacing, radii, typography, shadows, `a11y` constants)
  and `theme/useAppScale.ts` (UI scaling). Tokens mirror the web brand (§8, §9).
- **Audio** runs in the background (expo-av background mode) and holds a wake lock during playback
  (expo-keep-awake).

## 6. Data model

Six tables in Postgres (`supabase_schema.sql`, shared verbatim by both repos). All have RLS enabled.

| Table | Key columns | Notes |
|---|---|---|
| `genres` | `id`, `name`, `icon` | Public read. |
| `books` | `id`, `title`, `author`, `narrator`, `description`, `cover_url`, `genre_id→genres`, `total_duration`, `total_chapters`, `is_new`, `is_popular`, `language` | Public read. Shelves = `is_new` / `is_popular` flags. |
| `chapters` | `id`, `book_id→books (ON DELETE CASCADE)`, `chapter_number`, `title`, `audio_url`, `duration` | Public read. `audio_url` = R2 URL. |
| `profiles` | `id→auth.users (ON DELETE CASCADE)`, `email`, `full_name` | Owner-scoped. Created by trigger (below). |
| `user_progress` | `id`, `user_id→profiles`, `book_id→books`, `chapter_id→chapters`, `chapter_number`, `position`, `updated_at`, **`UNIQUE(user_id, book_id)`** | Owner-scoped. **Upserted** on save — one row per user+book. `position` = seconds offset. |
| `favorites` | `id`, `user_id→profiles`, `book_id→books`, **`UNIQUE(user_id, book_id)`** | Owner-scoped. |

**RLS policy summary**
- `books`, `chapters`, `genres` — `SELECT USING (true)` (public read incl. `anon`); no client write.
- `profiles` — select/update/insert scoped to `auth.uid() = id`.
- `user_progress`, `favorites` — select/insert/update/delete scoped to `auth.uid() = user_id`.
- Grants: `SELECT` on catalogue tables to `anon` + `authenticated`; full CRUD (per policy) on user
  tables to `authenticated`; `service_role` has full access (admin API path, §7).

**Profile provisioning:** `handle_new_user()` is a `SECURITY DEFINER` trigger on `auth.users AFTER
INSERT` that inserts the matching `profiles` row (email + `full_name` from `raw_user_meta_data`), with
a `unique_violation` guard so re-runs are idempotent. It bypasses RLS by design.

## 7. Admin CMS & media pipeline (web)

The admin CMS writes the catalogue that everyone reads.

- **Guarding:** `lib/adminGuard.ts` gates the `(admin)` route group and every `/api/admin/*` route
  handler server-side. Admin identity is server-verified (not a client flag). Non-admins get a 401/redirect.
- **Write path:** admin API routes use the **service-role** Supabase client (`lib/supabase/admin.ts`)
  to insert/update/delete `books` and `chapters` — bypassing the client-write RLS block deliberately,
  behind the admin guard. Field whitelists live in `api/admin/fields.ts`.
- **Media upload (direct-to-R2):** `POST /api/admin/presign` (using `lib/r2.ts` + `aws4fetch`) returns a
  presigned PUT URL scoped to a key; the browser (`lib/uploadToR2.ts`) uploads the file **straight to
  R2** — bytes never transit the app server. The returned public R2 URL is then saved on the book/chapter
  row. This keeps upload cost/bandwidth off the app server and inside R2's free tier.
- **Cascade:** deleting a book cascades chapters (`ON DELETE CASCADE`); `total_chapters`/`total_duration`
  are maintained alongside chapter edits.

## 8. Audio & playback

**Shared contract (both apps):** a book is an ordered list of chapters; playback tracks the current
`chapter` + `position` (seconds); progress is upserted to `user_progress` **periodically (mobile ≈10s,
web ≈30s) and on lifecycle events** (chapter change, app background / `pagehide`, player teardown);
playback auto-advances to the next chapter and stops after the last.

- **Web:** `lib/audio/howlerService.ts` wraps a single Howler instance (load/play/pause/seek/speed/
  position/duration/unload) with a **15s load timeout** as a guard against silent CORS failures. It is
  browser-only and lazy (never imported server-side). `PlayerBar` owns the lifecycle and lazy-loads
  `FullPlayer` via `next/dynamic`. Playback state lives in `usePlayerStore`.
- **Mobile:** `services/audioService.ts` wraps expo-av with background playback and a wake lock; state
  in `playerStore`; `downloadService` can source audio from a local file (offline, §10) instead of R2.
- **Speed:** 0.75×–2.0×; default speed is a user setting (`settingsStore`).
- **Fonts/rendering note (web):** the UI font is **Manrope** with `latin` + `cyrillic` + `cyrillic-ext`
  subsets (Kazakh Cyrillic) — self-hosted via `next/font`; a display face (Playfair Display) and mono
  (Geist Mono) round out the set. Geist has no Cyrillic, so it is never the UI font.

## 9. Accessibility architecture

Accessibility is engineered, not audited-in. See `docs/design/01-design-system/` for the token-level
rules.

- **Web (WCAG 2.2 AA):** semantic landmarks + `AppShell` regions; one `h1`/page and correct heading
  order; a **skip-to-content** link (`.jaryq-skip-link`); visible focus rings; `.sr-only` for
  screen-reader-only text; `prefers-reduced-motion` globally neutralises animation; a **large-text**
  setting (`html.jaryq-large-text` → root font 125%) scales all rem sizing; text colour tokens are
  chosen for ≥4.5:1 (e.g. muted text is `#6B6B6B`, not `#888`, on the app background). The `FullPlayer`
  sets `aria-hidden` on Sidebar/MobileNav to satisfy focus-trap requirements.
- **Mobile (TalkBack):** `theme/designTokens.ts` `a11y` constants pin **52dp** minimum touch targets
  (44dp small / slider), a 3px focus ring; every control carries `accessibilityLabel` +
  `accessibilityHint` + role; the player is read as one block; chapter changes are announced; the
  scrubber is an `adjustable` control (swipe up/down).
- **Verification (web):** Playwright + @axe-core/playwright against a dev server seeded with in-memory
  fixtures (`NEXT_PUBLIC_A11Y_FIXTURES=1`, `lib/a11yFixtures.ts`), covering every listener screen.

## 10. Offline (mobile)

`downloadService` + `downloadStore` download chapter audio to `expo-file-system` storage; the player
prefers a local file when present, else streams from R2. Progress still saves to `user_progress` and
syncs when connectivity returns.

## 11. Security

- **RLS is the backstop** (§6): user data is unreachable across accounts even if the client is
  compromised; the catalogue is intentionally public-read.
- **Web headers** (`next.config.ts`, all routes): a strict **CSP** (`default-src 'self'`; connect/img/
  media scoped to the Supabase host + `*.r2.cloudflarestorage.com`/`*.r2.dev`; `object-src 'none'`;
  `frame-ancestors 'none'`; `'unsafe-eval'` only in dev), plus `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, HSTS, and a
  `Permissions-Policy` disabling camera/microphone/geolocation.
- **Admin** write access is service-role behind a server-side guard (§7); the service-role key is
  server-only and never shipped to the client.
- **Secrets:** `lib/env.ts` `requireEnv()` throws at boot if a required variable is missing (fail fast,
  not silent misconfig).

## 12. Non-functional requirements (NFRs)

| Dimension | Bar |
|---|---|
| **Accessibility** | WCAG 2.2 AA (web) / full TalkBack (mobile). Non-negotiable, gates release. |
| **Cost** | Fits Supabase + Cloudflare R2 free tiers; media never in-repo or Supabase Storage. |
| **Performance** | First meaningful paint fast on mid-range Android; audio starts within a couple of seconds on a normal connection; 15s hard timeout guards stalls. |
| **Reliability** | Progress never lost (periodic upsert + lifecycle flushes, see §8); resume within ~2s of stop point. |
| **Localisation** | UI copy is Kazakh (Cyrillic), rendered without serif fallback; auth errors localised. *Known gap: some mobile TalkBack labels/announcements are currently Russian — tracked for cleanup.* |
| **Portability** | Web on any Next.js 16 host (Vercel default); mobile via EAS (Android APK, iOS capable). |

## 13. Interfaces (where behaviour is defined)

- **`bookService`** (both apps) — catalogue/favourites/progress queries. The de-facto data API.
- **`howlerService` / `audioService`** — the playback interface (load/play/pause/seek/speed/position).
- **`/api/admin/*`** — the only server write surface; presign + book/chapter CRUD.
- **Zustand stores** — `authStore` (session), `playerStore` (playback), `settingsStore` (speed/theme/
  large-text), `downloadStore` (mobile offline).
- **`supabase_schema.sql`** — the source of truth for the data model; changing it is a cross-repo change.

## 14. Known trade-offs & future work

- **No shared package** (§1) — accepted; revisit if the apps grow enough that drift becomes costly.
- **Catalogue is public-read** — intentional (accessibility + cost); no DRM (see `BRD.md` §8).
- **No dark theme** on either app — a single warm-editorial light theme ships; the web dark variant is
  scaffolded only (`@custom-variant dark`) and deferred (see PRD §15).
- See `docs/ROADMAP.md` for phased status and what's next.

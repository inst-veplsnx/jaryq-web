# 0001 — Foundations

**Status:** Done
**Phase:** 0
**Platform:** Both
**Implements:** PRD §1–3, TRD §1, §3, §4, §6  ·  **Depends on:** —
**Date:** 2026-07-09

---

## 1. Summary
The foundation is the scaffold every other feature stands on: the Next.js 16 App Router web app,
its access-tiered route groups and `proxy.ts` route protection, the Supabase clients (SSR + browser),
fail-fast env loading, the Zustand stores, and the **shared `supabase_schema.sql`** (six tables, RLS,
the `handle_new_user` trigger) read by both the web (`jaryq`) and mobile (`audiobook-expo`) apps. It
realises the **two-apps / one-backend** architecture of TRD §1 and the data model of TRD §6.

## 2. Goals / non-goals
- **Goals:** stand up the App Router shell, server-enforced route tiers, typed Supabase access, the
  six-table schema + RLS + profile trigger, Kazakh (Cyrillic) font wiring, and the a11y scaffold.
- **Non-goals:** feature UIs (catalogue, player, auth forms, admin CMS) — each has its own spec. The
  service-role admin client and `/api/admin/*` are scoped to the admin spec (TRD §7).

## 3. User stories / behavior
- A signed-out user hitting any `(app)`/`(admin)` path is bounced to `/login` **server-side**; a
  signed-in user hitting `/login` or `/register` is bounced to `/home` (PRD §4).
- Every screen renders Kazakh Cyrillic correctly (no serif fallback), because the UI font ships the
  `cyrillic` subsets (PRD §2, TRD §8).
- A missing required env var fails the boot loudly instead of misconfiguring silently (TRD §11).

## 4. Design
- **Route groups** (`src/app`, TRD §4): `(public)` `/`, `(auth)` login/register/forgot/update,
  `(app)` the listener screens, `(admin)`, and `api`. `(app)/layout.tsx` mounts `AppShell` and passes
  `isAdmin` from `getAdminUser()`.
- **`src/proxy.ts`** — Next.js 16's renamed middleware entry. Builds an SSR client, calls
  `supabase.auth.getUser()`, then redirects: `PROTECTED_PATHS` + no user → `/login?redirect=<path>`;
  `AUTH_PATHS` (`/login`, `/register`) + user → `/home` (or the sanitised `redirect`). The `matcher`
  excludes `_next` and static/media assets.
- **Supabase clients:** `lib/supabase/server.ts` (`createSupabaseServerClient`, cookie-backed SSR,
  swallows the Server-Component cookie-set throw), `lib/supabase/client.ts` (`getSupabaseClient()`
  lazy browser singleton).
- **Env:** `lib/env.ts` — `requireEnv(name)` (server, dynamic lookup) and `requireEnvValue(name, literal)`
  (client, caller passes `process.env.X` so Next inlines `NEXT_PUBLIC_*`); both throw when absent.
- **Root layout** (`app/layout.tsx`): `<html lang="kk">`, Manrope (`--font-sans`, latin + cyrillic +
  cyrillic-ext), Playfair Display, Geist Mono; wraps children in `AuthProvider` + `ToasterClient`;
  `metadataBase` from `NEXT_PUBLIC_SITE_URL`.
- **Stores** (Zustand v5): `authStore` (session), `playerStore`, `settingsStore` (TRD §3).

## 5. Data & interface changes
- **Data model** (`supabase_schema.sql`, shared verbatim — a change touches both repos): `genres`,
  `books`, `chapters` (public-read), `profiles`, `user_progress` (`UNIQUE(user_id, book_id)`),
  `favorites` (`UNIQUE(user_id, book_id)`). RLS enabled on all six; catalogue = `SELECT USING (true)`,
  user tables scoped to `auth.uid()`. `handle_new_user()` is a `SECURITY DEFINER` `AFTER INSERT`
  trigger on `auth.users` that inserts the `profiles` row (email + `full_name` from metadata) with a
  `unique_violation` guard. Audio/cover columns hold **Cloudflare R2** URLs (TRD §6).
- **Interfaces:** `createSupabaseServerClient`, `getSupabaseClient`, `requireEnv`/`requireEnvValue`,
  the `proxy` handler + its `config.matcher`, and the store contracts in TRD §13.

## 6. Accessibility
The foundation must ship the a11y substrate every screen inherits. `<html lang="kk">` sets the correct
language for screen readers; **Manrope's cyrillic subsets** guarantee Kazakh renders (a broken glyph is
an a11y defect). `AuthProvider` toggles `html.jaryq-large-text` from `settingsStore` so the root font
scales all rem sizing; the skip-to-content link (`.jaryq-skip-link`), visible focus rings,
`prefers-reduced-motion` neutralisation, and AA text tokens (muted text **`#6B6B6B`**, ≥4.5:1) live in
`globals.css` per TRD §9. `AppShell` provides the semantic landmark regions. No page ships without these.

## 7. Edge cases & failure handling
- Missing env var → `requireEnv`/`requireEnvValue` throw at boot with a `.env.example` pointer.
- SSR cookie-set from a Server Component throws → caught in `server.ts`; the middleware refreshes the
  session instead. `proxy` sanitises `redirect` (must start with `/`, not `//`) to prevent open redirect.
- Trigger race on profile insert → the `unique_violation` guard makes re-runs idempotent; the browser
  client also has a fallback create path (see spec 0002).

## 8. Cost & performance
Zero added infra: everything sits on Supabase + Cloudflare R2 free tiers (TRD §2, §12). Fonts are
self-hosted via `next/font` (no third-party font fetch). The `proxy` matcher skips static/media assets
so route protection never runs on `_next`/image/audio requests, keeping edge cost and latency down.

## 9. Test plan
- **Route protection:** signed-out `GET /home` → 307 → `/login?redirect=/home`; signed-in `GET /login`
  → 307 → `/home`; asset paths bypass the middleware.
- **Env fail-fast:** unset `NEXT_PUBLIC_SUPABASE_URL` → build/boot throws the named error.
- **Schema:** apply `supabase_schema.sql` clean; confirm RLS blocks cross-user reads and the trigger
  creates a `profiles` row on signup.
- **a11y:** the Playwright + axe-core suite runs against the shell (TRD §9); Cyrillic renders in Manrope.
- **Done** = tiers enforced server-side, schema+RLS+trigger live, a11y substrate present on every page.

## 10. Open questions
None. The **no-shared-package** trade-off (TRD §1) is accepted: the two repos duplicate the domain
types and `supabase_schema.sql`, and parity is a review convention, revisited only if drift becomes costly.

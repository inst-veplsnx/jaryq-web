# 0013 — Security Hardening

**Status:** Done
**Phase:** 3
**Platform:** Web
**Implements:** PRD §13–14 (security), TRD §11, §6  ·  **Depends on:** 0001-foundations
**Date:** 2026-07-09

---

## 1. Summary
JARYQ's catalogue is deliberately public-read, so the security posture is about keeping user data
private, keeping the admin write path locked to admins, and shrinking the browser's attack surface with
strict headers. This spec collects the four layers that do that: a strict CSP + security headers in
`next.config.ts`, server-side route protection in `proxy.ts`, the server-side admin gate `adminGuard.ts`,
and the database RLS backstop — plus fail-fast env loading so nothing runs mis-configured. It realises
TRD §11 (security) on top of the data model of TRD §6.

## 2. Goals / non-goals
- **Goals:** ship a strict CSP scoped to exactly the hosts we use (Supabase + R2); set the standard
  hardening headers on every route; protect `(app)`/`(admin)` routes server-side; gate every admin write
  behind a server-verified allowlist; make RLS the backstop for user data; fail loudly on missing secrets;
  keep the service-role key server-only.
- **Non-goals:** the admin CMS behaviour itself (0014); auth flows (their own spec); mobile hardening
  (Expo repo). No DRM on the catalogue — public-read is intentional (TRD §14, `BRD.md` §8).

## 3. User stories / behavior
- A signed-out user hitting any `(app)`/`(admin)` path is redirected to `/login` **server-side**, before
  any page renders (PRD §4, §13).
- A non-admin who reaches an admin route is redirected to `/home`; a non-admin who calls any `/api/admin/*`
  endpoint gets `403` (PRD §13 — blocked server-side, not just hidden).
- The browser refuses to load script/style/media/connect from any origin other than self + Supabase + R2,
  cannot be framed, and never leaks a full referrer cross-origin.
- A deploy missing a required secret fails at boot with a named error, never silently mis-runs (TRD §11).

## 4. Design
- **Headers (`next.config.ts`, `source: "/(.*)"`):** a CSP string assembled at build from
  `SUPABASE_HOST` (parsed from `NEXT_PUBLIC_SUPABASE_URL`): `default-src 'self'`; `connect-src` self +
  `https`/`wss` Supabase host + `*.r2.cloudflarestorage.com`/`*.r2.dev`; `script-src 'self' 'unsafe-inline'`
  with `'unsafe-eval'` **only** in dev; `style-src 'self' 'unsafe-inline'`; `img-src` self + `data:`/`blob:`
  + Supabase + R2; `media-src 'self' blob:` + R2; `font-src 'self' data:`; `object-src 'none'`;
  `base-uri 'self'`; `form-action 'self'`; `frame-ancestors 'none'`. Alongside it: `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and HSTS
  (`max-age=31536000; includeSubDomains`). `images.remotePatterns` is likewise scoped to Supabase + R2.
- **Route protection (`proxy.ts`, TRD §4):** Next 16's middleware entry builds an SSR Supabase client,
  calls `auth.getUser()`, and redirects `PROTECTED_PATHS` (incl. `/admin`) with no user → `/login?redirect=…`;
  `AUTH_PATHS` with a user → the sanitised `redirect` or `/home`. The `matcher` skips `_next`/static/media.
- **Admin gate (`adminGuard.ts`):** `getAdminUser()` verifies the session email is in the `ADMIN_EMAILS`
  comma-separated allowlist; used by the `(admin)` layout (redirect) and by every `/api/admin/*` handler
  (403). Admin identity is server-verified, never a client flag (TRD §7).
- **RLS backstop (`supabase_schema.sql`, TRD §6):** catalogue tables `SELECT USING (true)` (public read,
  incl. `anon`); `profiles`/`user_progress`/`favorites` scoped to `auth.uid()`; grants give `anon` +
  `authenticated` only `SELECT` on the catalogue and per-policy CRUD on user tables; `service_role` has
  full access (the admin path). So even a compromised client can't read another user's data.
- **Secrets (`env.ts`):** `requireEnv(name)` throws at boot if absent; `requireEnvValue` is the client
  variant (caller passes `process.env.X` so Next inlines `NEXT_PUBLIC_*`). The service-role key is loaded
  only inside `lib/supabase/admin.ts` (marked "must never be imported from client code").

## 5. Data & interface changes
- **Data model:** no new tables — this spec depends on the existing RLS + grants of TRD §6. Schema is
  shared verbatim with the mobile repo, so any RLS change is a cross-repo change.
- **Interfaces:** the `headers()` + CSP config in `next.config.ts`; the `proxy` handler + its
  `config.matcher`; `getAdminUser()`; `requireEnv`/`requireEnvValue`; `createSupabaseAdminClient()`
  (service-role, server-only).

## 6. Accessibility
Security must not degrade accessibility. The CSP allows `'unsafe-inline'` styles/scripts, which keeps
self-hosted fonts, inline critical CSS, and the a11y focus/skip-link styles working (0012) — Cyrillic
still renders and focus rings still show. The server-side redirects in `proxy.ts` land unauthenticated
users on the fully accessible `/login` page rather than a dead 403 body, so a screen-reader user is never
stranded on an unlabelled error. `Permissions-Policy` disabling camera/mic/geolocation removes permission
prompts the app never needs, reducing assistive-tech noise. No security header hides content from AT.

## 7. Edge cases & failure handling
- **Open-redirect:** `proxy.ts` accepts a `redirect` only if it starts with `/` and not `//`, else falls
  back to `/home`.
- **SSR cookie-set throw** from a Server Component is swallowed in the server client; the middleware
  refreshes the session instead.
- **Admin allowlist empty / user has no email** → `getAdminUser()` returns `null` (deny by default).
- **Missing secret** → `requireEnv` throws with a `.env.example` pointer at build/boot.
- **CSP violation** (e.g. a stray third-party asset) is blocked by the browser, not silently allowed —
  surfaced as a console report, fixed by scoping, never by widening `default-src`.

## 8. Cost & performance
Zero added infra. Headers are static config applied at the edge; the CSP is computed once at build. The
`proxy` matcher excludes `_next`/image/audio/font requests so route protection never runs on assets,
keeping edge latency and cost down. RLS enforcement is a Postgres cost already paid on every query. All
of it stays inside the Supabase + Cloudflare R2 free tiers (TRD §2, §12).

## 9. Test plan
- **Headers:** `GET /` returns the expected CSP, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`,
  `Permissions-Policy`, and HSTS; confirm `'unsafe-eval'` is present in dev and absent in a production build.
- **Route protection:** signed-out `GET /home` → 307 → `/login?redirect=/home`; signed-in `GET /login`
  → 307 → `/home`; a crafted `redirect=//evil.com` is rejected → `/home`.
- **Admin gate:** a non-admin session gets a redirect from `/admin` and `403` from `POST /api/admin/books`,
  `/api/admin/chapters`, `/api/admin/presign`.
- **RLS:** with two accounts, account A cannot `SELECT`/`UPDATE` account B's `user_progress`/`favorites`;
  `anon` can read the catalogue but not write.
- **Env fail-fast:** unset `SUPABASE_SERVICE_ROLE_KEY` (or a `NEXT_PUBLIC_*`) → boot throws the named error.
- **Done** = all four layers enforce server-side, independently of the UI.

## 10. Open questions
None blocking. CSP keeps `'unsafe-inline'` for styles/scripts (needed by the current inline-style setup);
tightening to nonces/hashes is possible future work but not required for the TRD §11 bar. The `ADMIN_EMAILS`
allowlist is a pragmatic gate for a small cataloguer team; a DB-backed admin role can replace it if the
team grows (TRD §7).

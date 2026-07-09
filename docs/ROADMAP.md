# JARYQ — Roadmap

**Answers:** *In what order was JARYQ built, and what's next?*
**Changes:** as phases complete. **Owner:** Engineering + coordinators.
**Related:** `PRD.md` (what) · `TRD.md` (how) · `docs/specs/` (per-feature detail).

> Phases are a **logical build order**, reconstructed from the two repos' git history — not a rigid
> schedule. Everything through Phase 4 is **shipped and live** on the shared backend. Phase 5 is open.

---

## Status at a glance

| Phase | Theme | Status |
|---|---|---|
| 0 | Foundations | ✅ Done |
| 1 | Catalogue & Player | ✅ Done |
| 2 | Accessibility Hardening | ✅ Done |
| 3 | Landing & Brand | ✅ Done |
| 4 | Admin CMS | ✅ Done |
| 5 | Sustainability & Scale | 🔜 Next |
| — | Mobile app (TalkBack + offline) | ✅ Shipped (parallel track, P0–P2) |

---

## Phase 0 — Foundations ✅

The scaffold both apps stand on.

- Web: Next.js 16 App Router scaffold, Tailwind v4 + shadcn/ui, route groups `(public)/(auth)/(app)`,
  `proxy.ts` middleware, Zustand stores.
- Mobile: Expo 51 + React Navigation scaffold, design tokens (`theme/`).
- Backend: Supabase project, `supabase_schema.sql` (6 tables, RLS, `handle_new_user` trigger),
  Cloudflare R2 for media.
- Accounts: email/password **login, register, forgot-password, update-password**; Supabase auth-error
  → Kazakh translation; `AuthProvider` session bootstrap.

**Specs:** `0001-foundations`, `0002-auth`, `0015-mobile-foundations`.

## Phase 1 — Catalogue & Player ✅

The core loop: find a book, play it, never lose your place.

- Catalogue: home, books, book detail, **new arrivals**, **popular**, genres list + detail, search.
- Player: persistent mini-player + full player; Howler (web) / expo-av (mobile); **auto-save progress**
  (mobile ≈10s / web ≈30s + lifecycle flushes), **auto-advance**, **resume from saved position**;
  speed 0.75×–2.0×.
- Favourites and library / continue-listening.

**Specs:** `0003-catalogue-book-detail`, `0004-search`, `0005-genres`, `0006-web-player`,
`0007-favorites`, `0008-library-continue-listening`, `0018-mobile-player`.

## Phase 2 — Accessibility Hardening ✅

Turning "has some a11y" into "operable without sight" — the release bar.

- Web: WCAG **2.2 AA** pass — landmarks, heading order, labelled controls, focus rings,
  **skip-to-content**, `prefers-reduced-motion`, **large-text** setting, AA-contrast token fixes;
  Playwright + axe-core suite over every listener screen.
- Mobile: full **TalkBack** pass — labels/hints/roles, 52dp targets, player-as-one-block, announced
  chapter changes, adjustable scrubber.
- Profile & settings (speed / theme / large-text).

**Specs:** `0009-profile-settings`, `0012-web-accessibility`, `0016-mobile-talkback`,
`0019-mobile-ui-scaling`.

## Phase 3 — Landing & Brand ✅

The front door and the look.

- Public landing page: Hero, About, Features, How-it-works, Team/coordinators, CTA, Footer.
- Editorial / anti-slop design pass; warm-orange brand system locked (`docs/design/`).
- Warm-editorial **light** theme locked (dark scaffolded, deferred); branded page-load + scroll-reveal
  motion (reduced-motion safe).

**Specs:** `0010-landing`, `0011-theming`, `0013-security-hardening` (headers/CSP shipped alongside the
public surface).

## Phase 4 — Admin CMS ✅

Self-serve cataloguing so books can be added without touching SQL.

- Admin route group + API, **admin-only** server guard.
- Book + chapter CRUD; **direct-to-R2 presigned upload** (audio + covers); editorial admin redesign.

**Specs:** `0014-admin-cms`.

## Phase 5 — Sustainability & Scale 🔜 (next)

Keeping it free, making it bigger, closing the last a11y gaps.

- **Catalogue growth:** onboard more Kazakh books/chapters; cataloguer workflow polish.
- **Remaining a11y polish:** fix known heading-level skips (card-grid `h1→h3`, `/search` missing `h1`),
  expand the axe suite, mobile dark theme.
- **Sustainability groundwork:** monitor free-tier headroom (Supabase DB/storage, R2 bandwidth);
  scope grant / institutional-licensing options (`BRD.md` §5) — no product paywall.
- **Parity:** keep web/mobile feature parity and the shared schema in lockstep.

**Specs:** open — copy `docs/specs/_TEMPLATE.md` when starting one.

---

## Mobile track (parallel)

The Expo app (`audiobook-expo`) shipped as a **production-ready build** covering Phases 0–2 in one push
(TalkBack-first UX, offline downloads, background audio), and is versioned via EAS (Android APK; iOS
capable). It shares this repo's backend and schema. Landing and Admin (Phases 3–4) are **web-only** by
design — see `PRD.md` §17.

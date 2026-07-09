# 0010 — Landing Page

**Status:** Done
**Phase:** 3
**Platform:** Web
**Implements:** PRD §12, TRD §4  ·  **Depends on:** 0001 (auth entry points), 0011 (theming tokens)
**Date:** 2026-07-09

---

## 1. Summary
The public marketing page at `/` — the only route in the `(public)` group (TRD §4) and the app's front
door for signed-out visitors. It explains what JARYQ is, who's behind it, and how to start, then hands off
to register/login. All content is server-rendered and readable without JavaScript; scroll-reveal motion is
purely decorative. See PRD §12 for behaviour.

## 2. Goals / non-goals
- **Goals:** a warm, honest single-page pitch composed of **Hero, About, HowItWorks, Features, Team, CTA,
  Footer**; two clear CTAs into `/register` and `/login`; decorative scroll-reveal that never gates content;
  full parity of readability with JS disabled and under reduced-motion.
- **Non-goals:** the listener app itself (auth-gated, other specs); blog/pricing/marketing analytics; any
  claim the product doesn't deliver (no fabricated catalogue counts or fake metrics — honest copy only).

## 3. User stories / behavior
Per PRD §12: *As a visitor I can learn what JARYQ is, who's behind it, and how to start — before signing up.*
- The page reads top-to-bottom as a narrative: hook (Hero) → mission + values (About) → 3-step onboarding
  (HowItWorks) → capability list (Features) → coordinators (Team) → conversion (CTA) → sitemap (Footer).
- Every section is present and legible with **JavaScript off** and under **reduced-motion** — motion only
  adds entrance polish, it never reveals otherwise-hidden text (PRD §12 acceptance).
- CTAs (`Тыңдауды бастау`/`Тіркелу — тегін` → `/register`; `Кіру` → `/login`) route into auth; `proxy.ts`
  bounces already-signed-in visitors to `/home`.

## 4. Design
- **`(public)/page.tsx`** — server component that renders `<LandingMotion />` (client, effect-only) then the
  seven section components in order. Sections are plain server components (no client JS of their own).
- **Sections:** `Hero` (headline + CTAs + a decorative `aria-hidden` book-cover collage), `About` (sticky
  mission + hairline value list), `HowItWorks` (3 numbered steps + connector line), `Features` (6-card
  grid), `Team` (coordinator cards), `CTA` (orange conversion band), `Footer` (brand + 3 link columns).
- **`lib/team.ts`** — `TEAM: TeamMember[]`. `Team.tsx` **filters out placeholders** (`name === "Аты-жөні"`)
  and returns `null` when none remain, so the section stays out of the page until real coordinators are
  filled in rather than shipping a wall of obvious placeholders (currently the section self-hides).
- **`LandingMotion.tsx`** — a client effect-only component (renders `null`). It queries
  `[data-scroll-reveal]` and, only when `IntersectionObserver` exists **and** reduced-motion is *not* set,
  adds `.jaryq-scroll-motion-ready` to `<html>` and observes each element, stamping
  `data-reveal-visible="true"` as it enters view. The reveal CSS (globals.css) is **scoped under
  `.jaryq-scroll-motion-ready`**, so without JS (or under reduced-motion, where the observer is skipped and
  everything is revealed at once) content is at full opacity — motion is strictly additive.

## 5. Data & interface changes
- **Data model:** none. The page reads no Supabase data; `TEAM` is a static in-repo array (`lib/team.ts`).
- **Interfaces:** no service/store/API changes. New presentational components under
  `components/landing/*` and the `TeamMember` type (`@/types`). CTAs are `next/link` to existing auth routes.

## 6. Accessibility
- **Heading order:** Hero owns the single page `h1`; each subsequent section is an `h2`, with value/step/
  feature titles as `h3` — no skipped levels (PRD §14).
- **Decorative vs content:** the Hero collage, ambient blobs, waveform SVG, connector line and value icons
  are all `aria-hidden`/empty-`alt`, carrying no meaning; every real message is live text.
- **Motion:** the global `prefers-reduced-motion` block neutralises float/drift/waveform, and
  `LandingMotion` skips the observer entirely under reduced-motion (revealing all sections at once). No
  content is hidden behind animation — the core PRD §12 contract.
- **Landmarks & links:** `<footer>` with per-column `<nav aria-label>`; all CTAs and footer links are
  focusable with a visible orange focus ring; the brand link carries an `aria-label`. Kazakh Cyrillic
  renders in Manrope/Playfair (no serif fallback).

## 7. Edge cases & failure handling
- **JS disabled / observer unsupported:** content renders fully (reveal CSS only applies once the client
  adds `.jaryq-scroll-motion-ready`); the `!("IntersectionObserver" in window)` branch reveals everything.
- **Reduced-motion:** observer never runs; all sections visible immediately.
- **Placeholder/empty team:** `Team` returns `null` (section omitted); a member with no photo falls back to a
  `User` glyph avatar, never a broken image.
- **Signed-in visitor at `/`:** redirected to `/home` by middleware (TRD §4) before the page matters.

## 8. Cost & performance
Mostly-static render (TRD §4), no data fetch, no third-party scripts — near-zero cost and fast first paint.
`LandingMotion` adds one lightweight `IntersectionObserver` that disconnects on unmount; the collage is pure
CSS/SVG (no image downloads). No new storage/bandwidth — within free tiers (TRD §12).

## 9. Test plan
- **axe/Playwright (web):** `/` passes the axe suite — one `h1`, correct heading order, labelled links,
  contrast, focus visibility.
- **No-JS / reduced-motion:** load with JS disabled and with `prefers-reduced-motion: reduce` — assert every
  section's text is visible (opacity 1) and no content is gated behind a reveal.
- **Functional:** CTAs navigate to `/register`/`/login`; `Team` hides while all members are placeholders;
  member-without-photo shows the glyph avatar.
- **Done =** the above green and PRD §12 acceptance (readable no-JS + honest copy) met.

## 10. Open questions
- When real coordinators are supplied in `lib/team.ts`, confirm photos/bios are accurate before the section
  auto-appears (no placeholder leak). Resolved-for-now: section self-hides until then.
- Should the Footer's "Платформа" links (which point at auth-gated routes) be visible pre-login? Accepted —
  they deep-link and `proxy.ts` routes signed-out clicks to `/login`.

# 0011 — Theming (Light/Dark)

**Status:** Done
**Phase:** 3
**Platform:** Web
**Implements:** PRD §15, TRD §8  ·  **Depends on:** —  ·  **Related:** TRD §9, design system §1–2
**Date:** 2026-07-09

---

## 1. Summary
The web app's colour, elevation, motion and type token system — the warm-editorial palette in which the
orange brand (`#F97316`) leads and everything else stays neutral or a restrained tint. Tokens are defined
once as CSS variables in `globals.css` (`@theme inline`), consumed by every surface, and mirrored in the
design system (§1) and mobile `designTokens.ts`. Light is the shipped theme; the `next-themes` dark
scaffolding is in place for a future toggle. See PRD §15.

## 2. Goals / non-goals
- **Goals:** a single AA-compliant **warm-editorial token set** (colour, radius, elevation, motion) that the
  whole app draws from; **brand orange as the only loud colour**; text tokens chosen for ≥4.5:1 on their real
  backgrounds; a **large-text** root-scaling setting that composes cleanly with the token sizing; and the
  `next-themes` + Tailwind `dark` variant scaffolding so a dark palette can be added without refactoring.
- **Non-goals:** a user-facing **light/dark toggle** and the `.dark` palette overrides — deliberately
  deferred (dark mode is out of scope for now per the design decision); mobile stays light-only (TRD §14).

## 3. User stories / behavior
Per PRD §15: *Both themes meet AA contrast; the warm orange brand leads; preference persists.*
- Every screen renders in the warm-editorial light theme with orange reserved for the primary action,
  active/selected state, focus rings, the brand mark, and progress fill (design system §2).
- Enabling **Үлкен мәтін** (large-text, spec 0009) scales all rem-based sizing app-wide, immediately and
  persistently, without breaking layout or contrast.
- The toast (sonner) is already theme-reactive (`useTheme()`), so it will follow the selected theme the
  moment a provider is introduced — no per-component change needed then.

## 4. Design
- **Token source — `globals.css`:** `@theme inline` declares the JARYQ tokens: `--color-jaryq-primary`
  `#F97316` (+ `-dark`/`-light`/`-soft`/`-med`), warm neutrals (`-bg-main` `#F5F5F5`, `-bg-cream` `#FFFBF5`,
  `-border-warm` `#F0E7DC`, `-ink` `#1E293B`), AA text tokens (`-text-primary`/`-secondary`/`-muted`), an
  elevation scale (`xs`→`lg` + brand `glow`/`glow-sm`), and motion tokens (`--ease-jaryq-out`/`-spring`,
  `--duration-jaryq-fast/base/slow`). shadcn's `:root` variables are themed to the same orange (`--primary`,
  `--ring` = oklch orange).
- **Root sizing:** `@layer base html { font-size: 112.5% }` sets the base scale; `html.jaryq-large-text`
  overrides it to `125%`. All sizing is rem/token-based, so one root-font change scales the whole app.
- **Large-text interplay:** `AuthProvider` subscribes to `settingsStore.largeText` and toggles the
  `jaryq-large-text` class on `<html>` (spec 0009 §4) — theming and the a11y setting share the same root
  element and never fight.
- **Dark scaffolding:** `next-themes` (`^0.4.6`) is installed; `globals.css` declares
  `@custom-variant dark (&:is(.dark *))` so `dark:` utilities compile; `ui/sonner.tsx` consumes `useTheme()`.
  A `ThemeProvider`, a `.dark { … }` override block, and a settings toggle are the remaining wiring for when
  dark ships — the architecture absorbs them by adding overrides, not rewrites.

## 5. Data & interface changes
- **Data model:** none — theming is pure client CSS/state; no Supabase schema touched.
- **Interfaces:** tokens are the CSS-variable contract in `globals.css` (mirrored in design system §1 and
  mobile `designTokens.ts`). `settingsStore` supplies `largeText` (spec 0009). `next-themes` `useTheme()` is
  consumed only by `ui/sonner.tsx` today. No new store fields or API routes.

## 6. Accessibility
- **Contrast is specified, not eyeballed:** `text-muted` is `#6B6B6B` (≥4.5:1 on both `#FFFFFF` and the
  `#F5F5F5` app background) — the AA floor for small metadata; `#888` is explicitly rejected (globals.css
  comment). `text-primary`/`text-secondary` clear AA for body. This is the PRD §14 / §15 AA bar.
- **Meaning never rides on colour alone:** status/genre accents always pair the hue with a label and/or
  icon (design system §2); orange is a signal, not the sole carrier.
- **Large-text:** the 125% root scale is a first-class a11y lever (TRD §9); it must not clip or overlap at
  either scale — verified as part of the axe/visual pass.
- **Reduced-motion:** the global `prefers-reduced-motion` block neutralises token-driven motion, so theming
  animation never becomes a barrier. Any future `.dark` overrides must re-clear AA before shipping.

## 7. Edge cases & failure handling
- **No provider yet:** `useTheme()` in the toast defaults to `"system"` (no `ThemeProvider` mounted), which
  is harmless — the toast simply follows the OS hint and the rest of the app stays light.
- **FOUC / hydration:** light is the only rendered theme, so there is no theme flash today; when a provider
  lands it must set the class pre-paint (next-themes `suppressHydrationWarning`) to avoid a flash.
- **Font fallback:** if Manrope fails, `--font-sans` falls back to `system-ui` (Cyrillic-safe), never a
  serif. rem-based tokens absorb the 125% large-text scale; any hard-coded px would not — caught in review.

## 8. Cost & performance
Zero infra cost — theming is static CSS variables, no network, no runtime theme computation; `next-themes`
is a small client dependency already bundled for the toast. No new storage or bandwidth (TRD §12).

## 9. Test plan
- **axe/Playwright (web):** the a11y suite asserts AA text contrast across auth, home, catalogue, genres,
  search, favourites, library, profile, settings and player surfaces in the shipped light theme (TRD §9).
- **Large-text visual:** toggle `jaryq-large-text` and confirm every screen scales without clipping/overlap
  and text stays AA.
- **Token integrity:** grep for ad-hoc hex outside the token block (design system §7); confirm orange is the
  only loud colour. **Done =** the above green and PRD §15's AA + orange-leads bars met.

## 10. Open questions
- When is a user-facing dark theme in scope? Deferred; requires a `ThemeProvider`, a `.dark` token override
  block, a settings toggle (0009 reserves the slot), and a fresh AA pass in dark. Resolved-for-now: not shipped.
- Should theme preference persist to the `profiles` row (cross-device) or stay in `next-themes` localStorage?
  Accepted as local-only when it lands, matching other preferences (0009), to avoid a schema change.

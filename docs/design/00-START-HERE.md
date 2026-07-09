# JARYQ Design — Start Here

This folder holds the **JARYQ design system** — the locked look and the rules that keep it
consistent across the web (`jaryq`) and mobile (`audiobook-expo`) apps. Read this file first, then
`01-design-system/jaryq-design-system.md` for the token-level spec.

> Unlike a marketing-driven product, JARYQ's design is governed by one thing above aesthetics:
> **it must be operable without sight.** Where a visual choice and an accessibility rule conflict,
> **accessibility wins.** That single rule shapes everything below.

---

## 1. What JARYQ is (for design context)

A Kazakh-language audiobook library built accessibility-first for **blind and low-vision users**, open
to everyone. The primary user often can't see the screen — so the design's real job is to be **calm,
legible, and unambiguous to a screen reader**, and pleasant to look at second.

- **Audience:** blind / low-vision Kazakhstanis (TalkBack); plus general Kazakh listeners.
- **Tone:** warm, quiet, editorial — a library, not a feed. No hype, no ads, no attention traps.
- **Platforms:** Web (Next.js + Tailwind v4 + shadcn/ui) **and** Mobile (Expo RN). Tokens are mirrored
  across both so the brand reads the same.

## 2. The design system at a glance

A **warm, editorial, light** system on a near-white base, led by a single **brand orange**. Calm
surfaces, generous type, soft elevation, and motion that decorates without ever gating content or
meaning. The signature is **restraint + legibility**: one confident accent, high contrast, big touch
targets, and everything reachable by ear.

### Locked palette (source: `apps` tokens — web `globals.css` `@theme`, mobile `theme/designTokens.ts`)

| Role | Hex | Purpose |
|---|---|---|
| `primary` | `#F97316` | Brand orange. The one accent — CTAs, active state, focus, brand. |
| `primary-dark` | `#EA580C` | Pressed / gradient end / progress fill. |
| `primary-light` | `#FB923C` | Highlights, radial CTA center. |
| `primary-soft` | `#FFF4ED` | Tinted fills, soft backgrounds. |
| `primary-med` | `#FDBA74` | Mid tint for gradients / sweeps. |
| `bg-main` | `#F5F5F5` | App background. |
| `bg-card` | `#FFFFFF` | Cards, panels, sheets. |
| `bg-cream` | `#FFFBF5` | Warm surfaces (auth, hero). |
| `text-primary` | `#0F0F0F` | Near-black primary text. |
| `text-secondary` | `#3B3B3B` | Secondary text. |
| `text-muted` | `#6B6B6B` | Metadata. **Deliberately not `#888`** — `#888` was 3.25:1 on `#F5F5F5` and failed AA; `#6B6B6B` clears 4.5:1 on white **and** `#F5F5F5`. |
| `border-light` | `#E8E8E8` | Card borders, dividers. |
| `ink` / `ink-soft` | `#1E293B` / `#F1F5F9` | Cool editorial accent (genre tiles, contrast). |

Status colours (mobile tokens): success `#16A34A`, error `#DC2626`, info `#0284C7`, each with a soft
tint. Genre tiles use six **restrained brand-tinted accents** (`lib/genreColors.ts`) — warm, so the
orange still leads; genres are never distinguished by colour alone (label + icon carry meaning).

### Typography

- **Sans / UI:** **Manrope** — self-hosted with **`latin` + `cyrillic` + `cyrillic-ext`** subsets.
  This is non-negotiable: the UI ships in Kazakh Cyrillic and a Latin-only font falls back to a system
  serif. (Geist has no Cyrillic → it is **never** the UI font.)
- **Display:** **Playfair Display** 900 (`--font-display`) — editorial headline moments only.
- **Mono:** **Geist Mono** (`--font-geist-mono`) — timers, durations, numeric/tabular labels.
- **Base size:** root `112.5%`; the **large-text** accessibility setting bumps root to `125%`
  (`html.jaryq-large-text`), scaling all rem-based sizing.
- **Mobile scale** (`designTokens.ts`): xs 13 · sm 15 · md 17 · lg 19 · xl 22 · xxl 27 · xxxl 34 ·
  display 40; weights 400–900.

### Geometry, spacing, elevation

- **Rounded, soft — not sharp.** `--radius` 0.75rem; convention: `rounded-lg` inputs/rows,
  `rounded-xl` cards/buttons, `rounded-2xl` large surfaces / full player / modals, `rounded-full`
  avatars/pills. Mobile radii: xs 6 · sm 8 · md 12 · lg 16 · xl 20 · xxl 28 · pill 999.
- **Spacing (mobile tokens):** 2 · 4 · 8 · 12 · 16 · 20 · 24 · 32 · 48.
- **Elevation is soft shadow, warm on brand:** `xs → sm → md → lg` neutral shadows plus a **brand
  `glow`** (`0 20px 40px -15px rgba(249,115,22,.38)`) reserved for covers, logos, and primary CTAs.
  The canonical card surface is `.jaryq-card` (+ `.jaryq-card-hover`) — single source of truth.

### Motion (tokens in `globals.css`)

- **Eases:** `--ease-jaryq-out` `cubic-bezier(.16,1,.3,1)` (settle) · `--ease-jaryq-spring`
  `cubic-bezier(.34,1.56,.64,1)` (pop).
- **Durations:** fast 150ms · base 220ms · slow 360ms.
- **Named motions:** page-load enter + brand sweep, scroll-reveal (`data-scroll-reveal`, auto-stagger),
  waveform pulse, cover breathe, ambient drift, shimmer skeleton, float-soft.
- **Reduced-motion is global:** a single `@media (prefers-reduced-motion: reduce)` block neutralises
  every animation, so components need no per-component guards. **Motion never carries meaning** and
  content is always present without it (scroll-reveal starts visible; the observer only *adds* motion).

## 3. The non-negotiable rules

1. **Operable without sight beats everything.** Screen-reader legibility and TalkBack/WCAG compliance
   outrank any visual preference. A pretty screen that fails a screen reader is broken.
2. **One accent.** Brand orange leads; everything else is neutral or a restrained tint. Don't introduce
   a second loud colour.
3. **Meaning never rides on colour alone.** Genres, states, and status always carry a label/icon too.
4. **Contrast is a spec, not a vibe.** Body/metadata text meets AA (≥4.5:1) on its actual background —
   this is why `text-muted` is `#6B6B6B`, not `#888`.
5. **Big touch targets.** Mobile ≥52dp (44dp small-control floor; sliders ≥44dp); web ≥44px. Give
   controls room and a hit-slop.
6. **Motion decorates, never gates.** Reduced-motion kills it globally; all content renders without JS
   or animation.
7. **Kazakh Cyrillic must render.** Keep Manrope with the cyrillic subsets as the UI font; never let a
   screen fall back to a system serif.
8. **Calm over clever.** Quiet surfaces, soft elevation, no autoplay surprises. The audio is the
   content; the chrome recedes.
9. **Web and mobile share the brand.** Tokens mirror across `globals.css` and `designTokens.ts`; a
   change to one is a change to both.

> When a value here and a mockup disagree, **this spec wins.**

## 4. Where the system lives (single source of truth)

| Concern | Web | Mobile |
|---|---|---|
| Colour / radius / shadow / motion tokens | `src/app/globals.css` (`@theme inline` + utilities) | `src/theme/designTokens.ts` |
| Fonts | `src/app/layout.tsx` (`next/font`: Manrope, Playfair, Geist Mono) | system + tokens |
| Genre accents | `src/lib/genreColors.ts` | `designTokens.ts` accent colours |
| Card / player / reveal utilities | `.jaryq-*` classes in `globals.css` | component styles |
| UI scaling | root font size + large-text class | `theme/useAppScale.ts` |
| Accessibility primitives | `.sr-only`, `.jaryq-skip-link`, focus rings, reduced-motion | `a11y` constants in `designTokens.ts` |

## 5. Surface map

`01-design-system/page-stages.md` is the **direction-agnostic inventory** of every screen/stage across
both apps — the map to reach for when scoping a new feature or checking parity.

## 6. Notes

- **This design system is derived from the shipped code**, not from an external design-tool handoff.
  There are no `.dc.html` prototypes or screenshot bundles — the running apps are the source of truth,
  and this folder documents the rules they already follow.
- **Two design generations are visible in git:** an early functional look, then an **editorial /
  anti-slop pass** (the current locked direction — warm orange restored, contrast fixed, content made
  honest). This document describes the current direction.

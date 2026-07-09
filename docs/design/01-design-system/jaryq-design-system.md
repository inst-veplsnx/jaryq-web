# JARYQ Design System — Canonical Spec

The single source of truth for JARYQ's tokens and components. Read `../00-START-HERE.md` first for the
philosophy and the nine rules; this file is the **reference detail**: exact token values and
component-level specs. Where this file and a mockup disagree, **this file wins**; where this file and
the shipped code disagree, **fix one of them** (they are meant to match — the code utilities live in
web `src/app/globals.css` and mobile `src/theme/designTokens.ts`).

---

## 1. Tokens (reference block)

```ts
// The canonical values. Web mirrors these as CSS variables in globals.css (@theme inline);
// mobile mirrors them in theme/designTokens.ts. Keep the two in sync.

export const color = {
  primary:       '#F97316',  primaryDark: '#EA580C',  primaryLight: '#FB923C',
  primarySoft:   '#FFF4ED',  primaryMed:  '#FDBA74',  primaryPressed: '#C2410C',
  bgMain:  '#F5F5F5',  bgCard: '#FFFFFF',  bgCream: '#FFFBF5',  bgSoft: '#FAFAFA',
  textPrimary: '#0F0F0F',  textSecondary: '#3B3B3B',  textMuted: '#6B6B6B',  // muted ≥4.5:1 on #F5F5F5
  textPlaceholder: '#BBBBBB',  textOnPrimary: '#FFFFFF',
  borderLight: '#E8E8E8',  borderSoft: '#EEEEEE',  divider: '#E5E5E5',  borderWarm: '#F0E7DC',
  ink: '#1E293B',  inkSoft: '#F1F5F9',
  success: '#16A34A',  error: '#DC2626',  info: '#0284C7',   // each has a *Soft tint on mobile
}

export const radius = { lg: '0.45rem', xl: '0.75rem', '2xl': '1.05rem', full: '9999px' } // web: --radius=0.75rem
// mobile radii (px): xs 6 · sm 8 · md 12 · lg 16 · xl 20 · xxl 28 · pill 999

export const space = [2, 4, 8, 12, 16, 20, 24, 32, 48] // mobile spacing scale (px)

export const type = {
  fontSans:    'Manrope',          // latin + cyrillic + cyrillic-ext  (UI — MUST carry Cyrillic)
  fontDisplay: 'Playfair Display', // 900 — editorial headlines only
  fontMono:    'Geist Mono',       // timers, durations, tabular numerics
  rootSize: '112.5%', largeText: '125%',
  // mobile sizes (px): xs 13, sm 15, md 17, lg 19, xl 22, xxl 27, xxxl 34, display 40
  // weights: 400 / 500 / 600 / 700 / 800 / 900
}

export const elevation = {
  xs:  '0 1px 2px rgba(15,15,15,.04)',
  sm:  '0 2px 8px -2px rgba(15,15,15,.06), 0 1px 2px rgba(15,15,15,.03)',
  md:  '0 12px 28px -10px rgba(15,15,15,.12), 0 2px 6px -2px rgba(15,15,15,.06)',
  lg:  '0 24px 48px -16px rgba(15,15,15,.18), 0 4px 12px -4px rgba(15,15,15,.08)',
  glow:   '0 20px 40px -15px rgba(249,115,22,.38)',   // brand — covers, logos, primary CTAs only
  glowSm: '0 10px 24px -10px rgba(249,115,22,.32)',
}

export const motion = {
  easeOut:    'cubic-bezier(.16, 1, .3, 1)',    // settle
  easeSpring: 'cubic-bezier(.34, 1.56, .64, 1)', // pop
  fast: '150ms', base: '220ms', slow: '360ms',
}

export const a11y = {  // mobile constants; web equivalents via CSS
  minTouchTarget: 52, minTouchTargetSmall: 44, sliderMinHeight: 44, focusRingWidth: 3,
  activeOpacity: 0.75,
}
```

## 2. Colour usage rules

- **Orange is the only loud colour.** Use it for the primary action, active/selected state, focus, the
  brand mark, and progress fill. Everything else is neutral (`bg-*`, `text-*`, `border-*`) or a
  restrained tint (`primary-soft`, `ink-soft`).
- **Text contrast is specified, not eyeballed:** `text-primary`/`text-secondary` for content;
  `text-muted` (`#6B6B6B`) is the floor for small metadata — **do not** use `#888` (fails AA on
  `#F5F5F5`).
- **Status colours** (success/error/info) always pair a strong hue with a soft tint background and a
  text label — never colour alone.
- **Genre accents** (`genreColors.ts`, six variants) cycle by index and stay warm/restrained; the genre
  name + icon always carry the meaning.

## 3. Type usage

- **Manrope** for all UI text. Body line-height generous (≈1.55). Titles use Manrope semibold/bold;
  **Playfair Display 900** is reserved for a few editorial headline moments (landing hero, section
  headers) — never body.
- **Geist Mono** for time codes, durations, and any tabular numerics in the player.
- Respect the **large-text** setting: never hard-code px where rem/token sizing would scale.

## 4. Component specs

### Buttons
- **Primary:** orange fill (`primary`, gradient `primary→primary-dark` for hero CTAs via
  `.jaryq-gradient-cta`), white label, `rounded-xl`, `elevation.sm`, hover lifts (`-2px`) with
  `glow-sm`. Min height meets 52dp. Pressed → `primary-pressed`.
- **Secondary / ghost:** neutral surface or transparent, `border-light`, `text-primary`.
- All buttons: visible focus ring (orange, offset), labelled, ≥52dp, `activeOpacity .75` (mobile).

### Cards — `.jaryq-card` (canonical)
White surface, `1px border-light`, `rounded-xl`, `elevation.sm`; `.jaryq-card-hover` → `elevation.md` +
`-2px` lift + orange-tinted border on hover, settles on active. **Use this class; don't re-roll card
chrome.**

### Book card
Cover (R2 image or **branded fallback** when `cover_url` is null — never a broken image), title (1–2
lines, primary), author (muted). The whole card is **one accessible target** announcing "«Title»,
author Author" to a screen reader — not a pile of separate nodes.

### Player — mini bar (`PlayerBar`)
Persistent (web: bottom; mobile: above tabs). Cover thumb + chapter/book label + play/pause + a thin
progress track. Announced as a labelled region. Lazy-loads the full player.

### Player — full (`FullPlayer` / PlayerScreen)
Large breathing cover (`cover-breathe` motion), title/author/chapter, **`.jaryq-player-range`** scrubber
(orange fill to thumb, `border-light` after; focus-visible ring; thumb scales on hover/active; height
gives a ≥44dp hit area), time codes (mono), prev/next chapter, speed (0.75×–2.0×), chapter list. Web:
opening it sets `aria-hidden` on Sidebar/MobileNav (focus trap). Mobile: scrubber is `adjustable`
(swipe up/down); chapter changes announced.

### Inputs
`rounded-lg`, `border-light`, orange focus ring; labelled (visible or `.sr-only`); error text
associated and announced. Search input hides the native WebKit clear "×" (component renders its own).

### Badges / pills
`rounded-full`, soft tint background + strong label (e.g. "Жаңа" for `is_new`). Meaning in the text,
not just the colour.

### Empty states (`EmptyState`)
Every list (search, favourites, library, genre) has a distinct, friendly empty state with an icon and a
one-line Kazakh message and (where useful) an action — never a blank screen.

### Skeletons — `.jaryq-shimmer` / `Skeleton`
Neutral block with a shimmer sweep while loading; neutralised under reduced-motion.

## 5. Accessibility primitives (build with these)

| Primitive | Web | Mobile |
|---|---|---|
| SR-only text | `.sr-only` | `accessibilityLabel` |
| Skip to content | `.jaryq-skip-link` (visible on focus) | n/a (swipe order) |
| Focus ring | orange 2–3px, offset, `:focus-visible` | 3px ring token |
| Reduced motion | global `@media (prefers-reduced-motion)` block | honour OS setting |
| Large text | `html.jaryq-large-text` → 125% root | `useAppScale` |
| Min target | CSS sizing ≥44px (52dp goal) | `a11y.minTouchTarget = 52` + hit-slop |
| Announced state | `aria-live` / role updates | announce on chapter/state change |

**Rule:** no interactive element ships without a label; no state change (play/pause, chapter turn,
buffering, favourite toggle) ships silent to a screen reader.

## 6. Motion catalogue

| Name | Where | Notes |
|---|---|---|
| page-load enter + brand sweep | route changes (`.jaryq-page-load`) | 420/620ms, easeOut; off under reduced-motion |
| scroll-reveal (auto-stagger) | landing (`[data-scroll-reveal]`, `[data-reveal-group]`) | content visible until observer *adds* motion |
| cover breathe | full player cover | subtle 1.015× loop |
| waveform pulse | hero / playing indicator | vertical bars |
| ambient drift | background blobs | slow translate |
| shimmer | skeletons | loading only |
| float-soft | decorative hero elements | loop |

All of the above are killed by the single global reduced-motion block — **do not** add motion that
conveys meaning or hides content until animated.

## 7. Platform parity checklist

When adding or restyling a surface, confirm:
- [ ] Tokens used (no ad-hoc hex); if a new token is needed, add it to **both** `globals.css` and
      `designTokens.ts`.
- [ ] Orange is the only loud colour; meaning never rides on colour alone.
- [ ] Text meets AA on its real background; muted text ≥ `#6B6B6B`.
- [ ] Every control meets its platform floor (mobile ≥52dp / web ≥44px), labelled, with a hint; state changes announced.
- [ ] Motion is decorative and reduced-motion-safe; content renders without it.
- [ ] Kazakh Cyrillic renders in Manrope (no serif fallback).
- [ ] Web: heading order correct, skip-link intact, axe suite passes.

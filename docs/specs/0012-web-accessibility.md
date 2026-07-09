# 0012 — Web Accessibility (WCAG 2.2 AA)

**Status:** Done
**Phase:** 2
**Platform:** Web
**Implements:** PRD §14, TRD §9  ·  **Depends on:** 0001-foundations
**Date:** 2026-07-09

---

## 1. Summary
Accessibility on the web app is engineered into the shell, not audited in afterwards. This spec pins the
concrete a11y substrate every screen inherits — landmarks, heading order, labelled controls, visible
focus, a skip link, reduced-motion, large-text, AA-contrast tokens, `.sr-only`, and the `FullPlayer`
focus trap — and the automated Playwright + axe-core suite that gates them. It realises the WCAG 2.2 AA
bar of PRD §14 and the accessibility architecture of TRD §9. Per PRD §2, operability without sight is
the pass/fail bar for every feature, not a nice-to-have.

## 2. Goals / non-goals
- **Goals:** semantic landmarks + one `h1`/page + correct heading order; a labelled, keyboard-operable
  control on every surface; visible focus; skip-to-content; global reduced-motion; a large-text scale
  lever; AA text tokens; and an axe-core suite that fails CI on any WCAG A/AA violation.
- **Non-goals:** mobile TalkBack (that is the Expo repo, TRD §9); per-feature UI behaviour (each feature
  spec owns its own controls); the admin CMS (0014) is admin-gated + `noindex` and outside the axe route
  run — it is labelled by hand, not axe-verified.

## 3. User stories / behavior
Per PRD §14 acceptance criteria: no screen has an unlabelled interactive control or a silent state
change; heading order is correct on every page; and the axe suite passes across the listener screens.
Observable behaviour: pressing Tab first reveals the skip link ("Мазмұнға өту") which moves focus to
`main#main-content`; a reduced-motion OS setting neutralises all animation; the "Үлкен мәтін" switch
grows every rem-based size to 125%; opening the full player hides the rest of the page from assistive tech.

## 4. Design
- **Landmarks & headings:** `AppShell` provides the semantic regions and `main#main-content`; each page
  ships exactly one `h1` and correct heading order (TRD §9).
- **Skip link:** `.jaryq-skip-link` (`globals.css`) is offscreen until focused, then anchors focus to
  `main#main-content`; the a11y test asserts Tab → focus link → Enter → focus main.
- **Reduced motion:** a global `@media (prefers-reduced-motion: reduce)` block in `globals.css` collapses
  all animation/transition durations and disables smooth scroll, so no per-component guard is needed.
- **Large text:** `html.jaryq-large-text { font-size: 125% }`; `AuthProvider` toggles the class from
  `settingsStore`, scaling all rem sizing (PRD §11, TRD §9).
- **Contrast tokens:** `--color-jaryq-text-muted: #6B6B6B` (≥4.5:1, not `#888`) is the AA lever for
  secondary/metadata text; both themes meet AA (PRD §15).
- **`.sr-only`:** the visually-hidden-but-readable utility (`globals.css`), usable outside Tailwind.
- **FullPlayer focus trap:** the full-player and chapter dialogs render as `role="dialog"` and set the
  Sidebar/MobileNav (and the rest of the page) to `aria-hidden`/`inert`; Escape closes and restores focus
  to the trigger.
- **Auto-hide nav:** `useAutoHideNavigation` hides the mobile nav after ~2.4s idle and marks it inert
  (`aria-hidden="true"` + `tabindex="-1"` on its links) while hidden, revealing + re-enabling it on
  pointer/touch/key/focus activity — so a hidden nav is never a hidden tab stop.

## 5. Data & interface changes
- **Data model:** none. Accessibility is presentation + markup only.
- **Interfaces:** `useAutoHideNavigation` hook (`src/hooks/`); the `.jaryq-skip-link` / `.sr-only` /
  `html.jaryq-large-text` / reduced-motion contracts in `globals.css`; the muted text token; and the
  fixture module `lib/a11yFixtures.ts` (`isA11yFixtureMode()`, seeded book/user/genre/chapter/progress/
  favourite data) that lets every screen render deterministic content under `NEXT_PUBLIC_A11Y_FIXTURES=1`.

## 6. Accessibility
This spec **is** the accessibility contract, so §6 is its own acceptance bar. Every listener screen must:
expose one `h1` and ordered headings; give every interactive control an accessible name (label, `aria-label`,
or `.sr-only`); keep a visible `:focus-visible` ring; be fully keyboard-operable (skip link, tab order,
arrow-key radios/sliders, dialog focus trap + restore); honour `prefers-reduced-motion`; and meet AA
contrast (muted text `#6B6B6B`). The mini-player range and settings speed radios are adjustable by
keyboard; the large-text switch is a real `role="switch"`. Done = zero axe violations across the route
run plus the interaction assertions below.

## 7. Edge cases & failure handling
- **Hidden mobile nav** must not remain a tab stop → inert while hidden, restored on activity (asserted).
- **Dialog dismissal** returns focus to the opening control; Escape closes the chapter dialog then the
  full player, each restoring focus.
- **Empty/no-result states** (search, favourites, library) render announced text, never a blank screen.
- **Fixture mode** only activates outside production (`NODE_ENV !== "production"` guard) so seeded data
  can never leak into the real app.

## 8. Cost & performance
Zero infra cost — all CSS/markup. The auto-hide nav uses passive, throttled (120ms) capture listeners.
The axe suite runs its own dev server (`NEXT_PUBLIC_A11Y_FIXTURES=1 npm run dev` on `127.0.0.1:3000`),
so it adds CI time only, never runtime cost. Self-hosted Manrope (TRD §8) keeps Cyrillic legible with no
third-party fetch.

## 9. Test plan
`tests/a11y/a11y.spec.ts` (Playwright + `@axe-core/playwright`, `playwright.config.ts`) tagged
`wcag2a/2aa/21a/21aa/22aa`:
- **axe route sweep** (zero violations): `/`, `/login`, `/register`, `/home`, `/books`,
  `/books/a11y-fixture-book`, `/search`, `/profile/settings`.
- **Interaction assertions:** skip link moves focus to `main`; login/register fields are labelled with
  predictable tab order; login/register panels stay centred and fit the viewport; mobile nav is inert
  while hidden and tabbable when revealed; settings speed radios support Tab + arrow keys; the mini-player
  range supports keyboard seeking; the full-player and chapter dialogs trap focus and restore it on Escape.
- **Done** = the suite is green.

## 10. Open questions
Known open gaps to close (some fixed recently): the card-grid heading jump (`h1`→`h3` with no `h2`) and
`/search` missing an `h1`. The axe sweep runs the routes above; extending it to genres, favourites, and
library (named in PRD §14) is tracked follow-up. None block the AA bar on the covered routes.

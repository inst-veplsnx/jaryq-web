# 0009 — Profile & Settings

**Status:** Done
**Phase:** 2
**Platform:** Both
**Implements:** PRD §11, TRD §4  ·  **Depends on:** 0001 (auth), 0006 (player)
**Date:** 2026-07-09

---

## 1. Summary
The account surface of the listener app: a read-only **Profile** that shows who's signed in and routes
onward, and a **Settings** screen that lets a listener tune playback and accessibility preferences.
Preferences live in `settingsStore` and take effect the instant they change. See PRD §11 for behaviour and
TRD §4 for where these routes sit in the `(app)` group.

## 2. Goals / non-goals
- **Goals:** show the signed-in user's name/email; give clear entry points to library, favourites,
  settings and sign-out; expose **default playback speed** (0.75×–2.0×), a **large-text** accessibility
  toggle, and an **auto-save progress** toggle; persist all three across sessions; apply changes immediately.
- **Non-goals:** editing name/email (display only here); password change (auth specs 0001); a user-facing
  **theme** toggle — theming tokens ship but the light/dark switch is deferred (dark is out of scope for
  now, see 0011 §2). Mobile offline/download settings live with the mobile offline spec.

## 3. User stories / behavior
Per PRD §11: *As a listener I can see my account and adjust playback and accessibility preferences.*
- `/profile` renders an avatar disc (first initial of name/email), the user's `full_name` (falling back to
  "Пайдаланушы") as the page `h1`, and their email; three nav cards (Кітап сөресі → `/library`, Таңдаулы →
  `/favorites`, Баптаулар → `/profile/settings`) and a **Шығу** (sign-out) button.
- `/profile/settings` exposes: **Автосақтау** (auto-save) switch, **Үлкен мәтін** (large-text) switch, and
  a **Ойнату жылдамдығы** radio group of six speeds. Changing default speed affects subsequent playback;
  toggling large-text/auto-save takes effect immediately and persists (PRD §11 acceptance).
- Sign-out clears the session and returns to the signed-out state (routed to `/login` by `proxy.ts`).

## 4. Design
- **`(app)/profile/page.tsx`** — client component reading `useAuthStore` (`user`, `signOut`). Static
  `PROFILE_LINKS` array of `next/link` cards inside a `<nav aria-label="Профиль мәзірі">`; sign-out calls
  `signOut()`. No data fetching — `user` is already hydrated by `AuthProvider`.
- **`(app)/profile/settings/page.tsx`** — client component reading `useSettingsStore`
  (`autoSave`, `largeText`, `speed` + setters). Reusable `SwitchRow` (ARIA `switch`) drives the two toggles;
  a `role="radiogroup"` of `role="radio"` buttons (`SPEED_OPTIONS = [0.75,1,1.25,1.5,1.75,2]`) drives speed.
- **`store/settingsStore.ts`** — Zustand store wrapped in `persist` (key `jaryq-settings`, `localStorage`);
  defaults `autoSave:true`, `largeText:false`, `speed:1.0`. It is the single source consumed by the player
  (default speed via `howlerService`, TRD §8) and by `AppShell`/`AuthProvider` (large-text root class).
- **Cross-surface effect:** `AuthProvider` subscribes to `largeText` and toggles `html.jaryq-large-text`
  (root font → 125%, globals.css) — so the setting scales rem-based sizing app-wide, not just this screen.

## 5. Data & interface changes
- **Data model:** none. Preferences are client-local (localStorage), never persisted to Supabase; no new
  tables/columns/RLS. `profiles.full_name`/`email` (TRD §6) are read via `authStore`, not written here.
- **Interfaces:** `settingsStore` exposes `{ autoSave, largeText, speed, setAutoSave, setLargeText,
  setSpeed }`; consumed by the player, `AuthProvider`, and this screen. `authStore.signOut()` is reused.

## 6. Accessibility
- **Profile:** exactly one `h1` (the user's name); nav cards are labelled links inside a named `<nav>`;
  the avatar disc is `aria-hidden` (decorative); sign-out is a real `<button>` with a visible-focus ring.
- **Settings:** `PageHeader` provides the `h1`; each `SwitchRow` uses `role="switch"` + `aria-checked` +
  `aria-labelledby`/`aria-describedby` and an `.sr-only` state word (Қосулы/Өшірулі) so the state is voiced.
  The speed group is a proper `radiogroup` with **roving tabindex** and Arrow/Home/End key handling; each
  radio has `aria-label="{n} есе жылдамдық"` and `aria-checked`. All controls meet the ≥52dp target, have a
  visible orange focus ring, and honour `prefers-reduced-motion` (motion-reduce variants). No control ships
  unlabelled and no toggle changes state silently — satisfies PRD §14.

## 7. Edge cases & failure handling
- No user (session expired mid-view): `proxy.ts` redirects to `/login`; the initial `?` initial protects the
  avatar. Missing `full_name` falls back to "Пайдаланушы"; missing email renders an empty line, not a crash.
- `localStorage` unavailable/blocked: `persist` degrades to in-memory defaults for the session (no throw).
- Sign-out network failure: `signOut()` is fire-and-forget (`void`); the local session still clears.
- Rehydration flash: persisted values load on mount; a control briefly shows its default before hydration
  settles — acceptable, no incorrect write occurs.

## 8. Cost & performance
Zero infra cost — no network calls, no Supabase reads/writes; everything is local state + localStorage.
No new storage or bandwidth. First paint is instant (client store, no fetch). Well within free tiers (TRD §12).

## 9. Test plan
- **axe/Playwright (web):** `/profile` and `/profile/settings` pass the axe suite against fixtures
  (`NEXT_PUBLIC_A11Y_FIXTURES=1`): one `h1`, labelled switches/radios, focus order, contrast.
- **Functional:** toggle large-text → root font scales and the value survives reload; change speed → next
  playback uses it and it persists; keyboard-drive the radio group (Arrow/Home/End) and the switches (Enter/
  Space); sign-out returns to `/login` and clears the session.
- **Done =** all of the above green and PRD §11 acceptance met.

## 10. Open questions
- Should a **theme** (light/dark) control appear here once the dark palette lands (0011)? Reserved space,
  deferred with dark mode. Resolved-for-now: not shipped.
- Should preferences sync to the `profiles` row so they follow the user across devices (currently
  device-local)? Deferred — accepted as local-only to stay within the free tier and avoid a schema change.

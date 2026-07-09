# 0019 — Mobile UI Scaling

**Status:** Done
**Phase:** 2
**Platform:** Mobile
**Implements:** PRD §14, TRD §5, §9  ·  **Depends on:** 0015 (foundations), 0016 (TalkBack)
**Date:** 2026-07-09

---

## 1. Summary
The low-vision UI-scaling layer: a `useAppScale()` hook (`theme/useAppScale.ts`) that reads two
persisted accessibility settings — **large text** and **high contrast** — from `settingsStore` and
returns a scaled typography scale (`t`) and an adjusted colour set (`c`) that components apply inline.
It is the mobile counterpart to the web **large-text** setting (PRD §11, §14; TRD §9) and rides on the
design tokens of TRD §5, giving partially-sighted users bigger type and stronger contrast without
breaking layout or touch targets.

## 2. Goals / non-goals
- **Goals:** one hook that scales font sizes and swaps in high-contrast colours from persisted
  settings, applied per-component via `{ t, c }`; keep the 52dp touch targets constant so scaling never
  shrinks a hit area; persist the preference across launches.
- **Non-goals:** reduce-motion (owned by `utils/accessibility.ts`, 0016); a dark theme (web-only,
  PRD §17 — mobile is light); the settings *screen* UI (part of Profile); text sizing is a single
  large/normal step, not a continuous slider.

## 3. User stories / behavior
Realises PRD §11/§14 for mobile: a listener turns on **large text** and every screen's type steps up
immediately and stays that way after restart; turning on **high contrast** darkens text and borders for
readability. The change is global (any screen consuming `useAppScale` re-renders) and takes effect
without a reload, matching the web acceptance criterion that accessibility toggles apply immediately and
persist.

## 4. Design
- **`theme/useAppScale.ts`** — subscribes to `settingsStore.largeText` and `settingsStore.highContrast`.
  `scale = largeText ? 1.18 : 1`. It returns `t` = the base `typography` tokens with every size
  (`xs…display`) multiplied by `scale` and rounded, and `c` = either `baseColors` or, under high
  contrast, an override set (`textPrimary #000`, `textSecondary #111`, `textMuted #333`, darker borders,
  white backgrounds). It also returns `{ scale, largeText, highContrast }`.
- **Token source (`theme/designTokens.ts`, TRD §5):** `typography` and `spacing` provide the base;
  crucially the `a11y` block (`minTouchTarget 52`, `minTouchTargetSmall 44`, `sliderMinHeight 44`) is
  **not** scaled — targets are pinned so a larger font never reduces a tap area.
- **`store/settingsStore.ts`** — Zustand persisting `keepScreenOn/autoSave/largeText/highContrast/speed`
  to `AsyncStorage` under `@audiobook_settings`. `loadSettings()` runs at boot (from `App.tsx`);
  `setLargeText`/`setHighContrast` write-through then update state, so a toggle both persists and
  re-renders every `useAppScale` consumer.
- **Consumption:** components destructure `const { t, c } = useAppScale()` and apply sizes/colours
  inline (e.g. `BookListItem`, `FormInput`, `PlayerScreen`, `AccessibleButton`), layering over the
  static `StyleSheet` so scaling composes with fixed spacing.

## 5. Data & interface changes
- **Data model:** none — preferences live in device `AsyncStorage`, not Postgres.
- **Interfaces:** the `useAppScale()` return contract (`{ t, c, scale, largeText, highContrast }`) and
  `settingsStore` (`largeText/highContrast` + their setters, alongside `keepScreenOn/autoSave/speed`),
  TRD §5, §13. These are consumed by the 0016 primitives and the 0018 player.

## 6. Accessibility
This is an accessibility feature (PRD §14). **Large text** parallels the web `html.jaryq-large-text`
125% root-font approach (TRD §9) using a 1.18 multiplier over the token scale, so Kazakh copy grows on
every screen. **High contrast** raises text/border tokens toward black on white, past the 4.5:1 AA
target. The interaction with targets is deliberate: because `a11y.minTouchTarget` (52dp) is fixed and
independent of `scale`, enlarged type still sits inside targets that always meet the minimum — layout
reflows (text wraps, rows grow via `minHeight`) rather than clipping or overlapping. Settings toggles
themselves use the `switch` role (0016). Reduce-motion is honoured separately by 0016's hook.

## 7. Edge cases & failure handling
- **First run / no stored settings:** `defaultSettings` (`largeText:false`, `highContrast:false`) apply;
  `loadSettings` merges stored values with `?? default` so a partial/corrupt payload can't crash.
- **AsyncStorage failure:** reads/writes are wrapped in try/catch and logged; the in-memory state still
  updates so the toggle visibly works even if persistence fails.
- **Large text + long Kazakh strings:** rows use `minHeight` and `numberOfLines`, so scaled text wraps
  or truncates gracefully instead of pushing controls off-screen.
- **Targets:** never scale below 52/44dp because those constants are excluded from `scale`.

## 8. Cost & performance
No infra cost — everything is on-device. `useAppScale` recomputes only `t`/`c` (cheap object builds) and
only when `largeText`/`highContrast` change, and Zustand selectors keep re-renders scoped to consuming
components. Persistence is a single small `AsyncStorage` key. No added bundle beyond the hook.

## 9. Test plan
Manual on-device: toggle **large text** → all screens' type grows immediately and survives a restart;
toggle **high contrast** → text/borders darken; with large text on, confirm buttons and rows still meet
52dp and nothing clips or overlaps (player controls, book cards, form fields); kill and relaunch to
confirm persistence. TalkBack: settings toggles announce as switches with on/off state. **Done** =
both settings apply instantly, persist, and never break targets or layout.

## 10. Open questions
None. A continuous text-size slider and honouring the OS font-scale directly are possible future
enhancements; the current single large/normal step plus high-contrast meets PRD §14 for mobile.

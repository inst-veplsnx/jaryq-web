# 0016 — Mobile TalkBack Accessibility

**Status:** Done
**Phase:** 2
**Platform:** Mobile
**Implements:** PRD §14, TRD §9  ·  **Depends on:** 0015 (foundations)
**Date:** 2026-07-09

---

## 1. Summary
The engineered TalkBack layer that makes JARYQ usable without sight on Samsung/Android — the product's
core differentiator (PRD §2, §14). It is a small set of primitives every screen composes from: the
`utils/accessibility.ts` helpers (announcements, focus, reduce-motion/screen-reader hooks, spoken
time), the `AccessibleButton` wrapper, the `a11y` constants in `designTokens.ts`, and two reference
consumers — `BookListItem` (a composite-labelled card) and `FormInput` (a labelled, error-announcing
field). It realises the mobile half of the accessibility architecture in TRD §9.

## 2. Goals / non-goals
- **Goals:** a reusable announce/focus toolkit; a button primitive that is always a labelled, hinted,
  correctly-stated `button` at ≥52dp; token constants that pin target sizes; and worked patterns for
  the two commonest widgets (list row, form field) so every screen inherits correct roles, labels,
  hints, and live-region announcements.
- **Non-goals:** the player's one-block read and adjustable scrubber (0018); UI scaling / high-contrast
  (0019, though these primitives already consume `useAppScale`); reduce-motion is honoured here but the
  animation choices live per-screen.

## 3. User stories / behavior
Realises PRD §14: *no screen has an unlabelled control or a silent state change.* A TalkBack user
swipes to any control and hears a meaningful label plus a hint on how to act; toggling password
visibility, hitting a validation error, or triggering a background failure is spoken aloud; every
tap target is large enough to land reliably. A book card reads as **one** phrase (author, title,
narrator, duration, resume point) instead of five stray fragments.

## 4. Design
- **`utils/accessibility.ts`** — `announceForAccessibility(msg)` (iOS uses
  `announceForAccessibilityWithOptions({queue:true})`, Android plain announce); `setA11yFocus(ref)`
  (moves TalkBack focus via `findNodeHandle`); `useReduceMotion()` / `useScreenReader()` live hooks;
  `plural()` for Russian numerals; `formatTime()` (`mm:ss`) and `formatTimeVoice()` which spells
  durations in full words so TTS reads "1 час 5 минут", not "1 ч".
- **`components/AccessibleButton.tsx`** — a `Pressable` fixed to `accessibilityRole="button"` with
  `accessibilityLabel` (`a11yLabel ?? label`), `accessibilityHint`, and
  `accessibilityState={{ disabled, busy: loading }}`; `minHeight: a11y.minTouchTarget` (52) plus
  `hitSlop`; the inner `Text`/`ActivityIndicator` are `accessible={false}` so the control is one node;
  press-scale animation is skipped under `useReduceMotion()`.
- **`components/BookListItem.tsx`** — one `Pressable` `button`; the cover, texts, badges and progress
  bar are all `accessible={false}`; a composite `accessibilityLabel` is joined from author–title,
  narrator, `formatTimeVoice(total_duration)`, language, and the "остановились на главе N" resume note,
  with hint "Открывает книгу".
- **`components/FormInput.tsx`** — label + `TextInput` whose `accessibilityLabel` folds in the error
  ("…Ошибка: …"); the error `<Text>` is `accessibilityRole="alert"` + `accessibilityLiveRegion="polite"`;
  the show/hide-password `TouchableOpacity` is a labelled `button` sized to `minTouchTargetSmall`.
- **`theme/designTokens.ts` `a11y`** — `minTouchTarget: 52`, `minTouchTargetSmall: 44`,
  `sliderMinHeight: 44`, `focusRingWidth: 3` — the single source these primitives size against.

## 5. Data & interface changes
- **Data model:** none.
- **Interfaces:** the `utils/accessibility.ts` exports (announce/focus/hooks/format helpers) and the
  `AccessibleButton` prop contract (`label/a11yLabel/hint/variant/disabled/loading`) become the shared
  a11y seam used across screens (TRD §9, §13). `FormInput` gains `errorA11y` for a spoken variant.

## 6. Accessibility
This spec *is* the accessibility contract (PRD §14, TRD §9): **roles** — every actionable element is
`button`, section titles are `header`, settings toggles are `switch`, and adjustable controls are
`adjustable` (scrubber, 0018); **labels + hints** — each control carries an
`accessibilityLabel` and an `accessibilityHint` ("Дважды нажмите для…"); **state** — `disabled`,
`busy`, `selected`, `checked` are set via `accessibilityState`; **composite reads** — decorative
children are `accessible={false}` so a card/field is one focus stop; **live regions** — errors and
async outcomes fire `accessibilityLiveRegion`/`announceForAccessibility`; **targets** — every tap
target meets **52dp** (44dp for secondary) with `hitSlop`; **motion** — animations gate on
`useReduceMotion()`. A feature is not done until it passes this bar.

## 7. Edge cases & failure handling
- **Double announcements on iOS:** serialised with `queue:true` so a focus change doesn't drop the
  message; Android needs no queue.
- **Missing optional fields:** `BookListItem` filters null segments so the label never reads empty
  fragments; a coverless book still announces cleanly (fallback icon is hidden from TalkBack).
- **Error toggling:** re-rendering the error text re-announces politely without stealing focus.
- **Screen reader off:** hooks default to `false`; announcements are simply no-ops.

## 8. Cost & performance
No infra cost. The helpers are pure/light; `AccessibleButton` and `BookListItem` are `React.memo`'d and
the reduce-motion path skips the `Animated.spring` work entirely, so a low-vision user on a slow device
pays no animation tax. `formatTimeVoice` runs only when a label is built, not per frame.

## 9. Test plan
Manual TalkBack pass on a Samsung device: swipe every control on each screen and confirm each has a
label + hint and no element is skipped or duplicated; toggle a form error and hear it announced;
confirm every target is comfortably tappable; verify a card reads as one phrase; turn on
reduce-motion and confirm animations stop. **Done** = zero unlabelled controls, zero silent state
changes, all roles correct.

## 10. Open questions
None. UI labels here are pragmatically Russian for TalkBack TTS coverage while visible copy is Kazakh;
a fully Kazakh spoken layer is tracked with the broader localisation work (TRD §12), not this spec.

# 0015 — Mobile Foundations

**Status:** Done
**Phase:** 0
**Platform:** Mobile
**Implements:** PRD §1–3, §17, TRD §1, §3, §5, §6  ·  **Depends on:** —
**Date:** 2026-07-09

---

## 1. Summary
The scaffold the whole Expo app stands on: the Expo 51 + React Native 0.74 entry (`App.tsx`), the
React Navigation 6 tree (`AppNavigator.tsx`), the Supabase client (`services/supabase.ts`), the four
Zustand stores, and the design-token layer (`theme/designTokens.ts`). It is the mobile half of the
**two-apps / one-backend** architecture (TRD §1, §5): it reads the same `supabase_schema.sql` and the
same Cloudflare R2 media URLs as the web app, holds no server of its own, and mirrors the web brand so
the two clients feel like one product (PRD §17).

## 2. Goals / non-goals
- **Goals:** boot the RN app behind a splash gate, wire the Stack-over-Tabs navigator, stand up a
  Supabase client with `AsyncStorage`-persisted sessions, initialise the auth/settings/download stores,
  and ship the shared design tokens (incl. the `a11y` constants every screen inherits).
- **Non-goals:** the TalkBack primitives (0016), offline downloads (0017), the player (0018), UI
  scaling (0019), and each feature screen. There is deliberately **no shared code package** with the
  web repo (TRD §1) — domain types and the schema are duplicated, parity enforced by review.

## 3. User stories / behavior
- On cold start the user sees the JARYQ splash while `authStore.initialize()` restores any persisted
  session; then the app routes to the tab shell (signed in) or the auth stack (signed out) — realising
  the roles of PRD §3 and the account continuity of PRD §1–2.
- A returning user's session survives app restarts because Supabase persists it to `AsyncStorage`.
- Every screen carries the same warm-orange brand and Cyrillic-safe type as web (PRD §17).

## 4. Design
- **`App.tsx`** — wraps the tree in `GestureHandlerRootView` + `SafeAreaProvider`. A single mount
  effect calls `authStore.initialize()`, `settingsStore.loadSettings()`, and
  `downloadStore.initialize()`. While `authStore.initializing` is true it renders the accessible splash
  (logo + `ActivityIndicator`), then hands off to `<AppNavigator isAuth={!!session} />`.
- **`AppNavigator.tsx`** — a root `createStackNavigator` swaps `Main` vs `Auth` on the `isAuth` flag,
  all under an `ErrorBoundary`. `Main` is a `createBottomTabNavigator` (HomeTab, SearchTab,
  BookshelfTab, ProfileTab); **each tab is its own Stack** (`HomeNav`/`SearchNav`/`ShelfNav`/`ProfNav`)
  so book-detail and the player push over the tab (Stack over Bottom Tabs, TRD §5). `Auth` is a Stack
  of Login + Register. `headerOpts` centralises header styling from the tokens.
- **`services/supabase.ts`** — `createClient(SUPABASE_URL, SUPABASE_ANON_KEY, …)` with
  `storage: AsyncStorage`, `autoRefreshToken`, `persistSession`, `detectSessionInUrl: false`; config
  read from `Constants.expoConfig.extra` (via `app.config.js`); `react-native-url-polyfill/auto` first.
- **`store/authStore.ts`** — Zustand v4: `user/session/initializing/authBusy/error`; `initialize()`
  does `getSession()` then subscribes to `onAuthStateChange` (a module-level `_authSubscription`
  prevents duplicate listeners); `signIn`/`signUp`/`signOut`; `fetchProfile()` loads the `profiles` row.
- **`theme/designTokens.ts`** — `colors` (brand `#F97316`), `spacing`, `radii`, `typography`, `shadows`,
  the `a11y` block (`minTouchTarget 52`, …), and `interaction`. Consumed everywhere via `useAppScale`.

## 5. Data & interface changes
- **Data model:** none new — the mobile app reads the shared `supabase_schema.sql` (six tables, RLS,
  `handle_new_user`), TRD §6. Any schema change is a cross-repo change applied here too.
- **Interfaces:** the exported `supabase` client; `useAuthStore` (`initialize/signIn/signUp/signOut`);
  the design-token exports (`colors/spacing/radii/typography/shadows/a11y/interaction`); the navigator
  param lists in `src/types`. These are the seams every later mobile spec builds on (TRD §13).

## 6. Accessibility
The foundation ships the a11y substrate every screen inherits (TRD §9). The splash view is
`accessible` with a Kazakh/Russian label and `accessibilityState={{ busy: true }}` so the loading state
is spoken, not silent. The `ErrorBoundary` fallback uses `accessibilityLiveRegion="assertive"` and
`announceForAccessibility` so a crash is voiced. Each bottom tab carries a `tabBarAccessibilityLabel`;
stack headers get the `header` role from React Navigation. Crucially, `designTokens.a11y` pins the
**52dp** minimum target (44dp small / slider, 3px focus ring) that 0016/0018/0019 enforce, and the
brand colours are chosen for legibility. No screen mounts without these primitives available.

## 7. Edge cases & failure handling
- **No/expired session:** `initialize()` sets `initializing:false` with `session:null` → auth stack;
  `getSession()` failures are caught and still clear the splash (never a stuck loader).
- **Duplicate init:** `_authSubscription` is torn down before re-subscribing; the listener survives
  sign-out so a later sign-in re-populates the store.
- **Missing Supabase config:** falls back to placeholder URL/key constants (dev), so the bundle still
  builds; real values come from `expoConfig.extra`.
- **Navigation crash:** `ErrorBoundary` catches render errors and shows a recover-and-restart message.

## 8. Cost & performance
Zero added infra: the client talks straight to the shared Supabase project and streams media from
Cloudflare R2 — both on free tiers (TRD §2, §12). No app server, no shared build step. The splash gate
blocks the tree only until session restore resolves, keeping cold-start fast on mid-range Android.

## 9. Test plan
- **Boot:** cold start with a stored session lands on the tab shell; signed-out lands on Login; the
  splash clears in both cases.
- **Session persistence:** sign in, force-quit, relaunch → still signed in (AsyncStorage).
- **Navigation:** each tab pushes BookDetail → Player and pops back; the error boundary renders on a
  forced throw.
- **Done** = app boots behind the splash, routes by auth state, persists sessions, and exposes the
  token + store seams the other mobile specs consume.

## 10. Open questions
None. The **no-shared-package** trade-off (TRD §1) is accepted; the mobile repo duplicates the domain
types and `supabase_schema.sql`, and web/mobile parity (PRD §17) is a review convention.

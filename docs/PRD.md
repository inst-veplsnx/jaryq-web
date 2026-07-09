# JARYQ — Product Requirements Document (PRD)

**Answers:** *What does JARYQ do, for whom, and what does "correct" look like?*
**Changes:** whenever a user-facing feature is added or changed. **Owner:** Product + coordinators.
**Related:** vision in `BRD.md`; architecture in `TRD.md`; per-feature detail in `docs/specs/`.

> This document describes **product behaviour and acceptance criteria**. It does not prescribe
> implementation — that lives in `TRD.md` and the specs. Where behaviour differs between the **web**
> (Next.js) and **mobile** (Expo) apps, the difference is called out explicitly; otherwise assume
> parity.

---

## 1. Product overview

JARYQ is a Kazakh-language audiobook library, delivered as two apps on one backend:

- **Web** (`jaryq`) — a public landing page, a full listening app behind auth, and an admin CMS for
  cataloguing. WCAG 2.2 AA.
- **Mobile** (`audiobook-expo`) — the listening app, engineered for TalkBack, with offline downloads
  and background audio.

The core loop is the same everywhere: **find a book → play it → the app remembers your place → come
back and continue.** Everything else (search, genres, favourites, shelves) serves that loop.

## 2. Product principles

1. **Operable without sight.** Every feature must be fully usable with a screen reader and by keyboard
   (web) / swipe navigation (mobile). This is the acceptance bar, not a nice-to-have.
2. **Never lose the listener's place.** Progress is saved continuously and restored exactly, across
   sessions and devices.
3. **Calm, not clever.** No autoplay surprises, no ads, no attention traps. The UI is quiet so the
   audio leads.
4. **Free and open catalogue.** Anyone can browse; you only need an account to save progress and
   favourites.
5. **Kazakh-first.** UI copy and content are Kazakh (Cyrillic), rendered with fonts that support it.

## 3. Roles

| Role | Can |
|---|---|
| **Guest (anon)** | Browse the public landing page; (web) the catalogue is technically public-read but the app UI is auth-gated — guests are routed to sign in. |
| **Listener (authenticated)** | Everything: play, save progress, favourite, view library and profile, change settings. |
| **Admin / cataloguer** | Everything a listener can, plus the **admin CMS**: create/edit/delete books and chapters, upload audio and covers. (Web only.) |

---

## 4. Accounts & authentication

**User story:** *As a listener, I can create an account and sign in with email + password, and recover
access if I forget my password, so my progress and favourites follow me across devices.*

- Email/password **register**, **login**, **forgot password** (email reset link), and **update
  password** (from the reset link, or while signed in).
- On registration the user provides a full name; a `profiles` row is created automatically server-side.
- Auth errors are shown in **plain Kazakh**, mapped from Supabase's English error codes — never a raw
  code or English string.
- **Web:** unauthenticated users hitting an app route are redirected to `/login`; authenticated users
  hitting an auth route are redirected to `/home`. Enforced server-side (middleware), not just in the UI.

**Acceptance criteria**
- A new user can register, is signed in, and lands on home with an empty library.
- A forgotten-password flow sends a reset email and lets the user set a new password from the link.
- Every auth form is fully operable by screen reader: labelled fields, associated error text, and a
  submit state that is announced.
- Wrong-password / duplicate-email / weak-password cases each show a specific Kazakh message.

## 5. Catalogue & book detail

**User story:** *As a listener, I can browse books by shelf (new, popular), by genre, or by search,
and open a book to see its details and chapter list before playing.*

- **Home** surfaces entry points: continue-listening (if any), curated shelves, genres.
- **Books catalogue** lists all books; **New arrivals** filters `is_new`; **Popular** filters
  `is_popular`.
- **Book detail** shows cover, title, author, narrator, description, genre, total duration, chapter
  count, and the **chapter list**; a primary action **plays** (from saved position if the user has
  progress, else chapter 1) and a control **favourites** the book.
- Covers come from Cloudflare R2; a **fallback cover** renders when `cover_url` is missing (never a
  broken image).

**Acceptance criteria**
- Every shelf and the catalogue render a list of book cards, each announcing title + author to a
  screen reader as a single meaningful label.
- Book detail's play button resumes from the saved chapter/position when progress exists.
- A book with no cover shows the branded fallback, not a broken-image icon.

## 6. Search

**User story:** *As a listener, I can search by book title, author, or narrator and get matching
results quickly.*

- Single search input; matches across **title, author, narrator**.
- Empty query shows a helpful prompt/empty state; no-results shows a distinct empty state (not a blank
  screen).
- The input exposes a single clear affordance (the native WebKit clear button is suppressed to avoid a
  double control).

**Acceptance criteria**
- Typing a known author returns that author's books.
- The empty and no-results states are distinct and both are announced to a screen reader.

## 7. Genres

**User story:** *As a listener, I can browse a list of genres and drill into one to see its books.*

- **Genres list** shows every genre with its icon; each tile carries a restrained brand-tinted accent
  (warm, so the orange brand still leads).
- **Genre detail** lists the books in that genre.

**Acceptance criteria**
- Selecting a genre shows only that genre's books; an empty genre shows an empty state.
- Genre tiles are distinguishable to low-vision users by label + icon, not by colour alone.

## 8. The player

The player is JARYQ's centre of gravity and its hardest accessibility surface.

**User story:** *As a listener, I can play a book, control playback and speed, scrub, move between
chapters, and have the app remember exactly where I stopped — all without looking at the screen.*

- **Persistent mini-player** is always present once something is playing (web: bottom bar; mobile:
  above the tab bar). Controls: play/pause, chapter title, progress.
- **Full player** (web: full-screen sheet; mobile: dedicated screen) adds: scrubber, previous/next
  chapter, **playback speed 0.75×–2.0×**, and the **chapter list**.
- **Auto-save progress periodically** (mobile ≈10s; web ≈30s) **and on lifecycle events** (chapter
  change, app background / `pagehide`, player close/teardown), upserted to `user_progress` (one row
  per user+book).
- **Auto-advance** to the next chapter when the current one ends; stops (does not loop) after the last
  chapter.
- **Resume** playback from the saved chapter and position when the user reopens a book.
- **Mobile** plays in the background and keeps the screen awake appropriately during playback.

**Accessibility acceptance criteria (the important ones)**
- The whole player is announced as one coherent block: author, book, chapter, elapsed/remaining time,
  speed.
- A **chapter change is announced** by voice.
- The scrubber is an **adjustable** control (swipe up/down on mobile; arrow keys + labelled value on
  web), not a mouse-only slider.
- Every control is individually labelled with a hint and meets its platform's minimum touch target
  (**mobile ≥52dp**; **web ≥44px**).
- Opening the full player traps focus correctly (web: sidebar/nav become `aria-hidden`); closing
  returns focus.

**Functional acceptance criteria**
- Progress restored after app restart is within a couple of seconds of where the user stopped.
- Auto-advance moves to the next chapter without user action and updates saved progress.
- Speed changes take effect immediately and persist for the session.

## 9. Favourites

**User story:** *As a listener, I can favourite books and find them again in one place.*

- Toggle favourite from book detail (and cards where shown); favourites are per-user, unique per book.
- A **Favourites** screen lists them; empty state when none.

**Acceptance criteria**
- Favouriting is reflected immediately and persists across sessions; unfavouriting removes it.
- The toggle announces its current state (favourited / not) to a screen reader.

## 10. Library / continue listening

**User story:** *As a listener, my in-progress and finished books live in one "library", so I can pick
up where I left off.*

- **Library** lists books the user has progress on, most-recent first, each showing a resume affordance
  and progress.
- **Home** surfaces a **continue-listening** card for the most recent in-progress book.

**Acceptance criteria**
- Starting a new book adds it to the library; resuming continues from the saved position.
- The continue card deep-links straight into the player at the saved place.

## 11. Profile & settings

**User story:** *As a listener, I can see my account and adjust playback and accessibility preferences.*

- **Profile** shows the user's name/email and entry points to settings and sign-out.
- **Settings** cover: **default playback speed**, **auto-save**, and **accessibility** toggles
  (**large text**, which scales the root font; reduced-motion is honoured automatically from the
  OS/browser). Preferences persist locally (`localStorage` on web). *A light/dark theme switch is
  **not** shipped — the app is a single warm-editorial light theme; see §15.*

**Acceptance criteria**
- Changing default speed affects subsequent playback; changing large-text takes effect immediately
  and persists.
- Sign-out returns the user to the signed-out state and clears the session.

## 12. Landing page (web only)

**User story:** *As a visitor, I can learn what JARYQ is, who's behind it, and how to start — before
signing up.*

- Public marketing page: **Hero, About, Features, How-it-works, Team/coordinators, CTA, Footer**.
- Scroll-reveal motion that is **purely decorative** — all content is visible without JavaScript and
  neutralised under reduced-motion.
- Clear CTA into register/login.

**Acceptance criteria**
- Every section is readable with JS disabled and under reduced-motion (no content hidden behind
  animation).
- The page states honestly what the app does; no claims the product doesn't deliver.

## 13. Admin CMS (web only)

**User story:** *As a cataloguer, I can add and maintain books and their chapters, including uploading
audio and cover files, without touching the database directly.*

- Admin area, **gated to admins only** (server-enforced), separate from the listener app.
- **Books:** create / edit / delete, with all catalogue fields (title, author, narrator, description,
  genre, flags, cover).
- **Chapters:** create / edit / delete per book (number, title, audio, duration).
- **Direct-to-R2 upload:** the client requests a presigned URL and uploads audio/cover **straight to
  Cloudflare R2** (bytes never pass through the app server); the resulting public URL is saved.
- Deleting a book cascades its chapters; the UI confirms destructive actions.

**Acceptance criteria**
- A non-admin cannot reach or act on any admin route or API (blocked server-side, not just hidden).
- A cataloguer can create a book, upload a cover and chapter audio, and that book then appears in the
  listener catalogue and plays.
- Editing metadata updates the listener-facing catalogue; deleting removes the book and its chapters.

## 14. Accessibility (cross-cutting — the acceptance bar for everything)

Accessibility is not a feature section; it is the pass/fail bar for **every** section above.

- **Web:** WCAG **2.2 AA** — semantic landmarks, one `h1` per page and correct heading order, labelled
  controls, visible focus, skip-to-content link, `prefers-reduced-motion` honoured, a **large-text**
  setting that scales rem-based sizing, and AA-contrast text tokens. Verified with a Playwright +
  axe-core suite run against fixture data.
- **Mobile:** full **TalkBack** support — `accessibilityLabel` + `accessibilityHint` on every control,
  roles (`button`, `header`, `switch`, `adjustable`), 52dp minimum targets, the player read as one
  block, chapter changes announced, and the scrubber operable by swipe-up/down.

**Acceptance criteria**
- No screen has an unlabelled interactive control or a state change that is silent to a screen reader.
- Heading order is correct on every page (no skipped levels).
- The web axe-core suite passes across the covered screens (auth, home, catalogue, search, profile,
  settings, player bar, chapter dialog); coverage is being extended to genres, favourites, and library.

## 15. Theme (web)

- JARYQ ships a **single warm-editorial light theme** — calm near-white surfaces led by the orange
  brand, AA-contrast throughout.
- A **light/dark switch is not shipped**: `next-themes` is installed and the dark variant is scaffolded
  (`@custom-variant dark` in `globals.css`), but there is no theme provider, dark palette, or toggle,
  and only the toast component reads `useTheme()`. Dark mode is **deliberately deferred** (out of scope
  for now).
- Warm orange brand (`#F97316`) leads; genre and status colours are restrained so the brand carries.

## 16. Offline mode (mobile only)

**User story:** *As a listener with unreliable data, I can download a book's chapters and listen fully
offline.*

- Per-book / per-chapter download to device storage; a downloads view shows what's saved; downloaded
  chapters play without network.

**Acceptance criteria**
- A downloaded book plays with the device offline, including chapter advance and progress save (synced
  when back online).
- Download state is announced and manageable by a screen-reader user.

## 17. Platform parity & differences

| Capability | Web | Mobile |
|---|---|---|
| Catalogue, search, genres, favourites, library, player, progress | ✅ | ✅ |
| Landing page | ✅ | — |
| Admin CMS | ✅ | — |
| Offline downloads | — | ✅ |
| Background audio | (browser-limited) | ✅ |
| Accessibility standard | WCAG 2.2 AA | TalkBack |
| Theme | single light theme (dark deferred) | single light theme |

## 18. Out of scope (product level)

- Uploads or reviews by end users; social features; recommendations/ML; multi-language UI beyond
  Kazakh; ads, paid tiers, and DRM. (See `BRD.md` §8.)

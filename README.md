# JARYQ

JARYQ is a Kazakh-language audiobook social platform. This repository contains the **Next.js 16 web version**, a companion to the React Native mobile app, sharing the same Supabase backend.

The web build adds a public landing page introducing the project, its mission, and its coordinators, alongside the full audiobook experience available on mobile.

---

## Features

- Kazakh-language audiobook library with chapters, genres, and search
- Persistent bottom audio player with a full-screen overlay
- Auto-advance to the next chapter with progress auto-save
- Authentication — login, register, forgot password, update password
- User profiles, favorites, and per-book listening progress
- Public landing page (mission, features, team, coordinators)
- Protected app area gated by server-side middleware
- Light / dark theme support
- WCAG 2.2 accessibility (Playwright + axe-core test suite)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (App Router, Turbopack) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova style) |
| UI primitives | @base-ui/react, lucide-react |
| State | Zustand v5 (`authStore`, `playerStore`, `settingsStore`) |
| Audio | Howler.js 2.2 (singleton service, browser-only) |
| Backend | Supabase (PostgreSQL + Auth + SSR cookies) |
| Media storage | Cloudflare R2 (audio files and cover images) |
| Notifications | sonner |
| Testing | Playwright + @axe-core/playwright (a11y) |
| Bundle analysis | @next/bundle-analyzer |

---

## Project Structure

```
src/
├── app/
│   ├── (public)/               # Landing page (unauthenticated)
│   ├── (auth)/                 # Login, register, forgot-password, update-password
│   ├── (app)/                  # Protected app
│   │   ├── home/
│   │   ├── books/              # Catalog + books/[id] detail page (SSR)
│   │   ├── new-arrivals/
│   │   ├── popular/
│   │   ├── genres/             # Genre list + genres/[id] filtered view
│   │   ├── search/
│   │   ├── favorites/
│   │   ├── library/            # Listening history / in-progress books
│   │   └── profile/            # User profile + profile/settings
│   ├── layout.tsx              # Root layout (fonts, ThemeProvider, AuthProvider)
│   └── globals.css             # Tailwind v4 CSS variables (no tailwind.config.ts)
├── components/
│   ├── books/                  # BookCard, BookDetail, BookListItem,
│   │                           # ContinueListeningCard, CoverImage, EmptyState
│   ├── player/                 # PlayerBar (persistent bar), FullPlayer (overlay),
│   │                           # ChapterList
│   ├── landing/                # Hero, About, Features, HowItWorks, Team,
│   │                           # CTA, Footer, LandingMotion (scroll-reveal)
│   ├── layout/                 # AppShell, MainContent, Sidebar, MobileNav,
│   │                           # Header, PageHeader, SectionTitle,
│   │                           # AuthProvider, PageLoadTransition
│   ├── auth/                   # AuthPanel (shared login/register form shell)
│   └── ui/                     # shadcn/ui primitives (Button, Badge, Slider, …)
├── hooks/
│   └── useAutoHideNavigation.ts  # Hides nav on scroll-down, shows on scroll-up
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # createSupabaseServerClient (SSR, cookie-based)
│   │   └── client.ts           # getSupabaseClient() browser singleton
│   ├── services/
│   │   └── bookService.ts      # All Supabase queries (books, chapters, genres,
│   │                           # favorites, user_progress)
│   ├── audio/
│   │   └── howlerService.ts    # Howler.js wrapper (load, play, pause, seek,
│   │                           # speed, position, duration, unload)
│   ├── authTranslations.ts     # Maps Supabase auth error codes → user-facing text
│   ├── genreColors.ts          # Accent color per genre index (UI theming)
│   ├── a11yFixtures.ts         # In-memory fixture data for a11y tests
│   ├── env.ts                  # requireEnv() — throws at boot if var is missing
│   ├── logger.ts               # Thin console wrapper (dev-only output)
│   ├── team.ts                 # TEAM constant (TeamMember[])
│   └── utils.ts                # cn(), formatTime(), formatDuration()
├── store/
│   ├── authStore.ts            # User session, signIn, signOut, signUp
│   ├── playerStore.ts          # Current book/chapter, playback state, progress
│   └── settingsStore.ts        # Playback speed, theme preference
├── types/
│   └── index.ts                # User, Book, Chapter, Genre, UserProgress,
│                               # Favorite, TeamMember
└── proxy.ts                    # Next.js 16 middleware — route protection
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm (or pnpm / yarn / bun)
- A Supabase project (URL + anon key)

### Install

```bash
npm install
```

### Configure environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

Find these under **Supabase Dashboard → Project Settings → API**.

### Database schema

Run the full schema in one query in the **Supabase SQL Editor**:

```bash
# Copy contents of supabase_schema.sql and paste into Supabase SQL Editor
```

The schema creates 6 tables, enables Row Level Security on all of them, and installs a `SECURITY DEFINER` trigger (`handle_new_user`) that automatically creates a `profiles` row whenever a new user signs up via `auth.users`.

> The schema is shared with the mobile app — coordinate any changes across both codebases.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Database Schema

| Table | Description |
|---|---|
| `genres` | Book genres (name, icon emoji) |
| `books` | Catalog entries (title, author, narrator, cover, genre, duration, `is_new`, `is_popular`) |
| `chapters` | Audio chapters per book (number, title, `audio_url`, duration) |
| `profiles` | User profile linked to `auth.users` (email, full_name) |
| `user_progress` | Per-user, per-book listening position (chapter, seconds offset). `UNIQUE(user_id, book_id)` — upserted on save. |
| `favorites` | Many-to-many: users ↔ books. `UNIQUE(user_id, book_id)`. |

**RLS summary:**
- `books`, `chapters`, `genres` — public read, no write from client
- `profiles`, `user_progress`, `favorites` — scoped to `auth.uid()`, users can only access their own rows

---

## Routing

Route groups split the app into three areas:

| Group | Path prefix | Access |
|---|---|---|
| `(public)` | `/` | Everyone |
| `(auth)` | `/login`, `/register`, `/forgot-password`, `/update-password` | Unauthenticated only (redirects logged-in users to `/home`) |
| `(app)` | `/home`, `/books`, `/genres`, `/search`, `/favorites`, `/library`, `/profile`, … | Authenticated only |

`src/proxy.ts` (Next.js 16's renamed middleware entry point) runs on every request that is not a static asset. It calls `supabase.auth.getUser()` server-side and redirects accordingly.

---

## Audio Player

The player is split into two components that are always mounted inside `AppShell`:

- **`PlayerBar`** — persistent bottom bar. Owns the Howler.js lifecycle: loads audio, manages play/pause/seek/speed, auto-saves progress to Supabase every 10 seconds, auto-advances to the next chapter on track end. Lazily loads `FullPlayer` via `next/dynamic`.
- **`FullPlayer`** — full-screen sheet overlay with chapter list and scrubber. When open, it sets `aria-hidden` on `Sidebar` and `MobileNav` via CSS selectors to satisfy WCAG focus-trap requirements.
- **`ChapterList`** — used inside `FullPlayer` to list and select chapters.

Audio state lives in `usePlayerStore` (Zustand). The Howler singleton (`howlerService`) is browser-only and includes a 15-second load timeout as a safety net against CORS silent failures.

Audio files and cover images are served from **Cloudflare R2**. The `next.config.ts` CSP and `images.remotePatterns` are pre-configured for `*.r2.cloudflarestorage.com` and `*.r2.dev`.

---

## State Management

Three Zustand v5 stores:

| Store | Responsibility |
|---|---|
| `useAuthStore` | Current user object, `signIn`, `signUp`, `signOut`, loading state |
| `usePlayerStore` | Active book/chapter, `isPlaying`, position, buffered duration, `setBook`, `setChapter`, `togglePlay`, `seekTo`, `setSpeed` |
| `useSettingsStore` | Playback speed preference, theme |

`AuthProvider` (mounted in the root layout) initialises `useAuthStore` from the Supabase session on first render and subscribes to `onAuthStateChange`.

---

## Security

Security headers are set globally in `next.config.ts` for every route:

| Header | Value |
|---|---|
| `Content-Security-Policy` | Strict — allows only self, Supabase host, Cloudflare R2, no inline eval in production |
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Permissions-Policy` | Camera, microphone, geolocation all disabled |

---

## Testing

Accessibility tests run with Playwright + axe-core against a local dev server seeded with in-memory fixture data.

```bash
# Run accessibility test suite
npx playwright test

# The dev server is started automatically by Playwright with fixture mode enabled
# NEXT_PUBLIC_A11Y_FIXTURES=1 npm run dev
```

Tests cover: auth panel, player bar, chapter list dialog, genre pages, home, favorites, library, search, profile, and settings — checking WCAG 2.0 / 2.1 / 2.2 at all levels.

Fixture data lives in `src/lib/a11yFixtures.ts` and is injected when `NEXT_PUBLIC_A11Y_FIXTURES=1` is set.

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint with ESLint |
| `npm run analyze` | Build with bundle analyzer (`ANALYZE=true`) |

---

## Deployment

The recommended target is [Vercel](https://vercel.com/new). Set the two `NEXT_PUBLIC_SUPABASE_*` environment variables in your project settings and deploy from the `main` branch.

For other platforms, any Node.js host that supports Next.js 16 will work. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

---

## Related Repositories

- **Mobile app:** React Native + Expo (separate repository), shares this project's Supabase backend and database schema.

---

## License

Private project. All rights reserved.

# JARYQ

JARYQ is a Kazakh-language audiobook social platform. This repository contains the **Next.js 16 web version**, a companion to the React Native mobile app, sharing the same Supabase backend.

The web build adds a public landing page introducing the project, its mission, and its coordinators, alongside the full audiobook experience available on mobile.

## Features

- Kazakh-language audiobook library with chapters, genres, and search
- Persistent audio player with a bottom player bar and full-screen overlay
- Authentication, user profiles, favorites, and listening progress
- Public landing page (mission, team, coordinators)
- Protected app area gated by middleware
- Light / dark theme support

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack) + React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **State:** Zustand v5 (`authStore`, `playerStore`, `settingsStore`)
- **Audio:** Howler.js (singleton service, browser-only)
- **Backend:** Supabase (PostgreSQL, Auth, Storage) — shared with the mobile app
- **Icons:** lucide-react
- **Notifications:** sonner

## Project Structure

```
src/
├── app/
│   ├── (public)/      # Landing page (unauthenticated)
│   ├── (auth)/        # Login & register
│   ├── (app)/         # Protected app: home, books, library, profile…
│   ├── layout.tsx
│   └── globals.css    # Tailwind v4 CSS variables (no tailwind.config.ts)
├── components/
│   ├── books/         # BookCard, BookDetail, ContinueListeningCard
│   ├── player/        # PlayerBar, FullPlayer, ChapterList
│   ├── landing/       # Hero, About, Features, Team, CTA, Footer
│   ├── layout/        # MainContent, MobileNav
│   └── ui/            # shadcn/ui primitives
├── lib/               # Supabase clients, audio service, team data, helpers
├── store/             # Zustand stores
├── types/             # Shared TS types
└── middleware.ts      # Route protection for app pages
```

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

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
```

You can find these under **Supabase Dashboard → Project Settings → API**.

### Database schema

The Supabase schema is checked in at [supabase_schema.sql](supabase_schema.sql). Tables used by the app:

`genres`, `books`, `chapters`, `profiles`, `user_progress`, `favorites`

> The schema is shared with the mobile app — do not modify it here without coordinating with the mobile codebase.

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts

| Command           | Purpose                                  |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start the development server (Turbopack) |
| `npm run build`   | Production build                         |
| `npm run start`   | Run the production build                 |
| `npm run lint`    | Lint with ESLint                         |
| `npm run analyze` | Build with bundle analyzer enabled       |

## Routing

Route groups split the app into three areas:

- **`(public)/`** — landing page, accessible to everyone
- **`(auth)/`** — login and register
- **`(app)/`** — protected pages (home, books, genres, favorites, library, search, profile, …)

`src/middleware.ts` redirects unauthenticated users away from `(app)/` routes.

## Audio Player

- A persistent bottom bar ([PlayerBar.tsx](src/components/player/PlayerBar.tsx)) stays mounted across navigations.
- A full-screen overlay ([FullPlayer.tsx](src/components/player/FullPlayer.tsx)) provides the immersive view with chapter list and controls.
- Playback is driven by a Howler.js singleton in [src/lib/audio/howlerService.ts](src/lib/audio/howlerService.ts) (instantiated only in the browser).
- Player state lives in the Zustand `playerStore`.

## Deployment

The recommended target is [Vercel](https://vercel.com/new). Set the two `NEXT_PUBLIC_SUPABASE_*` variables in your project settings and deploy from the main branch.

For other platforms, any Node.js host that supports Next.js 16 will work — see the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying).

## Related Repositories

- **Mobile app:** React Native + Expo (separate repository), shares this project's Supabase backend.

## License

Private project. All rights reserved.

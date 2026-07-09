# JARYQ — Page & Stage Inventory

A **direction-agnostic** list of every screen/stage across both apps — the map for scoping a feature,
checking web/mobile parity, or making sure a new surface has a home. It says *what screens exist*, not
*how they look* (that's the design system).

Legend: **W** = web (`jaryq`) · **M** = mobile (`audiobook-expo`).

---

## Persistent chrome (always mounted)

| Element | W | M | Notes |
|---|---|---|---|
| App shell (nav + header) | ✅ `AppShell` (Sidebar / MobileNav / Header) | ✅ Bottom Tabs + headers | Hosts everything below. |
| Mini-player | ✅ `PlayerBar` (bottom) | ✅ mini-player (above tabs) | Survives navigation; owns playback. |
| Full player | ✅ `FullPlayer` (sheet overlay) | ✅ `PlayerScreen` | Scrubber, speed, chapter list. |
| Chapter list | ✅ `ChapterList` (in full player) | ✅ (in player) | Select/jump chapters. |
| Toasts | ✅ sonner (`ToasterClient`) | — | Non-blocking feedback. |
| Skip-to-content | ✅ `.jaryq-skip-link` | — (swipe order) | A11y. |

## Public / marketing (web only)

| Stage | Route | Sections |
|---|---|---|
| Landing | `/` (`(public)`) | Hero · About · Features · HowItWorks · Team/coordinators · CTA · Footer (`LandingMotion` scroll-reveal) |

## Auth

| Stage | W route | M screen |
|---|---|---|
| Login | `/login` | `LoginScreen` |
| Register | `/register` | `RegisterScreen` |
| Forgot password | `/forgot-password` | (auth flow) |
| Update / reset password | `/update-password` | (auth flow) |

Shared web shell: `(auth)/layout.tsx` + `AuthPanel`. All fields labelled; errors in Kazakh
(`authTranslations`).

## Listening app (auth-gated)

| Stage | W route | M screen | Purpose |
|---|---|---|---|
| Home | `/home` | `HomeScreen` | Continue-listening + shelves + genres entry. |
| Catalogue | `/books` | (catalogue lists) | All books. |
| Book detail | `/books/[id]` | `BookDetailScreen` | Metadata + chapter list + play/favourite. |
| New arrivals | `/new-arrivals` | `lists/` Новинки | `is_new`. |
| Popular | `/popular` | (shelf) | `is_popular`. |
| Genres | `/genres` | `lists/` Жанры | Genre grid (accent tiles). |
| Genre detail | `/genres/[id]` | (filtered list) | Books in a genre. |
| Search | `/search` | `SearchScreen` | Title / author / narrator. |
| Favourites | `/favorites` | `lists/` Избранное | Saved books. |
| Library / shelf | `/library` | `lists/` Полка | In-progress + history. |
| Profile | `/profile` | `ProfileScreen` | Account + entry to settings/sign-out. |
| Settings | `/profile/settings` | (in Profile) | Speed · auto-save · large-text (single light theme; no toggle). |

## Admin CMS (web only)

| Stage | Route | Purpose |
|---|---|---|
| Admin home | `/admin` (`(admin)`) | Book list / dashboard, admin-guarded. |
| New book | `/admin/books/new` | Create book (`BookForm`). |
| Edit book | `/admin/books/[id]` | Edit book + chapters, delete (`DeleteBookButton`), R2 upload. |
| Admin API | `/api/admin/books`, `/api/admin/chapters`, `/api/admin/presign` | Service-role CRUD + presigned upload. |

## System / edge states

| Stage | W | M | Notes |
|---|---|---|---|
| Loading | Skeletons (`Skeleton`, `.jaryq-shimmer`), `PageLoadTransition` | `SkeletonLoader` | Every async surface. |
| Empty | `EmptyState` (search/favourites/library/genre) | empty states | Distinct, friendly, Kazakh. |
| Error | `error.tsx` | inline errors | Recoverable. |
| Not found | `not-found.tsx` | — | 404. |
| Offline | — | download states / offline player | `downloadStore`, mobile only. |

## Mobile-only stages

| Stage | Purpose |
|---|---|
| Downloads / offline | Manage downloaded chapters (`downloadService` + `downloadStore`). |
| Background playback | expo-av background mode + keep-awake during play. |

---

**Parity note:** the listening app (home → search → genres → detail → player → favourites → library →
profile/settings) is **fully mirrored** across W and M. Landing and Admin are **web-only**; offline and
background audio are **mobile-only** — by design (`PRD.md` §17).

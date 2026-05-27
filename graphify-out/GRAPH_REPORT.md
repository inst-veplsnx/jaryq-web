# Graph Report - .  (2026-05-27)

## Corpus Check
- Corpus is ~26,401 words - fits in a single context window. You may not need a graph.

## Summary
- 431 nodes · 907 edges · 27 communities (16 shown, 11 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.92)
- Token cost: 9,800 input · 2,100 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Audio Engine & Book Display|Audio Engine & Book Display]]
- [[_COMMUNITY_Book UI Components|Book UI Components]]
- [[_COMMUNITY_App Shell & Navigation|App Shell & Navigation]]
- [[_COMMUNITY_Landing Page & Marketing|Landing Page & Marketing]]
- [[_COMMUNITY_Package Dependencies|Package Dependencies]]
- [[_COMMUNITY_Auth UI & User Flow|Auth UI & User Flow]]
- [[_COMMUNITY_Book Detail Page|Book Detail Page]]
- [[_COMMUNITY_Books Pages & SSR|Books Pages & SSR]]
- [[_COMMUNITY_Path Aliases & Component Registry|Path Aliases & Component Registry]]
- [[_COMMUNITY_Accessibility Test Suite|Accessibility Test Suite]]
- [[_COMMUNITY_Root Layout & Fonts|Root Layout & Fonts]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_A11Y Test Fixtures|A11Y Test Fixtures]]
- [[_COMMUNITY_Test Results|Test Results]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_PostCSS Config|PostCSS Config]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_ESLint Root|ESLint Root]]
- [[_COMMUNITY_PostCSS Root|PostCSS Root]]
- [[_COMMUNITY_TypeScript Root Config|TypeScript Root Config]]
- [[_COMMUNITY_Component JSON Root|Component JSON Root]]
- [[_COMMUNITY_Supabase Schema|Supabase Schema]]
- [[_COMMUNITY_Playwright Root Config|Playwright Root Config]]
- [[_COMMUNITY_AutoHide Navigation Hook|AutoHide Navigation Hook]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 35 edges
2. `useAuthStore` - 30 edges
3. `bookService` - 26 edges
4. `Book` - 24 edges
5. `PlayerBar()` - 19 edges
6. `PageHeader()` - 17 edges
7. `BookDetail()` - 17 edges
8. `compilerOptions` - 16 edges
9. `BookCard` - 16 edges
10. `EmptyState()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `README — JARYQ Next.js web platform overview` --references--> `useSettingsStore`  [EXTRACTED]
  README.md → src/store/settingsStore.ts
- `README — JARYQ Next.js web platform overview` --references--> `useAuthStore`  [EXTRACTED]
  README.md → src/store/authStore.ts
- `README — JARYQ Next.js web platform overview` --references--> `howlerService`  [EXTRACTED]
  README.md → src/lib/audio/howlerService.ts
- `README — JARYQ Next.js web platform overview` --references--> `usePlayerStore`  [EXTRACTED]
  README.md → src/store/playerStore.ts
- `signIn Action (authStore)` --shares_data_with--> `DB Table: profiles`  [INFERRED]
  src/app/(auth)/login/page.tsx → supabase_schema.sql

## Hyperedges (group relationships)
- **Auth Flow Pages (Login, Register, ForgotPassword, UpdatePassword)** — login_page_loginpage, register_page_registerpage, forgot_password_page_forgotpasswordpage, update_password_page_updatepasswordpage [EXTRACTED 1.00]
- **Auth Store Actions (signIn, signUp, resetPassword, updatePassword)** — login_page_signinaction, register_page_signupaction, forgot_password_page_resetpasswordaction, update_password_page_updatepasswordaction [EXTRACTED 1.00]
- **AuthPanel shared by all auth pages** — login_page_loginpage, register_page_registerpage, forgot_password_page_forgotpasswordpage, update_password_page_updatepasswordpage, login_page_authpanel [EXTRACTED 1.00]
- **User-owned DB tables with RLS (profiles, user_progress, favorites)** — schema_table_profiles, schema_table_user_progress, schema_table_favorites [EXTRACTED 1.00]
- **Public readable catalog tables (genres, books, chapters)** — schema_table_genres, schema_table_books, schema_table_chapters [EXTRACTED 1.00]
- **Landing Page Sections** — public_page_hero, public_page_about, public_page_howitworks, public_page_features, public_page_team, public_page_cta, public_page_footer, public_page_landingmotion [EXTRACTED 1.00]
- **Home page data: bookService + authStore + playerStore** — home_page_homepage, home_page_bookservice, home_page_useauthstore, home_page_useplayerstore [EXTRACTED 1.00]
- **Book Listing Pages (shared pattern: bookService + PageHeader + BookCard + EmptyState + Skeleton)** — newarrivals_page_newarrivalspage, popular_page_popularpage, genres_id_page_genrebookspage, favorites_page_favoritespage [INFERRED 0.95]
- **Auth-Gated Pages (guard: user check before bookService call)** — favorites_page_favoritespage, library_page_librarypage [INFERRED 0.95]
- **AppShell Layout Composition** — layout_appshell_appshell, layout_sidebar_sidebar, layout_mobilenav_mobilenav, layout_maincontent_maincontent, player_playerbar_playerbar [EXTRACTED 1.00]
- **Skeleton Component Family** — ui_skeleton_skeleton, ui_skeleton_skeletontext, ui_skeleton_skeletoncover, ui_skeleton_skeletoncircle [EXTRACTED 1.00]
- **Pages Consuming Auth Store** — favorites_page_favoritespage, library_page_librarypage, profile_page_profilepage, layout_header_header, layout_authprovider_authprovider [EXTRACTED 1.00]
- **Base UI Primitive Wrappers** — ui_button_button, ui_badge_badge, ui_separator_separator, ui_slider_slider [EXTRACTED 1.00]
- **Book Display Components (card/list/detail views)** — books_bookcard_bookcard, books_booklistitem_booklistitem, books_bookdetail_bookdetail, books_coverimage_coverimage [INFERRED 0.95]
- **Audio Player Component System (mini + full + chapters)** — player_playerbar_playerbar, player_fullplayer_fullplayer, player_chapterlist_chapterlist [EXTRACTED 1.00]
- **Landing Page Section Components** — landing_hero_hero, landing_about_about, landing_features_features, landing_howitworks_howitworks, landing_team_team, landing_cta_cta, landing_footer_footer, landing_landingmotion_landingmotion [INFERRED 0.95]
- **Components sharing playerStore state** — player_playerbar_playerbar, player_fullplayer_fullplayer, books_bookdetail_bookdetail [EXTRACTED 1.00]
- **Components implementing progress bar UI pattern** — books_bookcard_bookcard, books_booklistitem_booklistitem, books_bookdetail_bookdetail, books_continuelisteningcard_continuelisteningcard [EXTRACTED 1.00]
- **App Navigation Layout Components (sidebar + mobile nav + page transition)** — layout_sidebar_sidebar, layout_mobilenav_mobilenav, layout_pageloadtransition_pageloadtransition [INFERRED 0.95]
- **Landing components using data-scroll-reveal pattern** — landing_hero_hero, landing_about_about, landing_features_features, landing_howitworks_howitworks, landing_team_team, landing_footer_footer, landing_landingmotion_landingmotion [EXTRACTED 1.00]
- **Zustand State Stores (auth, player, settings)** — store_authstore_useauthstore, store_playerstore_useplayerstore, store_settingsstore_usesettingsstore [EXTRACTED 1.00]
- **Supabase Domain Types (Book, Chapter, Genre, UserProgress, Favorite, User)** — types_index_book, types_index_chapter, types_index_genre, types_index_userprogress, types_index_favorite, types_index_user [EXTRACTED 1.00]
- **Environment Variable Validation (server + client pattern)** — lib_env_requireenv, lib_env_requireenvvalue, lib_supabase_server_createclient, lib_supabase_client_getsupabaseclient [EXTRACTED 1.00]
- **A11Y Fixture System (deterministic offline test data + Playwright spec)** — lib_a11yfixtures_fixtures, lib_a11yfixtures_isa11yfixture, lib_a11yfixtures_searcha11y, tests_a11y_spec [INFERRED 0.95]
- **JARYQ Brand Identity (logo + favicon, orange audiobook theme)** — public_logo, public_favicon [INFERRED 0.95]

## Communities (27 total, 11 thin omitted)

### Community 0 - "Audio Engine & Book Display"
Cohesion: 0.08
Nodes (44): howlerService, BookCardProps, BookDetail(), BookDetailProps, ChapterRow, ChapterRowProps, BookListItemProps, ContinueListeningCard() (+36 more)

### Community 1 - "Book UI Components"
Cohesion: 0.15
Nodes (31): BookCard, BookListItem, EmptyState(), EmptyStateProps, Tone, toneStyles, Auth-Gated Page Pattern, Book Listing Page Pattern (+23 more)

### Community 2 - "App Shell & Navigation"
Cohesion: 0.07
Nodes (33): AppLayout(), AppShell Component, AuthLayout(), Auto-save Progress Pattern, Mini Player + Full Player Sheet Pattern, EMPTY_NAVIGATION_REFS, MOBILE_ACTIVITY_EVENTS, useAutoHideNavigation() (+25 more)

### Community 3 - "Landing Page & Marketing"
Cohesion: 0.08
Nodes (29): Scroll Reveal Animation Pattern, About(), Tone, TONES, values, CTA(), Features, Tone (+21 more)

### Community 4 - "Package Dependencies"
Cohesion: 0.05
Nodes (36): dependencies, @base-ui/react, class-variance-authority, clsx, howler, lucide-react, next, next-themes (+28 more)

### Community 5 - "Auth UI & User Flow"
Cohesion: 0.12
Nodes (26): AUTH_INPUT_CLASS constant, AuthPanel(), AuthPanelProps, ForgotPasswordPage(), resetPassword Action (authStore), Header(), HeaderProps, translateAuthError() (+18 more)

### Community 6 - "Book Detail Page"
Cohesion: 0.11
Nodes (23): BookDetailPage(), generateMetadata(), getBook(), getChapters(), Props, csp, nextConfig, withBundleAnalyzer (+15 more)

### Community 7 - "Books Pages & SSR"
Cohesion: 0.13
Nodes (23): BookDetail Component, Book Detail Page (SSR), createSupabaseServerClient (SSR data fetch), AllBooksPage(), EmptyState Component, PageHeader Component, BookCard Component, bookService (data access layer) (+15 more)

### Community 8 - "Path Aliases & Component Registry"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 9 - "Accessibility Test Suite"
Cohesion: 0.09
Nodes (17): AXE_TAGS, before, chapterDialog, chapterTrigger, currentSpeed, fullPlayer, fullPlayerTrigger, largeTextSwitch (+9 more)

### Community 10 - "Root Layout & Fonts"
Cohesion: 0.12
Nodes (16): AuthProvider Component (global wrapper), geistMono, geistSans, metadata, playfair, RootLayout(), Toaster (global notification component), viewport (+8 more)

### Community 11 - "TypeScript Compiler Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 12 - "A11Y Test Fixtures"
Cohesion: 0.18
Nodes (6): a11yFixtureBooks, a11yFixtureChapters, a11yFixtureFavorites, a11yFixtureGenres, a11yFixtureProgress, a11yFixtureUser

## Knowledge Gaps
- **178 isolated node(s):** `eslintConfig`, `config`, `target`, `lib`, `allowJs` (+173 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **11 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `useAuthStore` connect `Auth UI & User Flow` to `Audio Engine & Book Display`, `Book UI Components`, `App Shell & Navigation`, `Book Detail Page`, `Books Pages & SSR`, `Root Layout & Fonts`?**
  _High betweenness centrality (0.095) - this node is a cross-community bridge._
- **Why does `HomePage()` connect `Books Pages & SSR` to `Audio Engine & Book Display`, `Auth UI & User Flow`, `Book Detail Page`?**
  _High betweenness centrality (0.060) - this node is a cross-community bridge._
- **Why does `cn()` connect `Audio Engine & Book Display` to `Book UI Components`, `Root Layout & Fonts`, `App Shell & Navigation`, `Auth UI & User Flow`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `PlayerBar()` (e.g. with `BookDetail()` and `ContinueListeningCard()`) actually correct?**
  _`PlayerBar()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `eslintConfig`, `config`, `target` to the rest of the system?**
  _178 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Audio Engine & Book Display` be split into smaller, more focused modules?**
  _Cohesion score 0.08243727598566308 - nodes in this community are weakly interconnected._
- **Should `App Shell & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.0743321718931475 - nodes in this community are weakly interconnected._
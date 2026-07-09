# NNNN — <Feature title>

**Status:** Draft | Approved | In progress | Done
**Phase:** <roadmap phase, if applicable>
**Platform:** Web | Mobile | Both
**Implements:** PRD §<x>, TRD §<y>  ·  **Depends on:** <other specs, if any>
**Date:** YYYY-MM-DD

---

## 1. Summary
One paragraph: what this feature is and why we're building it. Link to PRD/TRD rather than restating.

## 2. Goals / non-goals
- **Goals:** the specific outcomes this spec delivers.
- **Non-goals:** what is explicitly out of scope (and where it lives instead).

## 3. User stories / behavior
The observable behavior this delivers (listener- or operator-facing). Reference PRD acceptance criteria.

## 4. Design
How it works: components/screens touched, data flow, state, interfaces. Reference TRD subsystems by
number. Call out new tables/columns, new services, new API routes, new stores.

## 5. Data & interface changes
- **Data model:** new/changed tables, columns, indexes, RLS policies (remember: schema is shared —
  changing it touches both repos).
- **Interfaces:** new/changed functions in `bookService` / audio service / stores / `/api/admin/*`.

## 6. Accessibility
The a11y contract for this feature: labels/roles/announcements (mobile TalkBack), heading order + focus
+ contrast + reduced-motion (web WCAG 2.2 AA). **A feature is not done until this passes.**

## 7. Edge cases & failure handling
Offline, network errors, timeouts, empty states, missing media (fallback cover), idempotency
(progress/favourites upsert), partial failures.

## 8. Cost & performance
Impact on infra cost (must stay within free tiers) and latency (audio start, first paint). Any new
storage or bandwidth.

## 9. Test plan
How correctness is verified (Playwright/axe for web a11y, manual TalkBack for mobile, functional
checks). What "done" looks like.

## 10. Open questions
Anything unresolved. Resolve before moving to implementation.

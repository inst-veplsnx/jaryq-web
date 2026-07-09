# JARYQ — Business Requirements Document (BRD)

**Answers:** *Why does JARYQ exist, who is it for, and how do we measure success?*
**Changes:** rarely (vision/mission level). **Owner:** Project coordinators.
**Related:** product details in `PRD.md`; technical realization in `TRD.md`.

---

## 1. Vision

Kazakh-language books should be **listenable by everyone — starting with the people print leaves
behind.** JARYQ (Kazakh *жарық* — "light") is the audiobook library built first for blind and
low-vision Kazakhstanis, and open to everyone. Not an accessibility mode bolted onto a sighted app —
an app whose **primary user cannot see the screen**, and works flawlessly anyway.

## 2. Problem & insight

Kazakh-language audio content is scarce, scattered across ad-driven players and social feeds, and
almost none of it is built to be operated without sight. Mainstream audiobook apps are visual-first:
screen-reader support is an afterthought, controls are unlabelled, and state changes (chapter turns,
buffering, playback speed) are silent to a screen reader. For a blind user that is the difference
between *usable* and *unusable*. The insight: **if the app is designed so the primary user never needs
the screen, it is better for everyone** — and it becomes the obvious home for Kazakh audiobooks.

## 3. Value proposition

- **For blind / low-vision users:** a Kazakh audiobook library they can operate entirely by ear —
  every control labelled, every state change announced, offline so it works without reliable data.
- **For all listeners:** a calm, ad-free, free library of narrated Kazakh books that remembers where
  they stopped and continues on any device.
- **The wedge:** accessibility done *properly* is rare and hard to copy. It is the reason the app is
  trusted and recommended inside a community that talks to each other — that word of mouth is the
  growth loop.

## 4. Target users

- **Primary:** blind and low-vision users in Kazakhstan who rely on Samsung / Android **TalkBack**.
- **Secondary:** sighted Kazakh-language listeners (commuters, students, readers) who want narrated
  books; institutions (libraries, schools for the visually impaired) who recommend or deploy the app.
- **Operators:** coordinators and cataloguers who add books, chapters, and cover art via the admin CMS.

## 5. Monetization

**None. JARYQ is free and mission-driven.** No ads, no subscription, no in-app purchase, no
purchasable advantage. This is a deliberate constraint: the audience includes people for whom a
paywall is an access barrier, and the credibility that drives word-of-mouth depends on the app being
plainly for them, not for revenue.

**Sustainability (out of scope for the product, tracked here):** running cost is deliberately near-zero
(Supabase free tier + Cloudflare R2's 10 GB free tier + static web hosting). Future funding, if needed,
comes from **grants, sponsors, or institutional licensing** — never from degrading the free user
experience. Revisit only as a deliberate strategy change with coordinator sign-off.

## 6. Success metrics (KPIs)

- **Reach:** monthly active listeners, registrations, catalogue size (books + chapters available).
- **Accessibility quality (the core metric):** % of screens passing a TalkBack/WCAG 2.2 AA audit;
  count of unlabelled controls or silent state changes (target: zero); reported screen-reader defects.
- **Engagement:** listening minutes per active user, books started vs. finished, continue-listening
  return rate, offline downloads (mobile).
- **Trust:** qualitative feedback from the low-vision community and partner institutions.
- **Unit economics:** monthly infrastructure cost must stay within the free tiers (or a small grant
  budget) — cost per listener trends toward zero.

## 7. Guardrails / principles

- **Accessibility is non-negotiable.** A screen that fails TalkBack or WCAG 2.2 AA is not shippable,
  regardless of visual polish.
- **Free means free.** No ads, no paywall, no advantage for pay — ever.
- **Cost discipline.** Buy nothing that a free tier covers; media on R2, not in the repo. The whole
  system is designed to run at near-zero marginal cost so "free forever" is credible.
- **Kazakh-first.** The UI ships in Kazakh (Cyrillic); fonts and content are chosen to render it
  correctly, not to fall back to a system serif.

## 8. Out of scope (business level)

- **Advertising and paid tiers** — excluded to preserve the free, access-first mission.
- **User-generated content / social feed** — JARYQ is a curated library, not a platform for uploads.
- **Non-Kazakh-first expansion** — other languages are a possible future, not a current goal.
- **DRM / hard content protection** — the catalogue is public-read by design; protecting it with DRM
  would work against the accessibility and cost goals.

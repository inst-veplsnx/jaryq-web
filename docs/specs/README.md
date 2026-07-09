# Specs

One **detailed, implementation-level spec per feature**. Specs are where the *exactly how* of a single
piece of work lives — scoped tightly enough to become one implementation plan.

## How specs relate to the other docs

```
BRD (why) → PRD (what) → TRD (how, system-wide) → spec (exactly how, this feature) → plan → build
```

A spec **links up** to the PRD/TRD sections it implements; it does not restate them. If a spec needs a
product decision, it belongs in the PRD; if it needs an architecture change, update the TRD.

## Conventions

- **Numbering:** `NNNN-short-slug.md`, zero-padded, monotonically increasing (`0001`, `0002`, …).
- **Platform:** each spec states Web / Mobile / Both. Cross-platform features are built in both repos.
- **Schema is shared:** any data-model change in a spec applies to `jaryq` **and** `audiobook-expo`.
- **Accessibility gates done:** every spec carries an Accessibility section; a feature that regresses
  TalkBack (mobile) or WCAG 2.2 AA (web) is not done.
- **Lifecycle:** `Draft → Approved → In progress → Done` (track in the spec's Status line).
- **New feature:** copy `_TEMPLATE.md` → next number → fill in → get approval → plan → build.

> These `0001`–`0019` specs are **back-specs**: written after the fact to document already-shipped
> features at implementation depth. New work starts at `0020`.

## Index

| # | Spec | Phase | Platform | Status |
|---|---|---|---|---|
| 0001 | `0001-foundations.md` | 0 | Both | Done |
| 0002 | `0002-auth.md` | 0 | Both | Done |
| 0003 | `0003-catalogue-book-detail.md` | 1 | Both | Done |
| 0004 | `0004-search.md` | 1 | Both | Done |
| 0005 | `0005-genres.md` | 1 | Both | Done |
| 0006 | `0006-web-player.md` | 1 | Web | Done |
| 0007 | `0007-favorites.md` | 1 | Both | Done |
| 0008 | `0008-library-continue-listening.md` | 1 | Both | Done |
| 0009 | `0009-profile-settings.md` | 2 | Both | Done |
| 0010 | `0010-landing.md` | 3 | Web | Done |
| 0011 | `0011-theming.md` | 3 | Web | Done |
| 0012 | `0012-web-accessibility.md` | 2 | Web | Done |
| 0013 | `0013-security-hardening.md` | 3 | Web | Done |
| 0014 | `0014-admin-cms.md` | 4 | Web | Done |
| 0015 | `0015-mobile-foundations.md` | 0 | Mobile | Done |
| 0016 | `0016-mobile-talkback.md` | 2 | Mobile | Done |
| 0017 | `0017-mobile-offline.md` | 1 | Mobile | Done |
| 0018 | `0018-mobile-player.md` | 1 | Mobile | Done |
| 0019 | `0019-mobile-ui-scaling.md` | 2 | Mobile | Done |

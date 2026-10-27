---
title: 'Rubric review: FlashFlip MVP architecture spine'
reviewed: architecture-flashflip.md (status draft, 2026-10-28)
requirement_source: brief-flashflip/brief-flashflip.md (initiative ticket has no Requirements; PRD is an empty draft)
date: 2026-10-28
verdict: revise
---

# Rubric review: FlashFlip MVP architecture spine

## Verdict: REVISE (sound core, gaps at the edges)

The domain core is strong. AD-1 and AD-3 through AD-8 pin the divergence points that matter most for a parse / quiz / score / retry loop: one parser, one storage adapter with a versioned key, one state owner, shuffle-once with injected randomness, and a derived score. I checked the Next.js 16.4-specific claims against the installed docs and they hold. The weak parts are at the edges. The operational envelope says "deploy with Vercel" but the repo cannot do that yet, and it says nothing on how the demo is run or recovered. The paste-to-deck-to-textarea round trip has a seam that two units could each fill. The test toolchain is named but not wired up. Several "only X may Y" rules have no mechanical check.

## Verification log (what was checked, not assumed)

| Claim | Evidence | Result |
| --- | --- | --- |
| Next 16.4.3, React/React DOM 19.3.0, TS 5.9.3, Tailwind 4.3.3, `@tailwindcss/turbopack` 4.3.3 | `package.json`, installed `node_modules/*/package.json` | Match |
| `ensureStatic = 'navigation'` exists and needs `cacheComponents` | `next/dist/docs/.../route-segment-config/ensureStatic.md` (introduced v16.4.0; build fails without `cacheComponents`; `'navigation'` does not need Partial Prefetching) | Correct; `cacheComponents: true` is in `next.config.ts` |
| `use(browser(reason))` from `react-dom`, allowed inside `<Suspense>` under `'navigation'`, fallback becomes prerendered HTML | `single-page-applications.md` "Rendering components only in the browser"; `ensureStatic.md` "Client Components"; `@types/react-dom` `export function browser(...)` | Correct, and AD-4 matches the documented localStorage pattern exactly |
| "middleware/proxy" naming | Next 16 renamed middleware to proxy | Correct |
| Node >= 20.9 | `next/package.json` engines `>=20.9.0` | Correct |
| Vitest 5.0.5, `@vitejs/plugin-react` 6.1.2, jsdom 30.1.3 | `npm view` (all three are the current latest) | Current. Not installed yet. Peer issues below (F3) |
| `@/` alias | `tsconfig.json` `paths: {"@/*": ["./*"]}` | Correct |
| Tailwind via `@theme` in `app/globals.css` | `globals.css` has `@import "tailwindcss"` + `@theme inline` | Correct |
| Vercel Git integration | `git remote -v` is empty; only branch is `master` (environment reports main branch as `main`) | **Not executable as written** (F1) |

## Findings

### F1 [HIGH]: The operational envelope is declared but cannot run and has no operations story

The checklist singles out this dimension. The spine names a host (Vercel) and a deploy shape (preview per push, production branch to prod). Several parts of it are not decided:

- **No deploy path exists yet.** The repo has no git remote and a single `master` branch, while the environment reports `main` as the main branch. "Vercel Git integration with default settings" needs a hosted Git repo, and Vercel's default production branch is the repo's default branch. The spine never names the production branch, so two people could each set up "the" deploy differently, or nobody does.
- **Demo URL and Deployment Protection.** Vercel's default Standard Protection puts Vercel Authentication on preview deployments and generated deployment URLs. Only the production domain is public. The brief's success criterion is "no setup, account or install" in a live classroom demo. If someone shares a preview or per-deployment URL, students hit a Vercel login wall. The spine should say that the demo URL is the production domain (`<project>.vercel.app` or a custom domain) and that preview URLs are for the team only.
- **Operations is silent.** Nothing covers rollback (for example Vercel Instant Rollback to the last good deployment), the demo-day fallback if the venue network or Vercel is unavailable (for example `next build` + `next start` on a laptop), or monitoring and analytics. Analytics is listed as out of scope, which is fine, but say "no monitoring; the demo operator verifies the production URL before class" as a decision.
- **Provider strategy is implicit.** The app is static, so lock-in is low. The spine should still say so, and it should say whether static export (`output: 'export'`) is a supported fallback host or explicitly not supported.
- **Runtime Node version is not pinned.** "≥ 20.9 (local 24.22.1)" lets Vercel and local machines differ. Pin it with `engines.node` in `package.json` (or the Vercel project setting) and align `@types/node` (see F3).

**Fix:** add a short "Operations" block under the Structural Seed that covers: creating the remote; naming the production branch; the production domain as the only shared URL; rollback and demo-day fallback; no monitoring; and the pinned Node major.

### F2 [MEDIUM]: The paste → deck → pre-filled textarea round trip is an unowned seam

The state diagram shows `saved deck (pre-filled)`, but storage keeps `Card[]` and not the raw text (AD-3). Something has to turn cards back into `term - definition` lines, and no AD or core file owns that step. In practice `paste-screen.tsx` and a test author will each write their own formatter, which is exactly the divergence AD-6 exists to prevent. Related gaps that would also diverge:

- The `replaceDeck` payload is not fixed. It could be raw text or the `Card[]` result of `parseDeck`, and it decides where parsing happens.
- *When* the deck is saved is not fixed: on **Start**, on every edit, or on blur. If a student pastes, then reloads before pressing Start, the outcome depends on which one a builder picks. The brief says "the pasted deck is saved".
- The spine does not say whether `replaceDeck` or `goToPaste` clears an in-progress `round`. Ids are positional (`c0…`), so a stale round would key results to the wrong cards after an edit.
- `Clear deck` versus `saveDeck([])` is not fixed, and neither is what `loadDeck()` returns for a stored empty array.

**Fix:** extend AD-6 with `formatDeck(cards): string` in `lib/flashflip/parse.ts` and a stated property `parseDeck(formatDeck(c)).cards` equals `c`. This is safe because a parsed term can never contain ` - `. Then fix the `replaceDeck` payload (`Card[]`), the save trigger, the rule that `replaceDeck` resets `round` to `null`, and the rule that an empty deck is stored with `clearDeck()`, never `saveDeck([])`.

### F3 [MEDIUM]: The test toolchain is named but not wired up, and has a dependency conflict

The Tests convention names Vitest + jsdom, and every core AD depends on unit tests. The spine leaves out:

- `vitest.config.ts` in the Structural Seed, and a `test` script in `package.json`. Neither is in the scaffold.
- How `@/` resolves under Vitest. Vite does not read `tsconfig` `paths` by default, so it needs `resolve.alias`, Vite's tsconfig-paths option, or a plugin. Each builder will otherwise pick a different one.
- **Vite** is missing from the Stack table, but `@vitejs/plugin-react@6.1.2` has a required peer of `vite ^8.0.0` (current 8.3.5). Pin it.
- **Peer conflict:** `vitest@5.0.5` declares an optional peer `@types/node: ^22.0.0 || >=24.0.0`, and the scaffold has `@types/node: ^20`. npm validates optional peers that are present, so installing will likely raise ERESOLVE. Bump `@types/node` to `^24` to match local Node 24 and the pinned runtime from F1.
- Whether `@vitejs/plugin-react` is needed at all. Core tests are plain TS, and React 19 JSX works with Vite's built-in transform. Decide this so that one builder doesn't add it and another remove it.

### F4 [MEDIUM]: The boundary rules have no mechanical check

AD-1 ("core imports nothing from React, Next, the DOM, or `lib/storage/`"), AD-3 ("`deck-store.ts` is the only module that touches `localStorage`"), AD-4 ("no other component calls `browser()`") and AD-5 ("only the root calls `deck-store`") are the right rules. They are enforced only by review. ESLint is already set up (`eslint.config.mjs`, flat config), so each rule can become a lint error:

- `no-restricted-imports` scoped to `lib/flashflip/**`, which bans `react*`, `next*` and `@/lib/storage/*`.
- `no-restricted-globals` / `no-restricted-properties` for `localStorage` / `window.localStorage` everywhere except `lib/storage/deck-store.ts`.
- `no-restricted-imports` of `@/lib/storage/*` and of `browser` from `react-dom` in `components/flashflip/**` except `flashflip-app.tsx`.

**Fix:** add an "Enforced by" line to each of these ADs and an ESLint override block to the seed. AD-2 is already enforced by the build through `ensureStatic`.

### F5 [LOW]: Smaller divergence points and scaffold ratification gaps

- **Flipped state leaks across cards.** AD-5 lets `quiz-screen` hold the flipped face as local state. Unless the card subtree is keyed by card id (or the state is reset on `index` change), the next card can open on its definition. Add the convention "render the card with `key={card.id}`" (or `key={round.index}`, so duplicate cards behave too).
- **Missed-id derivation.** "Retry creates a new round from the ids marked `missed`". The shell has to compute those ids before shuffling (AD-7), and with no core helper such as `missedIds(round)` the shell re-implements a rule, which breaks AD-1. Name the helper in `round.ts`.
- **App state type is unnamed.** `types.ts` lists `Card`, `Round` and `View`, but not the reducer state (for example `AppState = { deck: Card[]; view: View; round: Round | null }`) or the `mark` payload.
- **`ensureStatic` placement.** It is put on `app/page.tsx`. A future route or `not-found` would not inherit it. The docs recommend the root layout for whole-app static output. Put it on `app/layout.tsx`, or state that the app has exactly one route.
- **`partialPrefetching: true` in `next.config.ts` is not ratified or removed.** It does nothing in a one-page app. The spine should keep it or remove it explicitly, so a builder doesn't "clean it up" on their own.
- **Scaffold dark mode versus "dark mode deferred to UX".** `globals.css` already switches colours on `prefers-color-scheme: dark`, and the Accessibility convention requires AA contrast "on both faces". State whether the scaffold's dark mode stays (and so must meet AA) or is removed until UX decides.
- **Who owns the `<Suspense>` fallback content.** It is the only prerendered HTML and the first paint on a phone. Name its owner (`page.tsx`) and what it shows (for example the static app title and a neutral placeholder).
- **Parser edge cases.** The spine doesn't say whether whitespace-only lines are "blank" or "skipped". It also doesn't say whether a non-breaking space or an en dash pasted from a notes app counts as the separator. The second is requirement-level, so record it as an open question for the PRD rather than leaving it silent.
- **XSS floor.** Pasted text is rendered. Add "no `dangerouslySetInnerHTML`" to the conventions. It costs one line and closes the only injection path.
- **Sources.** A PRD draft exists (`prd-flashflip/prd-flashflip.md`, currently empty), and Deferred hands requirement-level behaviour to it. Add it to `sources` so the amendment path is traceable.

## Checklist scorecard

| Criterion | Assessment |
| --- | --- |
| Fixes the real divergence points, misses none | Mostly. It misses the deck↔text round trip and save trigger (F2), test wiring (F3), flipped-state reset and missed-id helper (F5) |
| Every AD Rule is enforceable and prevents its divergence | The rules are precise and correct, but AD-1/3/4/5 rely on review alone (F4). AD-2 is build-enforced |
| Nothing under Deferred could let units diverge | Pass. The UX, e2e, out-of-scope and TS 7 deferrals are safe. The "requirement-level behaviour" item is safe because AD-3/6/8 already encode the answers |
| Named tech is verified-current | Pass for every named item (checked locally and on npm). Vite is missing and there is an `@types/node` peer conflict (F3) |
| Ratifies, not contradicts, the scaffold | Mostly. It ratifies `cacheComponents`, the Turbopack Tailwind loader, `@theme` and `@/`. It is silent on `partialPrefetching` and scaffold dark mode (F5) |
| Covers every brief MVP requirement | Pass: paste box, parsing + skipped count, flip, Knew it / Missed it, shuffle each round, score `7 / 10`, retry missed, localStorage deck, results only for the visit, phone-first + laptop. The save-timing ambiguity is F2 |
| Every owned dimension decided, deferred, or open | **Fail on operations.** Deployment is partly decided, environments are named, provider strategy is implicit, and operations (rollback, demo fallback, monitoring stance, production branch, Node pin) is silent (F1). Security is near-silent (F5, XSS) |

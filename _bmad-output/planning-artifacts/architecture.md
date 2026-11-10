---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-flashflip-2026-11-10/prd.md'
  - '_bmad-output/planning-artifacts/briefs/brief-flashflip-2026-11-10/brief.md'
  - '_bmad-output/planning-artifacts/briefs/brief-flashflip-2026-11-10/addendum.md'
workflowType: 'architecture'
lastStep: 8
status: 'complete'
completedAt: '2026-11-10'
project_name: 'flashflip'
user_name: 'Amer'
date: '2026-11-10'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:** 17 FRs in six features, from the final PRD.

- **Paste and make Cards (FR-1 to FR-6).** A pure text-to-Deck transformation: split Lines, trim, strip one list marker, find a Separator by fixed precedence, list every Skipped line, refuse unusable input. The rules plus the 31-row acceptance table (P-01 to P-31) and one invariant (Cards + Skipped lines + blank Lines = Lines) fully specify it, so it suits table-driven and property tests. It is Unicode-sensitive: White_Space and Dash properties, NBSP, BOM, ZWSP, CJK punctuation.
- **Flip-card quiz, Score, Shuffle (FR-7 to FR-13).** A four-screen flow (Paste, Ready, Study, Result) over one Deck and one Pass. Score is a pure function with a stated rounding rule. Shuffle needs an unbiased permutation and a random source that tests can control (FR-13 asks for a 10,000-run uniformity check). The order is fixed at Pass start and survives a reload.
- **Saved state (FR-14 to FR-16).** The browser holds Paste text, Deck, Shuffle setting, Pass order, position and Marks, and a reload must restore the same screen. Reads and writes can fail, and stored data can be invalid or from an unknown version, so storage needs validation, a schema version and a fail-safe path.
- **Any script (FR-17).** Text is shown exactly as made, never as markup, with automatic direction per Term and Definition.

**Non-Functional Requirements:**

- **NFR-2 Privacy** is the strongest structural constraint: no network requests after load, no cookies, no third-party scripts, fonts or analytics.
- **NFR-1 Performance:** parse 1,000 Lines within 500 ms and answer any tap within 200 ms on a mid-range phone. Parsing is linear, so the risk sits in rendering large lists.
- **NFR-3 Accessibility and touch:** keyboard operation, visible focus, WCAG 2.2 AA contrast, 44 × 44 px targets, and an axe-core run on all four screens.
- **NFR-4 Devices:** from 320 px wide, on current and previous major Safari iOS, Chrome Android and desktop browsers.
- **NFR-5:** English interface only.

**Scale & Complexity:**

- Primary domain: client-side web app, one page, no backend
- Complexity level: low overall; the difficulty is concentrated in Unicode-aware text handling and exact state restoration
- Estimated architectural components: 6 (three pure logic modules for parsing, scoring and shuffling; a session state model; a persistence adapter; a UI layer of four screens)
- No real-time features, multi-tenancy, regulatory compliance or integrations. Data volume is small: at most 1,000 Cards and 200,000 characters.

### Technical Constraints & Dependencies

- **Stated for this run:** Next.js App Router, TypeScript, Tailwind CSS, browser localStorage, no backend, deployed on Vercel, one page, parsing and scoring as pure functions with Vitest unit tests.
- **Design direction (stated for this run):** make the design fit Gen Z. No UX specification exists, so the direction is undefined in detail. The PRD sets the boundaries it must stay inside: phone-first from 320 px (NFR-4), 44 × 44 px tap targets and WCAG 2.2 AA contrast (NFR-3), taps answered within 200 ms (NFR-1), no third-party fonts or scripts (NFR-2), and the Non-Goals (no sharing, streaks, history or analytics).
- **Existing scaffold:** an untouched `create-next-app` project (Next.js 16.4.5, React 19.3, Tailwind 4, TypeScript 5, ESLint 9) with no FlashFlip code yet.
- **Browser storage:** localStorage holds about 5 MiB and private mode wipes it on close. Safari on iPhone can delete a site's data after about a week without a visit unless the site is on the Home Screen (brief addendum, medium to high confidence).
- **Runtime dependencies:** none beyond the framework. There is no backend, API or third-party service.
- **Product limits:** 200,000 characters and 1,000 Cards per Deck. The acceptance table is the executable spec for the parser.

### Cross-Cutting Concerns Identified

1. **Text integrity.** The parser, the 80-character truncation of Skipped lines, the length limits and the display must agree on what a character is, and must not split an emoji or combining sequence. *To settle:* the PRD says "characters"; I read that as JavaScript string length (UTF-16 code units) unless a code-point count is preferred.
2. **State fidelity.** One source of truth for screen, Deck, Pass, position and Marks, restored exactly after a reload, with a schema version and validated reads.
3. **Client-only data in a server-first framework.** Saved state exists only in the browser, so the first render cannot depend on it without a hydration plan.
4. **Controllable randomness.** Shuffle must be unbiased and testable with an injected random source.
5. **Test layers.** Pure-function unit tests cover FR-2 to FR-6, FR-10, FR-12 and FR-13. FR-14 to FR-17 and NFR-2 to NFR-4 also need component-level tests with stubbed storage and checks in a real browser (accessibility, no network, Safari).
6. **Privacy by construction.** Nothing may add network calls or telemetry: no analytics on the host, fonts self-hosted at build, no third-party scripts. NFR-2 must be tested against a production build.
7. **Large lists.** FR-5 lists every Skipped line, and a 200,000-character paste of unreadable one-character Lines could produce about 100,000 rows. *To settle:* cap or window the display, which relaxes "lists each", or keep it as written.
8. **Safe rendering.** Paste text must only ever reach the page as text, never as markup.
9. **Visual identity and motion.** A Gen Z-friendly look needs a themeable visual layer (colors, type, spacing and motion defined once, not hard-coded per component), motion that respects reduced-motion preferences, and any gesture (such as swiping a Card) backed by a button and keyboard equivalent (FR-8, FR-9, NFR-3). *To settle:* what "Gen Z" means here in concrete terms (palette, dark-first or light, type, motion, tone of copy), because there is no UX spec to inherit it from.

## Starter Template Evaluation

### Primary Technology Domain

Web application: a client-side, one-page app with no backend, per the PRD and the stack stated for this run.

### Starter Options Considered

- **`create-next-app` (selected).** The official Next.js starter and the stack you specified: App Router, TypeScript, Tailwind CSS, deployed on Vercel. This repository is already initialized from it.
- **Vite + React + TypeScript.** The leanest fit for an app with no server and no routing: no server rendering means no hydration concern for browser-only Saved state. Not selected because Next.js was specified and the scaffold exists. The cost is the hydration boundary in Cross-Cutting Concern 3, handled by keeping all state-dependent UI in Client Components.
- **Other frameworks** (Remix or React Router, SvelteKit) were not evaluated, because the stack was stated.

### Selected Starter: create-next-app

**Rationale for Selection:** stated by you and already in place. It deploys on Vercel with no configuration. It also supports the Gen Z direction without a change of foundation, through Tailwind 4's CSS-first design tokens (`@theme`) and compatibility with any React animation library. Integrations: none, since the PRD forbids third-party services at runtime (NFR-2).

**Initialization Command:** already run. The scaffold matches the current recommended defaults except that it has no `AGENTS.md`.

```bash
npx create-next-app@latest flashflip --yes
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:** TypeScript 5.9 in strict mode, React 19.3, an `@/*` path alias to the project root, and bundler module resolution. Node 26 locally; Vercel supports 22, 24 and 26, and 26 is its default.

**Styling Solution:** Tailwind CSS 4.3, CSS-first. `app/globals.css` holds `@import "tailwindcss"`, an `@theme inline` token block, and light and dark values through `prefers-color-scheme`. It is compiled by `@tailwindcss/turbopack`, a Turbopack loader published by the Tailwind Labs maintainers and registered in `next.config.ts`. There is no `postcss.config` and no `tailwind.config`.

**Build Tooling:** Next.js 16.4.5 with Turbopack. `next.config.ts` enables `cacheComponents` and `partialPrefetching`. Cache Components is one of the current recommended defaults, and `partialPrefetching` requires it. With one page and no links, prefetching has no effect on NFR-2. Keeping Server Components trivial, with state, randomness and storage access in Client Components, means these settings add no rules to the app.

**Testing Framework:** none provided, with no test script and no test dependencies. Per your stack, Vitest. Pure-function tests need only `vitest`. Component tests (FR-14 to FR-17) follow the Next.js guide: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/dom` and `vite-tsconfig-paths`. Vitest cannot unit-test async Server Components; there are none here.

**Code Organization:** `app/` at the root with no `src/`: `layout.tsx` (Geist fonts through `next/font/google`, which downloads them at build and serves them from the app's own domain, so the browser makes no request to Google; `lang="en"`), `page.tsx` and `globals.css`, plus demo SVGs in `public/`.

**Development Experience:** `npm run dev`, `build`, `start` and `lint`, with an ESLint 9 flat config using the `eslint-config-next` core-web-vitals and TypeScript presets. No formatter, no CI configuration, no `AGENTS.md`.

**Verified against the npm registry (10 Nov 2026):**

- The scaffold is one patch behind on `next` (16.4.5 against 16.4.6) and `react` (19.3.0 against 19.3.1).
- TypeScript 7.0.2 and ESLint 10.14.0 have shipped. Stay on 5.x and 9.x for the MVP unless the tooling is confirmed on the new majors.
- Vitest 5.1.0 needs Node 22.12 or later and `@types/node` 22 or 24 and above, so the scaffold's `@types/node@^20` should be raised when Vitest is added.

**To replace in the first story:** the demo `page.tsx`, the "Create Next App" title and description, the demo SVGs, and the `body` rule in `globals.css` that forces Arial over the Geist font.

**Note:** initialization is already done. The first implementation story becomes: remove the boilerplate, update the patch versions, and add the Vitest setup (config, `test` script, one passing test).

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- AD-1 What is stored, and how the Deck is derived
- AD-3 What a "character" is
- AD-5 Typed-result error handling
- AD-6 State as a pure reducer
- AD-7 Structure and routing
- AD-8 First paint and restore

**Important Decisions (Shape Architecture):**
- AD-2 Validation and versioning of stored data
- AD-4 Browser-enforced privacy (CSP and headers)
- AD-9 Large Skipped-line lists
- AD-10 Design system and motion
- AD-11 Testing layers
- AD-12 Deploy, CI and runtime

**Deferred Decisions (Post-MVP):**
- Playwright with axe-core to automate NFR-2 to NFR-4; a manual checklist covers the MVP.
- GitHub Actions CI: the repository is local-only (no remote), so it waits for one.
- First deployment route (Vercel CLI or a Git import): chosen at deploy time.
- Splitting storage into two keys: only if measured writes become a problem.
- An animation library (Motion 14.11): only if a design need appears that CSS cannot meet.

### Data Architecture

**AD-1 What is stored.** One versioned localStorage key holds the Paste text and the progress (screen, Shuffle setting, Pass order, position, Marks). The Deck and the Skipped lines are not stored: the parser re-derives them from the Paste text on load. The text is the single source of truth, and a paste with thousands of Skipped lines cannot bloat storage. A `parserVersion` constant is stored with the state and bumped whenever FR-2 to FR-4 change. On a mismatch the Paste text is kept, the progress is dropped, and the app opens on the Ready screen. The restored screen is Ready, Study or Result; the Paste screen is never restored (FR-14). Rejected: also storing the derived Deck. Affects: parser, reducer, persistence, FR-14.

**AD-2 Validation and versions.** A hand-written validator with no schema library, run in two stages: structure (types, enums, sizes), then consistency against the re-derived Deck (the Pass order is a permutation of the Cards, the position is in range, each position has at most one Mark). An unknown schema version or any invalid data is discarded as if absent (FR-16). There are no migrations in the MVP. Rejected: Zod 4.6 and Valibot 1.5, which add a dependency for a shape of about ten fields.

**AD-3 Characters.** Length limits (FR-6) count UTF-16 code units (JavaScript `length`). The 80-character display of a Skipped line (FR-5) counts grapheme clusters through `Intl.Segmenter`, so an emoji or combining sequence is never split. This is the architecture's reading of "characters" in FR-5 and FR-6. Caching: none.

### Authentication & Security

- Authentication, authorization and encryption: none. There are no accounts, and Notes are the Student's own, kept on the device in plain text.
- **AD-4 Browser-enforced privacy.** A static Content Security Policy plus `Referrer-Policy: no-referrer` and a `Permissions-Policy` denying camera, microphone and geolocation, set through `headers()` in `next.config.ts`, in production builds only. The policy: `default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `font-src 'self'`; `connect-src 'none'`; `object-src 'none'`; `base-uri 'none'`; `form-action 'none'`; `frame-ancestors 'none'`. Inline script and style are allowed because Next's bootstrap needs them without nonces. The policy exists to stop network egress and third-party loads (NFR-2), not to replace safe rendering. Rejected: a nonce-based policy, which forces dynamic rendering (Next.js docs). The docs support static headers but show no `connect-src` example, so the policy is verified on a production build: no blocked first-party request, no console violations.
- Safe rendering (FR-17): Paste text reaches the page only as React text, and ESLint bans `dangerouslySetInnerHTML`.
- Monitoring and telemetry: none (NFR-2). Vercel Web Analytics and Speed Insights stay off.

### API & Communication Patterns

No API, no network calls, no rate limiting, no service communication.

**AD-5 Error handling.** Parsing and storage return typed results (`{ ok: true, value }` or `{ ok: false, reason, … }`) instead of throwing; a failure may carry details, such as the Skipped lines that accompany FR-6's `no-cards` refusal. Only the storage adapter catches exceptions (storage blocked, full or unreadable) and converts them to results. The UI turns reasons into the PRD's messages (FR-6, FR-16).

### Frontend Architecture

**AD-6 State.** `useReducer` over a pure reducer `(state, action) => state`, with no state library. Randomness never enters the reducer: the caller generates the Pass order from an injected random source and passes it in the "start pass" action. The persisted shape is the reducer state minus derived fields.

**AD-7 Structure and routing.** One route, `/`. `app/page.tsx` is a trivial Server Component rendering one `FlashFlipApp` Client Component. The four screens are components chosen by state, with no URLs and no history entries (Back leaves the app, and Saved state restores it). The pure core lives in `lib/` (parser, score, shuffle, reducer, storage schema and validator) and the UI in `components/`.

**AD-8 First paint.** The server sends a static shell. After mount the client reads Saved state and restores it, showing a neutral skeleton until then so the Paste screen never flashes before the Study screen. Saving happens after the state update, outside the tap's critical path (NFR-1). Rejected: `useSyncExternalStore`.

**AD-9 Large Skipped-line lists.** The Ready screen, and the refusal view under the Paste box, show the first 100 Skipped lines and a "Show all N" control. The rest render with `content-visibility: auto` (Chrome 85+, Firefox 125+, Safari 18+; ignored elsewhere, where rows render normally). Every Skipped line stays listed, so nothing is dropped silently (FR-5). "Show all N" is UI text the PRD does not yet specify.

**AD-10 Design system and motion (Gen Z direction).**
- Tokens in `app/globals.css` under `@theme`: colors, radii, type scale, motion durations. Dark-first, with light following the system setting. Values come from the approved design sheet (`docs/design-sheet.md`).
- CSS-first animation (3D card flip, screen transitions) with `motion-reduce` fallbacks.
- Swiping a flipped Card to either side Marks it, through a small Pointer Events hook. It is enabled only after a flip, like the buttons, and the buttons and keyboard stay (FR-8, FR-9, NFR-3).
- A CSS confetti burst on the Result screen. Geist stays unless another font is chosen, self-hosted at build (NFR-2). No animation library unless a need appears.
- PRD limits: button labels and messages are fixed by the acceptance criteria, so a casual tone applies only to unspecified text (headings, empty states, the Result headline). Streaks, sharing and leaderboards remain Non-Goals. Token values must clear WCAG 2.2 AA contrast in both themes (NFR-3).

**AD-11 Testing layers.**
- Vitest 5.1, Node environment: the parser against the full acceptance table (P-01 to P-31) plus the Cards + Skipped lines + blank Lines invariant, Score rounding (FR-10), Shuffle (FR-12, FR-13), the reducer and the storage validator.
- Vitest with jsdom and Testing Library: screens, restore after reload (FR-14), the device-only notice (FR-15), storage-failure paths with stubbed storage (FR-16), text direction and markup safety (FR-17).
- Shuffle uniformity (FR-13) is covered twice: an exhaustive check of every draw sequence for a 3-Card Deck (deterministic) and the 10,000-run statistic with a seeded random source.
- NFR-2 to NFR-4 start as a manual checklist on a production build: network panel shows no requests, an axe-core run, Safari on iOS and Chrome on Android. Playwright 1.65 with axe-core 4.14 is the deferred upgrade. Optional: fast-check 4.10 for the parser invariant.

### Infrastructure & Deployment

**AD-12 Deploy, CI and runtime.** Vercel hosting (stated): static output, no functions, no environment variables, no secrets, served from the CDN. The repository is local-only today (no remote, `.github` or `.vercel`), so CI is deferred. Local scripts: `typecheck`, `lint` and `test`, alongside the starter's `dev`, `build` and `start`. Runtime: `engines.node` set to `>=22.12` (Vitest 5 requires `^22.12.0 || ^24 || >=26`; Vercel supports 22, 24 and 26, with 26 the default) and `@types/node` at `^22` to match the minimum runtime, which Vitest 5's peer range allows. No monitoring, logging or scaling concerns.

### Decision Impact Analysis

**Implementation Sequence:**
1. Housekeeping: remove the boilerplate; update `next` to 16.4.6 and `react` to 19.3.1; set `@types/node@^22`; add Vitest (Node and jsdom), Testing Library and the scripts.
2. Pure core with tests: parser and acceptance table, Score, Shuffle with an injectable random source, reducer, storage schema and validator with `parserVersion`.
3. Storage adapter returning typed results, and the persistence hook.
4. `FlashFlipApp` with the restore flow and skeleton, then the four screens.
5. Design sheet approved (`docs/design-sheet.md`), then design tokens, flip, swipe hook, confetti, reduced-motion fallbacks.
6. Security headers in `next.config.ts`, verified on a production build.
7. Manual NFR checklist, then the first Vercel deployment.

**Cross-Component Dependencies:**
- Parser and storage are coupled through `parserVersion`: a parsing-rule change must bump it, and progress validation depends on the re-derived Deck size.
- The reducer stays pure: randomness and time never enter it.
- The persistence hook subscribes to reducer state and saves after updates. Failures surface as a flag the UI turns into the FR-16 notice.
- `connect-src 'none'` makes any future network feature (analytics, remote fonts, sync) a deliberate policy change, which is the intended guard for NFR-2.
- Token values drive WCAG contrast, so a theme change needs a contrast re-check in light and dark.
- AD-3 and AD-9 interpret FR-5 and FR-6 ("characters", "lists each"). The PRD is left unchanged, and this document is the reading (validation decision B).
- The Node and jsdom Vitest suites must be separated in configuration before component tests are added.

## Implementation Patterns & Consistency Rules

### Pattern Categories Defined

**Critical Conflict Points Identified:** 18 areas (PAT-1 to PAT-18) where AI agents could make different choices. The database, API and event-system categories do not apply: there is no database, no API beyond the single route, and no event bus.

### Naming Patterns

**Database Naming Conventions:** not applicable. The only persisted data is one localStorage key (PAT-9).

**API Naming Conventions:** not applicable. The only route is `/`, and the only custom headers are the security headers in AD-4.

**Code Naming Conventions:**
- **PAT-1 Files.** kebab-case for every file: `flash-flip-app.tsx`, `parse-lines.ts`, `parse-lines.test.ts`. Next's reserved names stay as Next defines them (`page.tsx`, `layout.tsx`, `error.tsx`, `globals.css`). Exports: components and types in PascalCase, functions and variables in camelCase. Case-insensitive file systems make `Card.tsx` and `card.tsx` a collision.
- **PAT-7 Glossary in code.** PRD terms verbatim: `Card` (`{ term, definition }`), `Deck`, `Pass`, `Mark` (`'knew' | 'missed'`), `Score`, `SkippedLine` (`{ lineNumber, text, reason }`, reason `'no-separator' | 'missing-term' | 'missing-definition'`), `Screen` (`'paste' | 'ready' | 'study' | 'result'`) and `Separator`. No synonyms (`flashcard`, `quiz`, `answer`, `item`).
- **PAT-16 Constants, types, comments.** `SCREAMING_SNAKE_CASE` for limits and fixed values (`MAX_PASTE_CHARS`, `MAX_CARDS`, `PREVIEW_CARD_COUNT`, `SKIPPED_LINES_SHOWN`, `SKIPPED_LINE_DISPLAY_LENGTH`). No `I` prefix on types. Comments say why and cite a PRD or AD ID, with no change-log comments.
- **PAT-14 Design token names** are semantic, not literal: `--color-surface`, `--color-accent`, `--radius-card`, `--duration-flip`, never `--color-purple`.

### Structure Patterns

**Project Organization:**
- The kind of code decides the folder:
  - routes and global CSS in `app/`;
  - UI in `components/` (`screens/`, `ui/`, and `flash-flip-app.tsx`, the single `'use client'` boundary);
  - pure domain code in `lib/core/`;
  - browser storage in `lib/storage/`;
  - React hooks in `lib/hooks/`;
  - every PRD-fixed string in `lib/copy.ts` (PAT-4).
- **PAT-2 Tests** are co-located (`parse-lines.test.ts` beside `parse-lines.ts`). The acceptance table is typed data in `lib/core/acceptance-table.ts`, iterated by the parser test. Test titles start with the PRD ID (`P-09 well-known - widely recognised`, `FR-13 …`).
- **PAT-17 Test environments.** Two Vitest projects chosen by folder: Node for `lib/core/**` and `lib/copy.test.ts` (a core file that touches the DOM fails there), and jsdom for `components/**`, `lib/hooks/**` and `lib/storage/**`.
- **PAT-5 The core stays pure.** `lib/core/**` imports no `react`, `next/*` or browser globals (ESLint-enforced). No `utils.ts` or `helpers.ts`; modules are named for their purpose.
- **PAT-8 Imports** use the `@/` alias, with relative paths only within the same folder and no barrel (`index.ts`) files.

**File Structure Patterns:** configuration at the repository root (`next.config.ts`, `eslint.config.mjs`, `vitest.config.ts`, `tsconfig.json`); no environment files (none needed); `public/` only if a static asset appears; documentation in `_bmad-output/`.

### Format Patterns

**API Response Formats:** not applicable. The in-process equivalent is the typed result (AD-5): one shared type in `lib/core/result.ts`, `{ ok: true; value } | ({ ok: false } & F)`, where each failure `F` has a string-literal `reason` and may carry details (for example `{ reason: 'no-cards'; skippedLines }`).

**Data Exchange Formats:**
- **PAT-9 Saved state.** One localStorage key, `flashflip:saved-state`. Its value is a JSON object with camelCase fields (`version`, `parserVersion`, `pasteText`, `screen`, `shuffle`, `order`, `marks`). Booleans are `true` and `false`, absent values are omitted and never `null`, there are no dates or timestamps, and enums use the lowercase literals of PAT-7. A Deck shown on the Paste screen (after "Edit text") is saved as `screen: 'ready'`, and with no Deck the key is removed rather than written.

### Communication Patterns

**Event System Patterns:** not applicable. The reducer's actions are the only messages.

**State Management Patterns:**
- **PAT-3 Actions.** Past-tense kebab-case events in one exported `Action` discriminated union in `lib/core/session.ts` (for example `deck-made`, `pass-started`, `card-marked`, `shuffle-set`, `deck-discarded`). Every `switch` ends in an exhaustiveness check.
- **PAT-10 No redundant state.** State holds `screen`, `pasteText`, `shuffle`, `order` and `marks`. The Deck, Skipped lines, position (`marks.length`), current Card and Score are derived by pure selectors in `lib/core/selectors.ts`. The flip state of the current Card is local to the Study screen: not in the reducer, reset for each Card, never persisted (FR-8, FR-14). This refines AD-1: position is not stored separately.
- Updates are immutable, and the reducer has no side effects.
- **PAT-18 Injected randomness.** Shuffle takes `random: () => number` (a value in [0, 1)). Production passes `Math.random`, and tests pass seeded or scripted sources. The caller computes the Pass order and passes it in the `pass-started` action; neither the reducer nor `shuffle.ts` calls `Math.random`.
- **PAT-11 Storage access.** Only `lib/storage/` touches `localStorage`. One persistence hook calls the adapter, in a single effect after state changes. Components never touch storage.

### Process Patterns

**Error Handling Patterns:**
- Expected failures (AD-5) are typed results with reasons such as `'too-much-text' | 'no-cards' | 'too-many-cards'` for "Make cards" and `'storage-unavailable' | 'invalid-data' | 'unknown-version'` for storage. `lib/` does not throw for them; the only allowed `throw` is `assertNever` on an impossible state. Only `lib/storage/` wraps browser APIs in `try/catch`.
- **PAT-4 Strings.** Messages shown to the Student come only from `lib/copy.ts`: every string the PRD fixes (button labels, messages, reason labels) plus functions for interpolated ones, such as `tooManyCards(max)`. Components and tests import from it, so any tone work stays in one file.
- **PAT-6 Crashes.** One `app/error.tsx` boundary with a "Start over" button that clears Saved state. No error-reporting service (NFR-2), only `console.error`. The wording is new text and lives in `lib/copy.ts`.
- **PAT-12 Validation timing.** Parse only on "Make cards", never on keystrokes. Stored data is validated only at restore (AD-2).

**Loading State Patterns:**
- **PAT-13** One `restoring` phase before the reducer exists (AD-8): `FlashFlipApp` renders the skeleton, then mounts the reducer with the restored or initial state. No other spinners and no loading flags in the reducer.

**Styling and Accessibility Patterns:**
- **PAT-14 Styling.** Tailwind utilities in JSX, with values from `@theme` tokens. No hard-coded colors or pixel values outside tokens, no CSS modules or styled-components, and inline `style` only for dynamic transforms such as the swipe.
- **PAT-15 Accessibility.** A native `<button>` for every action, each screen moves focus to its heading on mount, flips and messages announce through one `aria-live="polite"` region, no positive `tabIndex`, and confirmations (FR-11) use the native `<dialog>` through `components/ui/confirm-dialog.tsx`, never `window.confirm`.

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow the file, naming and Glossary rules (PAT-1, PAT-7, PAT-16) and import with `@/` (PAT-8).
- Keep `lib/core/**` free of `react`, `next/*` and browser globals (PAT-5), with storage reached only through `lib/storage/` (PAT-11).
- Take every PRD-fixed string from `lib/copy.ts` (PAT-4) and handle expected failures with typed results (AD-5).
- Co-locate tests and title them with PRD IDs (PAT-2), and pass randomness in as a parameter (PAT-18).
- Use tokens, native buttons and the focus and `aria-live` rules (PAT-14, PAT-15).

**Pattern Enforcement:**
- `npm run lint`: ESLint overrides by folder (restricted imports and globals in `lib/core/**`, `localStorage` allowed only in `lib/storage/**`, imports of the parser, reducer, saved-state and storage modules banned in `components/screens/**` and `components/ui/**`, `dangerouslySetInnerHTML` banned everywhere).
- `npm run typecheck`: exhaustiveness checks on `Action` and `Screen`.
- `npm run test`: the Node project fails if core code touches the DOM, and the parser test iterates every acceptance-table row.
- Violations are fixed in the change that introduces them. A recurring violation earns a lint rule or a line here. Patterns change by editing this section in the same commit as the code that needs it, and PAT IDs are never reused.

### Pattern Examples

**Good Examples:**

```ts
// lib/core/result.ts
export type Result<T, F extends { reason: string }> =
  | { ok: true; value: T }
  | ({ ok: false } & F);

// lib/core/parse-lines.ts
export type MakeCardsRefusal =
  | { reason: 'too-much-text' }
  | { reason: 'too-many-cards' }
  | { reason: 'no-cards'; skippedLines: SkippedLine[] };

// lib/core/session.ts
export type Action =
  | { type: 'deck-made'; pasteText: string }
  | { type: 'pass-started'; order: number[] }
  | { type: 'card-marked'; mark: Mark };

// lib/copy.ts
export const copy = {
  makeCards: 'Make cards',
  tooManyCards: (max: number) => `Too many cards (max ${max.toLocaleString('en-US')})`,
};
```

**Anti-Patterns:**
- `Card.tsx` beside `card.tsx`; a `utils.ts` file; barrel `index.ts` files.
- Identifiers such as `flashcard`, `quiz`, `answer` or `item`.
- Action types like `MAKE_CARDS` or `makeCards`.
- An inline `'Make cards'` or `Too many cards (max 1,000)` in a component or test.
- `Math.random()` inside the reducer or `shuffle.ts`.
- `localStorage.setItem` in a component, or in an effect outside the persistence hook.
- `position` or `score` in state or saved JSON; `null` in saved JSON; `flipped` in the reducer.
- Parsing inside `onChange`.
- `#7c3aed`, `px-[13px]` or `--color-purple`.
- `<div onClick>` for an action; `tabIndex={1}`.
- A `catch {}` that swallows an error, or a `throw` for an expected failure.
- `dangerouslySetInnerHTML`.

## Project Structure & Boundaries

### Complete Project Directory Structure

```
flashflip/
├── app/
│   ├── layout.tsx                 # (edit) root layout: metadata, Geist fonts, lang="en"
│   ├── page.tsx                   # (replace) trivial Server Component rendering <FlashFlipApp />
│   ├── error.tsx                  # (new) crash boundary with "Start over" (PAT-6)
│   ├── globals.css                # (edit) Tailwind import, @theme tokens, light/dark, keyframes, reduced motion
│   └── favicon.ico                # (existing)
├── components/
│   ├── flash-flip-app.tsx         # (new) the one 'use client' boundary: restoring phase, reducer, persistence, screen switch
│   ├── flash-flip-app.test.tsx    # restore after reload, skeleton, save-failed notice (FR-14, FR-16)
│   ├── screens/
│   │   ├── paste-screen.tsx       # FR-1, FR-6: Paste box, "Make cards", refusal messages
│   │   ├── paste-screen.test.tsx
│   │   ├── ready-screen.tsx       # FR-7: counts, Skipped lines, 3-Card preview, Shuffle, "Start", "Edit text", "New deck"
│   │   ├── ready-screen.test.tsx
│   │   ├── study-screen.tsx       # FR-8, FR-9, FR-11: flip, Mark, swipe, "n of N", "New deck" confirmation
│   │   ├── study-screen.test.tsx
│   │   ├── result-screen.tsx      # FR-10, FR-11: Score, "Start again", "New deck", Shuffle, confetti
│   │   └── result-screen.test.tsx
│   └── ui/
│       ├── flip-card.tsx          # FR-8, FR-17: 3D flip; Term and Definition in separate dir="auto" elements, text only
│       ├── flip-card.test.tsx
│       ├── skipped-lines.tsx      # FR-5, AD-9: first 100, "Show all N", content-visibility
│       ├── skipped-lines.test.tsx
│       ├── shuffle-toggle.tsx     # FR-12
│       ├── confirm-dialog.tsx     # FR-11: native <dialog> confirmation ("Discard this deck and your progress?")
│       ├── confirm-dialog.test.tsx
│       ├── notices.tsx            # FR-15 device-only notice, FR-16 save-failed notice
│       ├── screen-heading.tsx     # PAT-15: heading that takes focus on mount
│       ├── live-region.tsx        # PAT-15: the single aria-live="polite" region
│       ├── confetti.tsx           # AD-10: CSS-only burst
│       └── skeleton.tsx           # AD-8: neutral skeleton while restoring
├── lib/
│   ├── copy.ts                    # PAT-4: every PRD-fixed string
│   ├── copy.test.ts               # guards the exact PRD wording
│   ├── core/                      # pure and framework-free (PAT-5); Node tests
│   │   ├── types.ts               # Card, Mark, Screen, SkippedLine, Pass (PAT-7)
│   │   ├── limits.ts              # MAX_PASTE_CHARS, MAX_CARDS, PREVIEW_CARD_COUNT, ... (PAT-16)
│   │   ├── result.ts              # Result<T, R> (AD-5)
│   │   ├── assert-never.ts        # the only allowed throw
│   │   ├── text-units.ts          # whitespace set, trim and collapse, grapheme truncation (FR-2, AD-3)
│   │   ├── text-units.test.ts
│   │   ├── list-markers.ts        # FR-3
│   │   ├── separators.ts          # FR-4
│   │   ├── parse-lines.ts         # FR-2, FR-5, FR-6; exports PARSER_VERSION
│   │   ├── parse-lines.test.ts    # iterates the acceptance table, the invariant and the limits
│   │   ├── acceptance-table.ts    # P-01 to P-31 as typed data
│   │   ├── score.ts               # FR-10: count and whole-number percentage, halves up
│   │   ├── score.test.ts
│   │   ├── shuffle.ts             # FR-12, FR-13: shuffleOrder(length, random), identityOrder(length)
│   │   ├── shuffle.test.ts        # permutation, exhaustive 3-Card draws, seeded 10,000 runs
│   │   ├── seeded-random.ts       # test support: seeded random source
│   │   ├── session.ts             # SessionState, Action, reducer (PAT-3, PAT-10)
│   │   ├── session.test.ts
│   │   ├── selectors.ts           # Deck from pasteText, position, current Card, Score, "n of N"
│   │   ├── selectors.test.ts
│   │   ├── saved-state.ts         # SavedState shape, SAVED_STATE_VERSION, two-stage validator (AD-1, AD-2)
│   │   └── saved-state.test.ts
│   ├── storage/
│   │   ├── local-storage.ts       # the only code that touches localStorage (PAT-11)
│   │   └── local-storage.test.ts
│   └── hooks/
│       ├── use-saved-state.ts     # restore on mount, save after changes, saveFailed flag
│       ├── use-saved-state.test.tsx
│       ├── use-swipe.ts           # Pointer Events swipe, enabled only after a flip
│       └── use-swipe.test.tsx
├── docs/
│   ├── design-sheet.md            # (new) one-page Gen Z design sheet, approved before the UI stories
│   └── manual-checklist.md        # NFR-2, NFR-3, NFR-4, CSP, static-route and iOS flip and swipe checks on a production build
├── next.config.ts                 # (edit) keep starter settings; add production-only headers() (AD-4)
├── eslint.config.mjs              # (edit) folder-scoped restrictions (PAT-5, PAT-11, FR-17)
├── vitest.config.ts               # (new) "core" (node) and "dom" (jsdom) projects (PAT-17)
├── vitest.setup.ts                # (new) Testing Library matchers and cleanup for the dom project
├── package.json                   # (edit) scripts typecheck and test, devDependencies, engines
├── package-lock.json              # (existing)
├── tsconfig.json                  # (existing)
├── next-env.d.ts                  # (existing, generated)
├── README.md                      # (replace) run, test, deploy
├── .gitignore                     # (existing)
├── skills-lock.json               # BMad install record
├── .agents/                       # BMad skills (not app code)
├── _bmad/                         # BMad runtime configuration (not app code)
└── _bmad-output/                  # BMad planning artifacts (not app code)
```

Removed: `public/` (the demo SVGs). Not present by design: `src/`, `.env*`, `.github/` (no remote, so CI is deferred), `.vercel/` (created on first link), `postcss.config` and `tailwind.config` (Tailwind is CSS-first).

### Architectural Boundaries

**API Boundaries:** none: no endpoints and no network calls. The enforced boundary is the browser's: `connect-src 'none'` (AD-4) blocks any fetch, XHR, WebSocket or beacon in production.

**Component Boundaries:**
- `app/page.tsx` (Server Component) renders `components/flash-flip-app.tsx`, the only place that owns the reducer, the persistence hook and the live region. Everything below it is client code.
- Screens receive derived data and callbacks as props. They import `lib/copy.ts` and types, but never the parser, the reducer or storage. The Paste screen owns the text box and calls `onMakeCards(pasteText)`. `FlashFlipApp` parses (PAT-12), dispatches `deck-made` on success, and returns the refusal reason for the screen to show.
- `components/ui/*` are presentational: props in, callbacks out.
- The reducer state is the only shared state. Flip state and the swipe offset stay local to the Study screen (PAT-10).

**Service Boundaries:** none: there are no services.

**Data Boundaries:**
- Only `lib/storage/local-storage.ts` reads or writes `localStorage`, under the single key `flashflip:saved-state`.
- `lib/core/saved-state.ts` converts between `SessionState` and the stored string (pure) and validates it in two stages (AD-2).
- Derived data (Deck, Skipped lines, position, Score) is never stored.
- Two version gates: `SAVED_STATE_VERSION` for the stored shape, and `PARSER_VERSION` (exported by `parse-lines.ts`), which is bumped with any change to FR-2 to FR-4 behavior and the acceptance table.

### Requirements to Structure Mapping

**Feature Mapping:**
- **4.1 Paste and make Cards (FR-1 to FR-6):** `lib/core/parse-lines.ts`, `text-units.ts`, `list-markers.ts`, `separators.ts`, `limits.ts`, `acceptance-table.ts`; UI in `components/screens/paste-screen.tsx`; messages in `lib/copy.ts`.
- **4.2 Flip-card quiz (FR-7 to FR-9):** `components/screens/ready-screen.tsx`, `study-screen.tsx`, `ui/flip-card.tsx`, `ui/skipped-lines.tsx`, `lib/hooks/use-swipe.ts`; state in `lib/core/session.ts` and `selectors.ts`.
- **4.3 Score (FR-10, FR-11):** `lib/core/score.ts`, `selectors.ts`; `components/screens/result-screen.tsx`, `ui/confetti.tsx`, `ui/confirm-dialog.tsx` (the "New deck" confirmation).
- **4.4 Shuffle (FR-12, FR-13):** `lib/core/shuffle.ts`, `seeded-random.ts`; `ui/shuffle-toggle.tsx`; the `shuffle-set` and `pass-started` actions in `session.ts`.
- **4.5 Saved state (FR-14 to FR-16):** `lib/core/saved-state.ts`, `lib/storage/local-storage.ts`, `lib/hooks/use-saved-state.ts`, `ui/notices.tsx`, `ui/skeleton.tsx`, `app/error.tsx`.
- **4.6 Any language (FR-17):** `ui/flip-card.tsx` (separate elements, `dir="auto"`, React text only), `text-units.ts` (grapheme truncation), fonts in `app/layout.tsx`.

**Cross-Cutting Concerns:**
- **NFR-1 performance:** a linear parser; deferred saving in `use-saved-state.ts`; list rendering in `ui/skipped-lines.tsx`.
- **NFR-2 privacy:** `next.config.ts` headers (AD-4); no network code anywhere; no analytics dependencies in `package.json`.
- **NFR-3 accessibility and touch:** tokens in `app/globals.css`; `ui/screen-heading.tsx`; `ui/live-region.tsx`; PAT-15.
- **NFR-4 devices and NFR-2 to NFR-4 verification:** `docs/manual-checklist.md`.
- **NFR-5 interface language:** English strings in `lib/copy.ts`.
- **Design direction (AD-10):** tokens and keyframes in `app/globals.css`, `lib/hooks/use-swipe.ts`, `ui/confetti.tsx`; the approved values in `docs/design-sheet.md`.

### Integration Points

**Internal Communication:** props flow down and callbacks flow up. Screens call callbacks, `FlashFlipApp` turns them into reducer actions, and the persistence hook observes the state and talks to the storage adapter. Nothing else crosses a boundary.

**External Integrations:** none. Vercel hosts the static output.

**Data Flow:**
1. The Student pastes text; "Make cards" calls `onMakeCards`, and `FlashFlipApp` runs `parseLines` (pure).
2. On `ok`, it dispatches `deck-made { pasteText }`, and the screen becomes Ready. On a refusal, the reason goes back to the Paste screen, which shows the `copy` message.
3. `FlashFlipApp` derives the Deck and Skipped lines from `pasteText` with `useMemo`, so the parse reruns only when the text changes.
4. "Start" computes the Pass order (`identityOrder`, or `shuffleOrder(length, Math.random)` when Shuffle is on) and dispatches `pass-started { order }`.
5. The Study screen shows `deck[order[marks.length]]`. Each Mark dispatches `card-marked`, and when `marks.length` reaches the Deck size the reducer moves to the Result screen, where the Score is derived.
6. After every state change the persistence hook serializes the Saved state and writes it through the adapter. On mount it reads, validates (the second stage re-parses `pasteText` to check order and Marks), and either restores the state or starts empty.

### File Organization Patterns

**Configuration Files:** at the repository root. `next.config.ts` holds the production-only headers, `eslint.config.mjs` holds the folder-scoped rules, and `vitest.config.ts` defines the two projects. No environment files.

**Source Organization:** no `src/`. `app/` holds routes and global CSS, `components/` the UI, and `lib/` the core, storage, hooks and copy (PAT-1, PAT-5, PAT-8).

**Test Organization:** co-located (PAT-2). The Node project covers `lib/core/**/*.test.ts` and `lib/copy.test.ts`. The jsdom project covers `components/**`, `lib/hooks/**` and `lib/storage/**`. Shared test data is `acceptance-table.ts` and `seeded-random.ts`. Manual checks live in `docs/manual-checklist.md`.

**Asset Organization:** none planned. The demo SVGs are removed, the favicon stays in `app/`, and fonts come through `next/font` with no files to manage.

### Development Workflow Integration

**Development Server Structure:** `npm run dev` (Turbopack, hot reload; no CSP in development). `npm run test` runs `vitest run`, and `npx vitest` gives watch mode.

**Build Process Structure:** `npm run build` type-checks and produces the static shell. Production behavior (the CSP headers, an empty network panel) is verified with `npm run build && npm run start`, following the manual checklist. Scripts: `dev`, `build`, `start`, `lint` (existing), plus `typecheck` (`tsc --noEmit`) and `test` (`vitest run`).

**Deployment Structure:** Vercel with static output, `engines.node >=22.12` and no environment variables. The first deployment (Vercel CLI or a Git import) is chosen at deploy time.

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
- An `npm install --dry-run` of every proposed version at once (Next 16.4.6, React 19.3.1, `eslint-config-next` 16.4.6, Vitest 5.1.0, `@vitejs/plugin-react` 6.3.0, jsdom 31.0.0, Testing Library, `vite-tsconfig-paths`, `@types/node@^22`) resolved cleanly, with no peer conflicts.
- The parser's Unicode features (`\p{Dash}`, `\p{White_Space}`, `Intl.Segmenter`) compile with the scaffold's TypeScript 5.9 at `target: ES2017` and run on Node 26.
- One mismatch was found and fixed: `engines.node` is `>=22.12`, because Vitest 5 requires `^22.12.0 || ^24 || >=26`.
- The CSP (AD-4) fits the starter's assets: `next/font` serves fonts from the app's own origin and Tailwind compiles to a same-origin stylesheet. Cache Components with client-only state fits by design (a static shell, then restore after mount, AD-8); the first production build confirms it (manual checklist).

**Pattern Consistency:** the patterns support the decisions. PAT-10 refines AD-1 (position is derived, not stored). PAT-9 matches the reducer state of PAT-10 plus the two version fields. Typed results are used by the parser and the storage adapter alike. Two inconsistencies were found and fixed: PAT-17 omitted `lib/copy.test.ts`, and the `Result` type could not carry the Skipped lines that FR-6 needs.

**Structure Alignment:** the structure supports every decision, with boundaries defined for components, data and the network. Two gaps were found and fixed: FR-11's confirmation dialog had no home, and the component boundaries were stated but not lint-enforced.

### Requirements Coverage Validation ✅

**Feature Coverage:** there are no epics, so the six PRD feature groups are the unit, and each maps to modules in the structure (see Requirements to Structure Mapping).

**Functional Requirements Coverage:** all 17 FRs are supported. FR-1 to FR-6 by the parser modules, limits and typed refusals; FR-7 to FR-9 by the screens, flip card and reducer; FR-10 and FR-11 by `score.ts`, the Result screen and the confirm dialog; FR-12 and FR-13 by shuffle with injected randomness and deterministic plus statistical tests; FR-14 to FR-16 by the saved-state modules, adapter, hook and notices; FR-17 by the flip card, React text nodes and the lint ban. AD-3 and AD-9 interpret "characters" and "lists each" in FR-5 and FR-6 (see Gap Analysis).

**Non-Functional Requirements Coverage:**
- NFR-1: a linear parser, saves deferred past the tap, long lists windowed (AD-9); verified on a device.
- NFR-2: a CSP with `connect-src 'none'` (AD-4), no network code and no analytics dependencies; verified on a production build.
- NFR-3: tokens that clear AA contrast, PAT-15 and 44 × 44 px targets. The PRD says an automated axe-core run; the MVP runs axe manually and automation is the deferred upgrade (AD-11).
- NFR-4: manual checks on Safari for iOS and Chrome for Android.
- NFR-5: English strings in `lib/copy.ts`.

### Implementation Readiness Validation ✅

**Decision Completeness:** every critical and important decision has an ID, rationale and rejected alternatives. Versions are verified on the registry and consolidated in the dependency manifest below.

**Structure Completeness:** the tree names every file and maps it to requirements, and the boundaries and data flow are written out.

**Pattern Completeness:** 18 conflict points with examples and anti-patterns, enforced through ESLint, typecheck and tests.

### Gap Analysis Results

- **Critical:** none.
- **Important, resolved by decision:**
  - (A) The Gen Z look was not defined concretely. Resolution: a one-page design sheet, `docs/design-sheet.md` (palette pairs checked for contrast in both themes, type scale, radii, motion timings, tone examples for unspecified text), approved by the user before the first UI story. It gates the design-token step of the implementation sequence, not the core.
  - (B) The PRD's "characters" and "lists each" differ from AD-3 and AD-9. Resolution: the PRD is left unchanged and this document is the reading; revisit if testers disagree.
- **Important, fixed:** the `Result` payload for FR-6; the FR-11 confirm dialog; the `engines` mismatch; the unenforced component boundaries.
- **Minor, fixed:** PAT-17 scope; persistence edge rules; the iOS 3D-flip, swipe and accessibility risks and the static-route check added to the manual checklist; the missing `user-event` dependency.
- **Nice-to-have:** Playwright with axe-core automation, GitHub Actions once a remote exists, fast-check for the parser invariant.

### Validation Issues Addressed

1. `Result` failures can carry details, so FR-6's `no-cards` refusal returns the Skipped lines (AD-5, Pattern Examples).
2. `engines.node` is `>=22.12` (AD-12).
3. A native `<dialog>` confirmation lives in `components/ui/confirm-dialog.tsx` with a test, and `window.confirm` is banned (PAT-15, structure, FR-11 mapping).
4. ESLint also bans parser, reducer, storage and saved-state imports in `components/screens/**` and `components/ui/**` (Pattern Enforcement).
5. PAT-17's Node project includes `lib/copy.test.ts`.
6. A Deck on the Paste screen is saved as `ready`, and with no Deck the key is removed (PAT-9).
7. `docs/manual-checklist.md` covers the static-route check and the iOS 3D-flip, swipe and accessibility items: the scroll container sits inside each face, the swipe surface uses `touch-action: pan-y`, the hidden face is `inert`, and a 2D flip is the fallback.
8. The dependency manifest and install commands are added to the Implementation Handoff.
9. Decision A: a design sheet is approved before the first UI story.
10. Decision B: the PRD stays unchanged and this document is the reading.

### Architecture Completeness Checklist

**Requirements Analysis**

- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**

- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**

- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**

- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION. All 16 checklist items are confirmed and no Critical Gaps remain. One gate before the design-token step: the design sheet (decision A, `docs/design-sheet.md`) must be approved by the user. Decision B (PRD wording) is resolved as "this document is the reading".

**Confidence Level:** high for the core, state, storage, security and deployment path; medium for the UI until the design sheet exists.

**Key Strengths:**
- A pure, framework-free core with an executable specification (the acceptance table) and enforced boundaries.
- State that is derived rather than stored, so one source of truth and a small persisted payload.
- Privacy enforced by the browser (`connect-src 'none'`), not by discipline.
- Typed results instead of exceptions, and randomness injected so Shuffle is tested deterministically.
- Versions verified on the registry and a dry-run that resolves cleanly.

**Areas for Future Enhancement:** Playwright with axe-core automation for NFR-2 to NFR-4; GitHub Actions CI once a remote exists; fast-check for the parser invariant; splitting storage keys only if measured writes demand it; an animation library only if CSS cannot meet a design need.

### Implementation Handoff

**AI Agent Guidelines:**

- Follow all architectural decisions (AD-1 to AD-12) exactly as documented.
- Use the implementation patterns (PAT-1 to PAT-18) consistently across all components.
- Respect the project structure and boundaries.
- Refer to this document for all architectural questions; where it differs from the PRD, see the Gap Analysis.

**Dependency Manifest** (verified against the npm registry on 10 Nov 2026; a dry-run of the set resolved cleanly):
- Runtime: `next` 16.4.6, `react` and `react-dom` 19.3.1.
- Existing dev: `typescript` ^5.9 (stay on 5.x), `tailwindcss` 4.3.5 with `@tailwindcss/turbopack` 4.3.5, `eslint` ^9 (stay on 9.x), `eslint-config-next` 16.4.6, `@types/react` ^19, `@types/react-dom` ^19.
- New dev: `vitest` 5.1.0, `@vitejs/plugin-react` 6.3.0, `jsdom` 31.0.0, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.8, `vite-tsconfig-paths` 6.1.1, `@types/node` ^22.
- Optional: `fast-check` 4.10.2. Deferred: `@playwright/test` 1.65.0 and `axe-core` / `@axe-core/playwright` 4.14.0.

**First Implementation Priority:** housekeeping, then the pure core.

```bash
npm install next@16.4.6 react@19.3.1 react-dom@19.3.1
npm install -D eslint-config-next@16.4.6 vitest@5.1.0 @vitejs/plugin-react@6.3.0 jsdom@31.0.0 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.8 vite-tsconfig-paths@6.1.1 @types/node@^22
```

Then remove the boilerplate, set `engines.node` to `>=22.12`, add the `typecheck` and `test` scripts and the Vitest projects, and build the pure core with its tests (parser against the acceptance table first).

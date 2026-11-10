---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-flashflip-2026-11-10/prd.md'
  - '_bmad-output/planning-artifacts/architecture.md'
---

# FlashFlip - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for FlashFlip, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

IDs are kept as the PRD writes them (FR-1 to FR-17), so they match the architecture and the test titles (PAT-2). `P-nn` rows are the PRD's messy-paste acceptance table (PRD §4.1).

FR-1: The Student can paste or type Paste text in the Paste box and tap "Make cards". "Make cards" is disabled while the Paste text is empty or only whitespace; Enter in the Paste box inserts a line break and never triggers it; a successful "Make cards" replaces any existing Deck and shows the Ready screen.

FR-2: The app splits Paste text into Lines at CRLF, LF, CR, U+2028 and U+2029, and trims whitespace from both ends of each Line. Whitespace means the Unicode White_Space characters (including U+00A0 and U+3000) plus U+FEFF and U+200B. A blank Line is ignored (it makes no Card and is not a Skipped line). No Term or Definition begins or ends with whitespace, U+FEFF or U+200B. (P-20 to P-24)

FR-3: If a trimmed Line starts with a bullet (•, ◦, ▪, ●, *, -, –, —) or a number marker (one to three digits followed by "." or ")") and then whitespace, the app removes that one marker before looking for a Separator. A number or dash not followed by whitespace stays in the Term (`3.14 - pi`); a letter followed by "." stays in the Term (`A. Smith - economist`); letter markers such as "a)" are deliberately not removed. (P-13, P-14, P-19)

FR-4: For each remaining Line the app tries these rules in order and splits at the first match of the first rule that matches: (1) a tab; (2) a run of one or more dash characters (any character with the Unicode Dash property, such as - – — ―; a run such as "--" is one Separator) with whitespace on both sides; (3) a colon followed by whitespace, or a fullwidth colon (：) anywhere; (4) a run of two or more em dashes (——) anywhere. The Term is the text before the Separator and the Definition the text after it, each trimmed, with runs of whitespace inside either collapsed to one space. A hyphen inside a word is not a Separator; a colon with no whitespace after it is not a Separator (`Ratio 3:1`); the first match wins within the winning rule (`a - b - c` gives "a" and "b - c"); a tab outranks a dash and a dash outranks a colon; several tabs put everything after the first tab in the Definition, shown as single spaces. (P-01 to P-12, P-15 to P-18)

FR-5: A non-blank Line that has no Separator, or whose Term or Definition is empty, is a Skipped line. The app never drops a non-blank Line without listing it: the number of Cards plus Skipped lines plus blank Lines equals the number of Lines. The Ready screen lists each Skipped line with its 1-based line number (blank Lines count), its first 80 characters, and a reason: "no separator", "missing term" or "missing definition". A Definition wrapped onto a second Line makes one Card and one Skipped line (Lines are not joined). Duplicate Lines make duplicate Cards. (P-10, P-12, P-25 to P-28, P-31)

FR-6: If "Make cards" cannot make a Deck, the Student stays on the Paste screen with the Paste text intact and any existing Deck is kept. It cannot make a Deck when the Paste text is longer than 200,000 characters (message "Too much text (max 200,000 characters)"), when no Line becomes a Card (message "No cards could be made", with the Skipped lines listed below the Paste box), or when more than 1,000 Cards would be made (message "Too many cards (max 1,000)"). Exactly 200,000 characters and exactly 1,000 Cards still make a Deck. After any refusal, a reload shows the same Deck as before, or the Paste screen if there was none.

FR-7: The Ready screen shows what "Make cards" made and lets the Student start a Pass: "N cards, M skipped", the Skipped lines, a preview of the first 3 Cards as Term → Definition (fewer if the Deck is smaller), the Shuffle setting (FR-12), "Start", "Edit text" and "New deck". "Start" opens the Study screen at Card 1 of N with all Marks cleared. "Edit text" opens the Paste screen with the same Paste text and keeps the Deck until a later "Make cards" succeeds.

FR-8: On the Study screen the Student sees one Card at a time, Term first, and can flip it to the Definition and back (a tap or click on the Card, or Enter or Space while it has focus). The screen shows "n of N", where n is the Card's position in the Pass (starting at 1) and N is the Deck size. Every Card is shown Term first when it appears.

FR-9: After flipping a Card at least once, the Student can Mark it "Knew it" or "Missed it"; both buttons are disabled until the Card has been flipped at least once. Marking a Card records the Mark and shows the next Card, Term first, with n up by 1; Marking the last Card opens the Result screen. Each Card gets exactly one Mark per Pass, and a Mark cannot be changed (no undo in the MVP).

FR-10: The Result screen shows the Score as "X of N (P%)", where X is the number of "Knew it" Marks in the Pass (including Marks restored after a reload), N is the Deck size, and P is 100 × X ÷ N rounded to a whole number with halves rounded up: 5 of 7 shows 71%, 0 of 4 shows 0%, 4 of 4 shows 100%, 1 of 8 shows 13%, 3 of 8 shows 38%; a Deck of 1 Card shows "1 of 1 (100%)" or "0 of 1 (0%)".

FR-11: From the Result screen the Student can run the same Deck again or make a new one. "Start again" clears all Marks and starts a new Pass at Card 1 of N on the Study screen, in Deck order if Shuffle is off or in a new random order if it is on. "New deck" discards the Deck and the Pass and opens the Paste screen with an empty Paste box. "New deck" is also offered on the Ready and Study screens; on the Study screen, once at least one Mark exists, it first asks "Discard this deck and your progress?", and declining changes nothing.

FR-12: The Student can turn Shuffle on or off on the Ready screen and the Result screen (off by default, changeable only between Passes, never offered on the Study screen). With Shuffle off, a Pass visits the Cards in Deck order. With Shuffle on, a Pass visits every Card exactly once in a random order (for Decks of 1, 2, 10 and 1,000 Cards, none missing or repeated). The Pass order is fixed when the Pass starts and does not change during the Pass or after a reload.

FR-13: The random order is an unbiased permutation: over 10,000 Passes of a 3-Card Deck started with Shuffle on, each of the six possible orders occurs in 14.7% to 18.7% of the Passes.

FR-14: The app writes the Saved state (Paste text, Deck, Shuffle setting, Pass order, position and Marks) when a Deck is made and after every Mark, "Start", "Start again" and Shuffle change, and restores it when the page is opened. A Deck of 10 Cards with 4 Marked reloads to Card 5 of 10, Term first, with the same Pass order and the same 4 Marks; a reload on the Result screen shows the same Score; a reload on the Ready screen shows the same Cards, Skipped lines and Shuffle setting, and "Edit text" opens the same Paste text; with no Saved state the app opens on the Paste screen with an empty Paste box.

FR-15: The Ready, Study and Result screens show a notice that the Deck is saved on this device only. It says that the Deck lives only in this browser on this device, that clearing the browser's site data deletes it, and that on iPhone Safari it can also be deleted after about a week without opening the site unless the site is added to the Home Screen. It is present on all three screens, in text at least as large as body text, and not inside a collapsed or hidden element.

FR-16: If the browser refuses to read or write the Saved state, the app still works for the current session. When writing fails (storage blocked, unavailable or full), every screen keeps working and the app shows the notice "Can't save here: your deck will be lost when you close this tab". When the stored data cannot be read, is not valid, or has an unknown version, the app ignores it and opens on the Paste screen without crashing.

FR-17: The app shows each Term and Definition exactly as made, in any script, and never interprets Paste text as markup. The text shown equals the text made from the Paste text, character for character, including emoji sequences and combining marks (P-29, P-30). Term and Definition are shown in separate elements with automatic text direction (a Term of `خلية` is laid out right-to-left, a Definition of `cell` left-to-right). Markup is shown as characters: a Term of `<b>x</b>` displays `<b>x</b>`, and a Term of `<img src=x onerror=alert(1)>` runs no script. A Definition of 1,000 characters wraps inside the Card with no horizontal scrolling at 320 px width, and the Card's content scrolls vertically when it is taller than the screen. Sample Cards in Latin, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Chinese, Japanese, Korean, Thai and emoji show no replacement boxes on Safari for iOS and Chrome for Android (manual check).

### NonFunctional Requirements

NFR-1: Performance. "Make cards" on 1,000 Lines completes within 500 ms on a mid-range phone (a 2022-era Android or iPhone SE class device), and any tap on the Study screen shows its result within 200 ms.

NFR-2: Privacy. Paste text, Cards and Marks never leave the device: after the page has loaded, pasting, making Cards, studying and finishing a Pass cause no network requests; the app sets no cookies and loads no third-party scripts, fonts or analytics.

NFR-3: Accessibility and touch. Every control works by keyboard with a visible focus indicator; text meets WCAG 2.2 AA contrast (4.5:1); every tap target is at least 44 × 44 CSS px; an automated axe-core run reports no serious or critical issues on the four screens. (The architecture runs axe manually in the MVP; automating it is a deferred upgrade, AD-11.)

NFR-4: Devices. The app works from 320 px width on the current and previous major versions of Safari on iOS, Chrome on Android, and desktop Chrome, Edge, Firefox and Safari.

NFR-5: Interface language. Interface text is English only; only Card text is multilingual.

### Additional Requirements

**Starter template and first-story housekeeping (impacts Epic 1, Story 1)**

- Starter: `create-next-app`, already initialized in this repository (Next.js 16.4.5, React 19.3.0, Tailwind CSS 4.3, TypeScript 5.9, ESLint 9, Turbopack; no `src/` folder, no FlashFlip code yet). Do not re-initialize. The architecture says the first implementation story becomes: remove the boilerplate, update the patch versions, and add the Vitest setup (config, `test` script, one passing test).
- Remove the boilerplate: the demo `app/page.tsx`, the "Create Next App" title and description, the demo SVGs in `public/` (the folder goes), and the `body` rule in `app/globals.css` that forces Arial over the Geist font.
- Dependencies (verified against the npm registry on 10 Nov 2026; a dry-run of the whole set resolved cleanly): `next` 16.4.6, `react` and `react-dom` 19.3.1, `eslint-config-next` 16.4.6; dev: `vitest` 5.1.0, `@vitejs/plugin-react` 6.3.0, `jsdom` 31.0.0, `@testing-library/react` 16.3.3, `@testing-library/dom` 10.4.2, `@testing-library/jest-dom` 7.0.1, `@testing-library/user-event` 14.6.8, `vite-tsconfig-paths` 6.1.1, `@types/node` ^22. Stay on TypeScript 5.x and ESLint 9.x. Optional: `fast-check` 4.10.2.
- Scripts and runtime: add `typecheck` (`tsc --noEmit`) and `test` (`vitest run`) beside the starter's `dev`, `build`, `start` and `lint`; set `engines.node` to `>=22.12`; add `vitest.config.ts` (two projects, "core" in Node and "dom" in jsdom, PAT-17) and `vitest.setup.ts`.
- Keep the starter's `next.config.ts` settings (`cacheComponents`, `partialPrefetching`). Keep Server Components trivial, with state, randomness and storage access in Client Components.

**Architecture decisions**

- AD-1 What is stored: one versioned localStorage key holds the Paste text and the progress (screen, Shuffle setting, Pass order, Marks). The Deck and the Skipped lines are not stored: the parser re-derives them from the Paste text on load. Position is derived from the number of Marks (PAT-10), not stored. A `parserVersion` constant is stored with the state and bumped whenever FR-2 to FR-4 change; on a mismatch the Paste text is kept, the progress is dropped, and the app opens on the Ready screen. The restored screen is Ready, Study or Result; the Paste screen is never restored.
- AD-2 Validation and versions: a hand-written validator with no schema library, in two stages: structure (types, enums, sizes), then consistency against the re-derived Deck (the Pass order is a permutation of the Cards, the position is in range, each position has at most one Mark). An unknown schema version or any invalid data is discarded as if absent (FR-16). No migrations in the MVP.
- AD-3 Characters: length limits (FR-6) count UTF-16 code units (JavaScript `length`); the 80-character display of a Skipped line (FR-5) counts grapheme clusters through `Intl.Segmenter`, so an emoji or combining sequence is never split.
- AD-4 Browser-enforced privacy: static security headers set through `headers()` in `next.config.ts`, in production builds only: a Content Security Policy (`default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `font-src 'self'`; `connect-src 'none'`; `object-src 'none'`; `base-uri 'none'`; `form-action 'none'`; `frame-ancestors 'none'`), `Referrer-Policy: no-referrer`, and a `Permissions-Policy` denying camera, microphone and geolocation. Verified on a production build: no blocked first-party request, no console violations. Safe rendering (FR-17): Paste text reaches the page only as React text, and ESLint bans `dangerouslySetInnerHTML`. No telemetry: Vercel Web Analytics and Speed Insights stay off.
- AD-5 Error handling: parsing and storage return typed results (`{ ok: true, value }` or `{ ok: false, reason, … }`) instead of throwing; a failure may carry details (FR-6's `no-cards` refusal carries the Skipped lines). Only the storage adapter catches exceptions and converts them to results. The UI turns reasons into the PRD's messages.
- AD-6 State: `useReducer` over a pure reducer `(state, action) => state`, no state library. Randomness never enters the reducer: the caller generates the Pass order from an injected random source and passes it in the `pass-started` action.
- AD-7 Structure and routing: one route, `/`. `app/page.tsx` is a trivial Server Component rendering one `FlashFlipApp` Client Component. The four screens are components chosen by state, with no URLs and no history entries. The pure core lives in `lib/` (parser, score, shuffle, reducer, storage schema and validator) and the UI in `components/`.
- AD-8 First paint and restore: the server sends a static shell; after mount the client reads Saved state and restores it, showing a neutral skeleton until then so the Paste screen never flashes before the Study screen. Saving happens after the state update, outside the tap's critical path (NFR-1).
- AD-9 Large Skipped-line lists: the Ready screen and the refusal view under the Paste box show the first 100 Skipped lines and a "Show all N" control; the rest render with `content-visibility: auto`. Every Skipped line stays listed (FR-5). "Show all N" is UI text the PRD does not specify.
- AD-10 Design system and motion (Gen Z direction): design tokens in `app/globals.css` under `@theme` (colors, radii, type scale, motion durations), dark-first with light following the system setting, values taken from the approved design sheet (`docs/design-sheet.md`); CSS-first animation (3D card flip, screen transitions) with `motion-reduce` fallbacks; swiping a flipped Card to either side Marks it through a small Pointer Events hook, enabled only after a flip, with the buttons and keyboard kept (FR-8, FR-9, NFR-3); a CSS confetti burst on the Result screen; Geist stays unless another font is chosen, self-hosted at build (NFR-2); no animation library unless a need appears. Button labels and messages fixed by the PRD stay as written; a casual tone applies only to unspecified text (headings, empty states, the Result headline). Streaks, sharing and leaderboards remain Non-Goals. Token values must clear WCAG 2.2 AA contrast in both themes.
- AD-11 Testing layers: Vitest 5.1 in a Node environment for the parser against the full acceptance table (P-01 to P-31) plus the Cards + Skipped lines + blank Lines invariant, Score rounding, Shuffle, the reducer and the storage validator; Vitest with jsdom and Testing Library for screens, restore after reload (FR-14), the device-only notice (FR-15), storage-failure paths with stubbed storage (FR-16), text direction and markup safety (FR-17). Shuffle uniformity (FR-13) is covered twice: an exhaustive check of every draw sequence for a 3-Card Deck and the 10,000-run statistic with a seeded random source. NFR-2 to NFR-4 start as a manual checklist on a production build (`docs/manual-checklist.md`): no network requests, an axe-core run, Safari on iOS and Chrome on Android; the iOS 3D-flip, swipe and accessibility items; the static-route check.
- AD-12 Deploy, CI and runtime: Vercel hosting with static output, no functions, no environment variables, no secrets. The repository is local-only (no remote), so CI is deferred. `engines.node` `>=22.12`, `@types/node` ^22.
- Deferred, not part of the MVP: Playwright with axe-core automation, GitHub Actions CI, the choice of first-deployment route (Vercel CLI or a Git import, made at deploy time), splitting storage into two keys, an animation library.

**Implementation patterns (PAT-1 to PAT-18) and enforcement**

- PAT-1 Files: kebab-case for every file (`flash-flip-app.tsx`, `parse-lines.ts`); Next's reserved names stay as Next defines them. PAT-8 Imports: the `@/` alias, relative paths only within the same folder, no barrel (`index.ts`) files.
- PAT-2 Tests: co-located (`parse-lines.test.ts` beside `parse-lines.ts`); test titles start with the PRD ID (`P-09 well-known - widely recognised`, `FR-13 …`); the acceptance table is typed data in `lib/core/acceptance-table.ts`, iterated by the parser test. PAT-17: two Vitest projects chosen by folder, Node for `lib/core/**` and `lib/copy.test.ts`, jsdom for `components/**`, `lib/hooks/**` and `lib/storage/**`.
- PAT-3 Actions: past-tense kebab-case events in one exported `Action` discriminated union in `lib/core/session.ts` (`deck-made`, `pass-started`, `card-marked`, `shuffle-set`, `deck-discarded`); every `switch` ends in an exhaustiveness check.
- PAT-4 Strings: messages shown to the Student come only from `lib/copy.ts` (every PRD-fixed string, plus functions for interpolated ones such as `tooManyCards(max)`); components and tests import from it.
- PAT-5 The core stays pure: `lib/core/**` imports no `react`, `next/*` or browser globals (ESLint-enforced); no `utils.ts` or `helpers.ts`.
- PAT-6 Crashes: one `app/error.tsx` boundary with a "Start over" button that clears Saved state; no error-reporting service, only `console.error`; the wording lives in `lib/copy.ts`.
- PAT-7 Glossary in code: PRD terms verbatim (`Card` as `{ term, definition }`, `Deck`, `Pass`, `Mark` as `'knew' | 'missed'`, `Score`, `SkippedLine` as `{ lineNumber, text, reason }` with reason `'no-separator' | 'missing-term' | 'missing-definition'`, `Screen` as `'paste' | 'ready' | 'study' | 'result'`, `Separator`); no synonyms (`flashcard`, `quiz`, `answer`, `item`).
- PAT-9 Saved state: one localStorage key, `flashflip:saved-state`; a JSON object with camelCase fields (`version`, `parserVersion`, `pasteText`, `screen`, `shuffle`, `order`, `marks`); no `null`, no dates; a Deck shown on the Paste screen (after "Edit text") is saved as `screen: 'ready'`; with no Deck the key is removed rather than written.
- PAT-10 No redundant state: state holds `screen`, `pasteText`, `shuffle`, `order` and `marks`; the Deck, Skipped lines, position (`marks.length`), current Card and Score are derived by pure selectors in `lib/core/selectors.ts`; the flip state of the current Card is local to the Study screen (not in the reducer, never persisted).
- PAT-11 Storage access: only `lib/storage/` touches `localStorage`; one persistence hook calls the adapter in a single effect after state changes. PAT-12 Validation timing: parse only on "Make cards", never on keystrokes; stored data is validated only at restore. PAT-13 Loading: one `restoring` phase before the reducer exists, then the skeleton; no other spinners.
- PAT-14 Styling: Tailwind utilities in JSX with values from `@theme` tokens; semantic token names (`--color-surface`, `--color-accent`, `--radius-card`, `--duration-flip`); no hard-coded colors or pixel values outside tokens; no CSS modules or styled-components; inline `style` only for dynamic transforms such as the swipe.
- PAT-15 Accessibility: a native `<button>` for every action, each screen moves focus to its heading on mount, flips and messages announce through one `aria-live="polite"` region, no positive `tabIndex`, and confirmations (FR-11) use the native `<dialog>` through `components/ui/confirm-dialog.tsx`, never `window.confirm`.
- PAT-16 Constants and types: `SCREAMING_SNAKE_CASE` for limits and fixed values (`MAX_PASTE_CHARS`, `MAX_CARDS`, `PREVIEW_CARD_COUNT`, `SKIPPED_LINES_SHOWN`, `SKIPPED_LINE_DISPLAY_LENGTH`); no `I` prefix on types; comments say why and cite a PRD or AD ID. PAT-18 Injected randomness: Shuffle takes `random: () => number`; production passes `Math.random`, tests pass seeded or scripted sources; neither the reducer nor `shuffle.ts` calls `Math.random`.
- Enforcement: `npm run lint` (ESLint overrides by folder: restricted imports and globals in `lib/core/**`, `localStorage` allowed only in `lib/storage/**`, imports of the parser, reducer, saved-state and storage modules banned in `components/screens/**` and `components/ui/**`, `dangerouslySetInnerHTML` banned everywhere), `npm run typecheck` (exhaustiveness on `Action` and `Screen`), `npm run test` (the Node project fails if core code touches the DOM; the parser test iterates every acceptance-table row).

**Target structure** (full tree in the architecture, "Complete Project Directory Structure")

- `app/` (`layout.tsx`, `page.tsx`, `error.tsx`, `globals.css`); `components/` (`flash-flip-app.tsx` as the single `'use client'` boundary, `screens/` for paste, ready, study and result, `ui/` for flip-card, skipped-lines, shuffle-toggle, confirm-dialog, notices, screen-heading, live-region, confetti, skeleton); `lib/core/` (types, limits, result, assert-never, text-units, list-markers, separators, parse-lines, acceptance-table, score, shuffle, seeded-random, session, selectors, saved-state), `lib/storage/local-storage.ts`, `lib/hooks/` (use-saved-state, use-swipe), `lib/copy.ts`; `docs/design-sheet.md` and `docs/manual-checklist.md`; `vitest.config.ts`, `vitest.setup.ts`; `README.md` replaced with run, test and deploy notes.

**Gate and open dependencies**

- Design sheet gate: `docs/design-sheet.md` does not exist yet. The architecture requires the user to approve it before the first UI story, and it gates the design-token step (tokens, flip, swipe hook, confetti, reduced-motion fallbacks), not the pure core. Its contents: palette pairs checked for contrast in both themes, type scale, radii, motion timings, tone examples for unspecified text.
- PRD §9 question 1: collect at least 10 real pastes (Notion, Google Docs, chat apps) before FR-2 to FR-4 are frozen. The acceptance table uses synthetic examples.
- Architecture decision B: the PRD wording of "characters" and "lists each" (FR-5, FR-6) is read through AD-3 and AD-9; the PRD stays unchanged.

**Scope guards from the PRD**

- Non-goals (§6): no accounts, login, sync, sharing or Deck library; no spaced repetition, schedules, streaks, history or statistics; no editing a Card inside a Deck (the fix for a bad Line is "Edit text" and "Make cards" again); no translation, dictionary or language detection; no analytics or tracking; no undo of a Mark; no joining of wrapped Lines or multi-line Definitions.
- Out of scope for the MVP (§7.2): retrying only the missed Cards; a Definition-first mode; more than one Deck; file import and export; a translated interface; images and audio; offline install; saving Paste text before "Make cards".
- Precision over recall (§4.1, SM-C1): a Line the parser cannot read with confidence is listed, never guessed at. Do not loosen Separator rules to lower the Skipped line count. SM-C2: do not remove the Ready screen's Skipped line list or Card preview to shorten the time to the Study screen.
- Success metrics the build is judged by (§8): SM-1 parse fidelity (every acceptance-table row passes; on 5 real Notes from different sources at least 90% of intended Cards are made correctly and every other non-blank Line is listed); SM-2 unaided first Pass (5 of 5 Students reach a Score without help, at least 4 reach the Study screen within 60 seconds of pasting); SM-3 Saved state holds (no Deck, position or Mark lost across 50 reload and tab-discard cycles on Safari for iOS and Chrome for Android).

### UX Design Requirements

Not applicable: no UX Design document exists for this project, so there are no UX-DR items. The visual direction comes from the architecture (AD-10) and the design sheet that still has to be written and approved (see "Gate and open dependencies" above).

### FR Coverage Map

Epic 1 is the only epic, so each line also names the story that completes the requirement. Stories are numbered in build order: Story 1 "Paste cards and flip quiz", Story 2 "Score, shuffle and keep cards after refresh", Story 3 "Bulletproof paste".

- FR-1: Epic 1, Story 1 - Paste box and "Make cards" (disabled when empty, Enter never triggers it, replaces the Deck)
- FR-2: Epic 1, Story 3 - Every line break and Unicode whitespace rule (basic Line split and trim in Story 1)
- FR-3: Epic 1, Story 3 - Remove one leading list marker
- FR-4: Epic 1, Story 3 - Separator rules in full, with their precedence (tab, spaced dash and colon in Story 1)
- FR-5: Epic 1, Story 3 - Skipped lines with line number, first 80 characters and reason, and the Cards + Skipped lines + blank Lines = Lines count (a basic Skipped line list in Story 1)
- FR-6: Epic 1, Story 3 - Refuse unusable Paste text: over 200,000 characters, no Cards, over 1,000 Cards (the "No cards could be made" refusal arrives in Story 1, so an empty Deck never reaches the Ready screen)
- FR-7: Epic 1, Story 1 - Ready screen: counts, Skipped lines, 3-Card preview, "Start", "Edit text", "New deck" (its Shuffle setting arrives with FR-12)
- FR-8: Epic 1, Story 1 - Flip a Card, Term first, "n of N"
- FR-9: Epic 1, Story 1 - Mark "Knew it" or "Missed it" after a flip and advance; the last Mark opens the Result screen (a bare screen until Story 2)
- FR-10: Epic 1, Story 2 - Score "X of N (P%)" on the Result screen
- FR-11: Epic 1, Story 2 - "Start again" and "New deck", with the Study-screen confirmation
- FR-12: Epic 1, Story 2 - Shuffle setting and Pass order
- FR-13: Epic 1, Story 2 - Unbiased random order
- FR-14: Epic 1, Story 2 - Save and restore the Saved state
- FR-15: Epic 1, Story 2 - Device-only notice on the Ready, Study and Result screens
- FR-16: Epic 1, Story 2 - Keep working when saving fails
- FR-17: Epic 1, Story 3 - Show text exactly, in any script (the flip card is built text-only with automatic text direction in Story 1)

NFRs and architecture requirements, listed so none is lost:

- NFR-1: Story 3 checks the parse time for 1,000 Lines (500 ms) and the long-list rendering; Stories 1 and 2 keep every tap within 200 ms, with saving done after the state update (AD-8).
- NFR-2: Story 2 (one storage adapter, nothing leaves the device, the device-only notice); Story 3 (security headers with `connect-src 'none'`, checked on a production build).
- NFR-3, NFR-4, NFR-5: every story (keyboard and focus, contrast, 44 px targets, 320 px width, English strings in `lib/copy.ts`); Story 3 closes with the axe-core run and the manual device checklist.
- Starter housekeeping, Vitest setup and scripts: Story 1. The design sheet gate is the first task of Story 1.
- AD-1, AD-2 and AD-8 (Saved state, validator, restore, skeleton) with PAT-9, PAT-11 and PAT-13: Story 2. AD-5 and AD-6 (typed results, pure reducer) start in Story 1; injected randomness (PAT-18) arrives with Shuffle in Story 2.
- AD-3 and AD-9 (what a character is, long Skipped-line lists) and AD-4 (security headers): Story 3.
- AD-10 (design tokens, 3D flip, swipe, confetti, reduced motion): Stories 1 and 2, once the design sheet is approved.
- AD-11 (tests): each story tests its own requirements, and the acceptance-table test (P-01 to P-31) is complete in Story 3. AD-12 (deploy): not a story.

## Epic List

### Epic 1: Study from your own notes in seconds

A first-year student can paste notes in whatever format they arrive, get flashcards in seconds, and flip through them on a phone. They mark each card "Knew it" or "Missed it", see an honest Score, and find the deck still there after a refresh. Everything stays on the device, with no account.

**FRs covered:** FR-1, FR-2, FR-3, FR-4, FR-5, FR-6, FR-7, FR-8, FR-9, FR-10, FR-11, FR-12, FR-13, FR-14, FR-15, FR-16, FR-17

**NFRs addressed:** NFR-1 to NFR-5, in every story and checked together at the end on a production build.

**Implementation notes:**

- One epic on purpose: the three stories work in the same core (parser, session state, four screens), the architecture is complete and validated, and no story's result should change the direction of the next.
- Build order (the stories are written in the next step). Each story builds only on the ones before it:
  1. Paste cards and flip quiz: FR-1, FR-7, FR-8, FR-9, a first simple parser (tab, spaced dash and colon), and the starter housekeeping the architecture puts in the first story.
  2. Score, shuffle and keep cards after refresh: FR-10 to FR-16.
  3. Bulletproof paste: FR-2 to FR-6 in full, FR-17, and the closing production checks.
- Parser in two passes: Story 1 handles the common formats so the loop works end to end. Story 3 completes FR-2 to FR-5 against all 31 acceptance rows (P-01 to P-31) and adds the limits, refusals and long Skipped-line lists (AD-3, AD-9). FR-17 works the same way: Story 1's flip card is text-only with automatic text direction, and Story 3 verifies it across scripts.
- End of a Pass: FR-9 opens the Result screen after the last Mark. In Story 1 it is a bare screen; the Score, "Start again" and Shuffle arrive in Story 2.
- Design sheet gate: `docs/design-sheet.md` must be approved by the user before UI work. Drafting it is the first task of Story 1. The housekeeping and the pure core are not held by it; the UI is.
- Closing checks: the security headers (AD-4), the manual NFR checklist (`docs/manual-checklist.md`) and the README are the last tasks of Story 3, since they all run on a production build. Deployment is not a story: the route is chosen at deploy time (AD-12).
- Real pastes: PRD §9 question 1 asks for at least 10 real pastes before FR-2 to FR-4 are frozen. They are input to Story 3.

<!-- Repeat for each epic in epics_list (N = 1, 2, 3...) -->

## Epic {{N}}: {{epic_title_N}}

{{epic_goal_N}}

<!-- Repeat for each story (M = 1, 2, 3...) within epic N -->

### Story {{N}}.{{M}}: {{story_title_N_M}}

As a {{user_type}},
I want {{capability}},
So that {{value_benefit}}.

**Acceptance Criteria:**

<!-- for each AC on this story -->

**Given** {{precondition}}
**When** {{action}}
**Then** {{expected_outcome}}
**And** {{additional_criteria}}

<!-- End story repeat -->

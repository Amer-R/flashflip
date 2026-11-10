---
baseline_commit: 1882f7abbae2cac7a82e4fd8f3f48c5508ef9b40
---

# Story 1.1: Paste cards and flip quiz

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-year student,
I want to paste my notes, get cards, and flip through them marking what I knew,
so that I can start studying within a minute of pasting.

**Covers:** FR-1, FR-7, FR-8, FR-9, a first parser (tab, spaced dash, colon), a basic Skipped-line list, the "No cards could be made" refusal, and the starter housekeeping (AD-5, AD-6, AD-7 begin here).

## Acceptance Criteria

1. **Housekeeping.** Given the starter repo, when the story is done, then the demo page, "Create Next App" metadata, `public/` SVGs and the Arial `body` rule are gone, the versions in the Dependency Manifest are installed, `typecheck` and `test` scripts exist, `engines.node` is `>=22.12`, and `vitest.config.ts` has the "core" (Node) and "dom" (jsdom) projects with one passing test. And `npm run lint`, `typecheck`, `test` and `build` all pass.
2. **Design sheet gate.** Given `docs/design-sheet.md` has not been approved, when UI work would begin, then the sheet is drafted (palette pairs with contrast checks in both themes, type scale, radii, motion timings, tone examples) and work stops for the user's approval first. And the pure core (types, parser, reducer) is not held by this gate.
3. **Make cards is guarded (FR-1).** Given the Paste box is empty or whitespace only, then "Make cards" is disabled. And pressing Enter in the box inserts a line break and never triggers it.
4. **First parser (FR-1, FR-5 basic).** Given Paste text with tab-, spaced-dash- and colon-separated lines (precedence in that order), when the Student taps "Make cards", then each such line becomes a Card `{ term, definition }` and the Ready screen appears, replacing any existing Deck. And every non-blank line that makes no Card is listed as a Skipped line with its line number, first 80 characters and reason.
5. **Refusal (FR-6 partial).** Given no line becomes a Card, when the Student taps "Make cards", then they stay on the Paste screen with their text intact and see "No cards could be made", with the Skipped lines listed below the box. (An existing Deck is kept.)
6. **Ready screen (FR-7).** It shows "N cards, M skipped", the Skipped lines, a preview of the first 3 Cards as Term → Definition, "Start", "Edit text" and "New deck". "Edit text" returns to the Paste screen with the same text and keeps the Deck. "Start" opens the Study screen at Card 1 of N with no Marks. "New deck" discards the Deck and opens an empty Paste screen. (No Shuffle control yet; that is Story 1.2.)
7. **Study screen (FR-8, FR-9).** The Term shows first with "n of N". A tap, click, Enter or Space flips the Card to the Definition and back. "Knew it" and "Missed it" stay disabled until the Card has been flipped once. Marking records one Mark, shows the next Card Term-first with n up by 1, and cannot be undone. Marking the last Card opens a bare Result screen (Score, Shuffle, "Start again" come in Story 1.2).
8. **Cross-cutting UI rules.** Every control works by keyboard with a visible focus ring, tap targets are at least 44×44 px, text is readable at 320 px width, all Student-facing strings come from `lib/copy.ts`, and Term and Definition render as plain React text in separate elements with `dir="auto"`.
9. **Core quality.** The parser and reducer are pure (no `react`, `next/*` or browser globals), return typed results, and have tests titled with their FR IDs.

## Tasks / Subtasks

Follow red-green-refactor: write the failing test first for each core task.

- [x] Task 1: Housekeeping and test setup (AC: #1)
  - [x] 1.1 Run the install commands from the Dependency Manifest below (`next@16.4.6`, `react`/`react-dom@19.3.1`, dev deps, `@types/node@^22`). Do not add any dependency not listed there (HALT and ask if one seems needed).
  - [x] 1.2 Delete `public/` (the five demo SVGs). Keep `app/favicon.ico`.
  - [x] 1.3 `package.json`: add `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`, `"engines": { "node": ">=22.12" }`.
  - [x] 1.4 Create `vitest.config.ts` with two projects: `core` (environment `node`, includes `lib/core/**/*.test.ts` and `lib/copy.test.ts`) and `dom` (environment `jsdom`, includes `components/**/*.test.{ts,tsx}`, `lib/hooks/**`, `lib/storage/**`, uses `@vitejs/plugin-react`, `vite-tsconfig-paths` and `vitest.setup.ts`). Create `vitest.setup.ts` (jest-dom matchers + RTL cleanup).
  - [x] 1.5 Add one passing smoke test in each project (a trivial core test now; replaced by real tests below). Confirm `npm test` runs both projects.
  - [x] 1.6 `app/globals.css`: remove the `body { font-family: Arial ... }` rule so Geist (via `--font-sans`) applies. `app/layout.tsx`: replace the "Create Next App" title/description with FlashFlip text (`title: "FlashFlip"`; description in plain English).
  - [x] 1.7 ESLint (`eslint.config.mjs`): add `no-restricted-syntax`/`no-restricted-properties` for `dangerouslySetInnerHTML` everywhere, and a `lib/core/**` override banning imports of `react`, `react-dom`, `next/*` and the globals `window`, `document`, `localStorage`, `navigator` (PAT-5). Add the `components/screens/**` and `components/ui/**` import ban on `@/lib/core/parse-lines` and `@/lib/core/session` (PAT-11 / boundaries).
- [x] Task 2: Core types, result and copy (AC: #5, #8, #9)
  - [x] 2.1 `lib/core/types.ts`: `Card`, `Mark` (`'knew' | 'missed'`), `Screen` (`'paste' | 'ready' | 'study' | 'result'`), `SkippedLine` (`{ lineNumber, text, reason }`, reason `'no-separator' | 'missing-term' | 'missing-definition'`). PAT-7 names only.
  - [x] 2.2 `lib/core/result.ts` (`Result<T, F>` exactly as in Architecture "Pattern Examples"), `lib/core/assert-never.ts` (the only allowed `throw`), `lib/core/limits.ts` with `PREVIEW_CARD_COUNT = 3` and `SKIPPED_LINE_DISPLAY_LENGTH = 80` only (no 200,000/1,000 limits yet: Story 1.3).
  - [x] 2.3 `lib/copy.ts` with every string used so far: "Make cards", "Start", "Edit text", "New deck", "Knew it", "Missed it", "No cards could be made", `cardsMade(n, skipped)` → "N cards, M skipped", `position(n, N)` → "n of N", reason labels "no separator" / "missing term" / "missing definition", and the Paste-box label. Plus `lib/copy.test.ts` (Node project) that guards the exact PRD wording.
- [x] Task 3: First parser, pure (AC: #4, #5, #9)
  - [x] 3.1 Write `lib/core/parse-lines.test.ts` first. Titles start with the ID, e.g. `P-01 mitosis - cell division`. Cover PRD rows P-01 to P-06 and P-09 to P-12 (tab, hyphen/en dash/em dash/`--`, colon, hyphen inside a word, `Ratio 3:1`). P-07, P-08 (fullwidth colon, `——`) and P-13 onward belong to Story 1.3: do NOT implement or test them here.
  - [x] 3.2 Implement `parseLines(pasteText): Result<{ cards: Card[]; skippedLines: SkippedLine[] }, { reason: 'no-cards'; skippedLines: SkippedLine[] }>` in `lib/core/parse-lines.ts`. Rules for this story only: split Lines at `\r\n`, `\n`, `\r`; trim each Line (basic `String.prototype.trim`); a blank Line is ignored (no Card, not a Skipped line) but still counts for line numbers; try Separators in order: a tab; a run of dash characters (`-`, `–`, `—`) with whitespace on both sides; a colon followed by whitespace. First match of the first matching rule splits; trim Term and Definition. No Separator, or an empty Term or Definition → Skipped line (`lineNumber` is 1-based, blank Lines count; `text` is the first 80 characters via `.slice(0, 80)` for now, grapheme-safe truncation is Story 1.3).
  - [x] 3.3 Zero Cards returns `{ ok: false, reason: 'no-cards', skippedLines }`; otherwise `{ ok: true, value: { cards, skippedLines } }`. Never throw.
  - [x] 3.4 Add the invariant test: Cards + Skipped lines + blank Lines = Lines, for a mixed sample.
- [x] Task 4: Session reducer and selectors, pure (AC: #4, #6, #7, #9)
  - [x] 4.1 `lib/core/session.ts`: `SessionState` = `{ screen, pasteText, order, marks }` (no `shuffle` yet; no derived fields: PAT-10). `Action` union (PAT-3, past-tense kebab-case): `deck-made { pasteText }`, `pass-started { order }`, `card-marked { mark }`, `deck-discarded`, `text-editing-started` (Ready → Paste keeping the Deck; name it as a past-tense event). Pure reducer with an exhaustiveness check via `assertNever`. `card-marked` appends a Mark and moves to `result` when `marks.length` reaches the Deck size, so the reducer needs the Deck size: pass it in the action (`{ mark, deckSize }`) rather than importing the parser.
  - [x] 4.2 `lib/core/selectors.ts`: pure derivations from state (Deck and Skipped lines from `pasteText` via `parseLines`, position = `marks.length`, current Card = `deck[order[marks.length]]`, "n of N").
  - [x] 4.3 Tests (`session.test.ts`, `selectors.test.ts`, Node project): each action, "one Mark per Card, no change possible", last Mark → `result`, "Edit text" keeps `pasteText`, "New deck" clears text and Deck. Order in this story is always the identity order (`[0..N-1]`); the caller builds it and passes it in `pass-started` (PAT-18, no `Math.random` anywhere).
- [x] Task 5: Design sheet gate (AC: #2)
  - [x] 5.1 Draft `docs/design-sheet.md`: palette pairs (dark-first, light following the system) with computed contrast ratios ≥ 4.5:1, type scale, radii, motion timings, tone examples for unspecified text (headings, empty states, Result headline). Semantic token names (PAT-14).
  - [x] 5.2 **HALT and ask the user to approve the sheet.** Do not start Tasks 6 and 7 until the user says it is approved. Tasks 2 to 4 may be done before this.
- [x] Task 6: App shell and screens (AC: #3, #4, #5, #6, #7, #8)
  - [x] 6.1 `app/globals.css`: add the approved tokens under `@theme` (colors, radii, type scale, durations); the flip animation, swipe, confetti and reduced-motion work are Story 1.2.
  - [x] 6.2 `app/page.tsx`: trivial Server Component that renders `<FlashFlipApp />` and nothing else. `components/flash-flip-app.tsx` (`'use client'`): owns `useReducer(session)`, calls `parseLines` on "Make cards" (never on keystrokes, PAT-12), dispatches `deck-made` on success, returns the refusal to the Paste screen. No persistence, no skeleton, no restore (Story 1.2): state starts on the Paste screen.
  - [x] 6.3 `components/ui/screen-heading.tsx` (focus on mount, PAT-15), `components/ui/live-region.tsx` (single `aria-live="polite"`), `components/ui/skipped-lines.tsx` (plain list of ALL Skipped lines for now; "first 100 + Show all" is Story 1.3), `components/ui/flip-card.tsx` (Term and Definition in separate `dir="auto"` elements, plain React text, flip by click/Enter/Space on a native button or a focusable element with `role="button"`, no animation yet).
  - [x] 6.4 Screens in `components/screens/`: `paste-screen.tsx` (textarea; "Make cards" disabled for empty/whitespace-only text; Enter inserts a newline because it is a `<textarea>` inside no `<form>` submit; refusal message + Skipped lines below), `ready-screen.tsx`, `study-screen.tsx` (flip state is local `useState`, reset for each Card, never in the reducer; Mark buttons disabled until flipped), `result-screen.tsx` (bare: heading and "New deck").
  - [x] 6.5 Screens receive derived data and callbacks as props and import only `lib/copy.ts` and types, never the parser or reducer (boundary rule).
- [x] Task 7: Component tests (AC: #3 to #8)
  - [x] 7.1 Testing Library tests (jsdom project), titled with FR IDs: FR-1 (disabled when empty/whitespace; Enter adds a newline and does not make cards; success replaces any Deck), FR-6 partial (refusal message, text intact, Skipped lines listed, existing Deck kept), FR-7 (counts, preview of first 3, "Start", "Edit text" keeps text, "New deck"), FR-8 (Term first, flip by click, Enter, Space; "n of N"), FR-9 (buttons disabled until flipped; marking advances Term-first; last Mark → Result), FR-17 basics (`dir="auto"`, separate elements, `<b>x</b>` shown as characters).
- [x] Task 8: Final validation (AC: #1, #8, #9)
  - [x] 8.1 Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`; all pass. Run `npm run dev` and walk through paste → Ready → Study → Result at 320 px width and with the keyboard only.
  - [x] 8.2 Update File List, Completion Notes, Change Log. Do NOT mark anything done that was not run.

## Dev Notes

### Scope guards (do not build ahead)
- NOT in this story: Score text, Shuffle (setting, `shuffleOrder`, `seeded-random.ts`), "Start again", the "New deck" confirmation dialog, Saved state, `localStorage`, skeleton/restore, device-only notice, storage-failure notice, `app/error.tsx`, 3D flip, swipe hook, confetti, completion effect, security headers, `parserVersion`, the 200,000/1,000 limits, list-marker removal, fullwidth colon, `——`, Unicode-aware whitespace, grapheme truncation, "Show all N". These belong to Stories 1.2 and 1.3.
- "New deck" on the Study screen in this story has NO confirmation (the confirmation is FR-11, Story 1.2). To avoid losing progress silently, you may omit "New deck" from the Study screen in this story; the Ready screen's "New deck" is required.
- Precision over recall (PRD §4.1, SM-C1): never loosen Separator rules to lower the Skipped line count.

### Architecture requirements (must follow)
- **AD-5** typed results, never throw for expected failures. **AD-6** `useReducer` over a pure reducer; randomness never enters it. **AD-7** one route `/`; `app/page.tsx` is a trivial Server Component rendering one `FlashFlipApp` Client Component; the four screens are components chosen by state (no URLs, no history entries).
- **PAT-1** kebab-case files; **PAT-2** co-located tests titled with PRD IDs; **PAT-3** past-tense kebab-case actions in one `Action` union, exhaustive `switch` ending in `assertNever`; **PAT-4** all Student-facing strings in `lib/copy.ts`, never inline in components or tests; **PAT-5** `lib/core/**` has no `react`, `next/*` or browser globals and no `utils.ts`/`helpers.ts`; **PAT-7** glossary names verbatim (`Card`, `Deck`, `Pass`, `Mark`, `Score`, `SkippedLine`, `Screen`; never `flashcard`, `quiz`, `answer`, `item`); **PAT-8** `@/` imports, relative only in the same folder, no barrel files; **PAT-10** no redundant state (Deck, Skipped lines, position, current Card derived by selectors; flip state local to Study screen); **PAT-12** parse only on "Make cards"; **PAT-14** Tailwind utilities with token values, no hard-coded colors or pixel values outside tokens; **PAT-15** native `<button>` for every action, focus moves to each screen's heading on mount, one `aria-live="polite"` region, no positive `tabIndex`; **PAT-16** `SCREAMING_SNAKE_CASE` constants, comments cite a PRD or AD ID; **PAT-17** Vitest projects by folder; **PAT-18** injected randomness (not used yet).
- Anti-patterns to avoid: `Card.tsx` beside `card.tsx`, `utils.ts`, barrel files, `makeCards` as an action type, inline `'Make cards'`, `Math.random()`, `position` or `flipped` in reducer state, parsing in `onChange`, `<div onClick>`, a `catch {}` that swallows errors, `dangerouslySetInnerHTML`.

### Current state of files being changed (read before editing)
- `app/page.tsx`: the create-next-app demo (Next logo, Templates/Learning/Deploy links, uses `next/image` and `/next.svg`, `/vercel.svg`). Replace entirely; keep nothing.
- `app/layout.tsx`: loads Geist and Geist_Mono via `next/font/google` (self-hosted at build; keep, NFR-2), sets `lang="en"`, `h-full antialiased`, `<body className="min-h-full flex flex-col">`, and uses the global `LayoutProps<"/">` type. Preserve all of that; only change `metadata`.
- `app/globals.css`: `@import "tailwindcss"`, `:root` background/foreground variables, `@theme inline` mapping `--font-sans`/`--font-mono` to the Geist variables, a dark `prefers-color-scheme` block, and a `body` rule with `font-family: Arial`. Remove only the Arial line (the font must come from `--font-sans`); preserve the `@theme inline` font mapping; put the approved design tokens in `@theme` here.
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, and a Turbopack rule running `@tailwindcss/turbopack` on `*.css`. **Do not change it** in this story (headers come in Story 1.3).
- `eslint.config.mjs`: `defineConfig` with `eslint-config-next/core-web-vitals` and `/typescript`, and `globalIgnores`. Extend it; keep the existing entries.
- `tsconfig.json`: strict, `@/*` → `./*`, `target ES2017`, `moduleResolution: bundler`. No change expected; `vite-tsconfig-paths` reads the alias.
- `package.json`: scripts `dev`, `build`, `start`, `lint` today. Current versions: next 16.4.5, react/react-dom 19.3.0, `@types/node` ^20, no test tooling.
- `README.md` is the create-next-app text; it is replaced in Story 1.3, leave it.
- With Cache Components on, keep Server Components trivial and keep all state, randomness and storage access in Client Components (Architecture, Starter).

### Dependency manifest (verified on npm, 10 Nov 2026; the set resolves cleanly)
```bash
npm install next@16.4.6 react@19.3.1 react-dom@19.3.1
npm install -D eslint-config-next@16.4.6 vitest@5.1.0 @vitejs/plugin-react@6.3.0 jsdom@31.0.0 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @testing-library/jest-dom@7.0.1 @testing-library/user-event@14.6.8 vite-tsconfig-paths@6.1.1 @types/node@^22
```
Stay on TypeScript 5.x and ESLint 9.x. Vitest 5 needs Node `^22.12 || ^24 || >=26`. `fast-check` is optional and not needed here.

### Testing standards
- Node project for `lib/core/**` and `lib/copy.test.ts`; jsdom project for `components/**`, `lib/hooks/**`, `lib/storage/**`. A core file that touches the DOM must fail in the Node project.
- Test titles start with the PRD ID (`P-09 well-known - widely recognised`, `FR-8 …`). Use `@testing-library/user-event` for clicks, Enter and Space.
- The full acceptance table (`lib/core/acceptance-table.ts`, P-01 to P-31) is Story 1.3's job; here the parser test holds the 10 rows listed in Task 3.1 inline or as a small typed array you may later move into that file.

### Design gate
`docs/design-sheet.md` does not exist. The architecture requires the user's approval before UI work (Gap A). The pure core is not held by it. Draft the sheet, stop, and wait (Task 5.2). Gen Z direction: dark-first, casual tone only for unspecified text; fixed PRD labels ("Make cards", "Start", "Edit text", "New deck", "Knew it", "Missed it", "No cards could be made") stay exactly as written. Token values must clear WCAG 2.2 AA (4.5:1) in both themes.

### Project Structure Notes
- Files this story creates, per the Architecture tree: `app/page.tsx` (replace), `app/layout.tsx` and `app/globals.css` (edit), `components/flash-flip-app.tsx`, `components/screens/{paste,ready,study,result}-screen.tsx`, `components/ui/{flip-card,skipped-lines,screen-heading,live-region}.tsx`, `lib/copy.ts`, `lib/core/{types,limits,result,assert-never,parse-lines,session,selectors}.ts`, matching `*.test.ts(x)`, `docs/design-sheet.md`, `vitest.config.ts`, `vitest.setup.ts`. No `src/` folder; `public/` is removed.
- No variances from the Architecture tree. Not created in this story: `text-units.ts`, `list-markers.ts`, `separators.ts` (Story 1.3 splits the parser into them; keep Story 1.1's rules inside `parse-lines.ts` and refactor in 1.3), `shuffle.ts`, `score.ts`, `saved-state.ts`, `storage/`, `hooks/`, `confirm-dialog.tsx`, `notices.tsx`, `shuffle-toggle.tsx`, `confetti.tsx`, `skeleton.tsx`, `error.tsx`.
- The repository is local-only (no remote), so no CI work. Branch `engineered`, main branch `main`.

### Previous story intelligence
None: this is the first story. Git history has only the scaffold commit and the planning commit; no app code exists, so there are no code patterns to inherit beyond the starter files above.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.1: Paste cards and flip quiz]
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] (starter housekeeping, dependency manifest, scope guards)
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions] (AD-5, AD-6, AD-7)
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules] (PAT-1 to PAT-18)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/prds/prd-flashflip-2026-11-10/prd.md#4.1 Paste and make Cards] (P-01 to P-12)
- FR-1, FR-7, FR-8, FR-9 and FR-6 (the `no-cards` part) in the epics Requirements Inventory.

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **Story complete (2026-11-10).** All tasks done. `npm run lint`, `typecheck`, `test` (57 tests: 38 core, 19 dom) and `build` pass. Manual walkthrough of the production build in an iframe at 320 px: paste, Ready, Study (flip, Marks), Result work; no horizontal overflow; no button under 44 px; a 1,000-character Definition wraps. Not done manually: a keyboard-only pass in a real browser (covered by Testing Library tests: click, Enter, Space, focus-to-heading) and real iOS/Android devices (Story 1.3 checklist).
- Decisions: `components/ui/button.tsx` was added (not in the architecture tree) as the shared pill-button style. "New deck" is omitted from the Study screen (its confirmation is FR-11, Story 1.2). Study keys an inner `StudyCard` by position so flip state resets per Card, and refocuses the Card after each Mark so keyboard users stay in flow. Headings take focus without a visible ring (`[tabindex="-1"]:focus-visible`).
- Known limits, by design: the FR-6 "keep existing Deck" case only holds in memory until Saved state (Story 1.2); parser is first-pass only (no list markers, fullwidth colon, `——`, Unicode whitespace, grapheme truncation, limits: Story 1.3). The component tests were written after the screens, not strictly red-first; core tests were red-first.

- Tasks 1-4 done (2026-11-10). Dependencies installed per the manifest; `public/` removed; Vitest has `core` (Node) and `dom` (jsdom) projects; ESLint enforces PAT-5 purity, the screens/ui import boundary and the `dangerouslySetInnerHTML` ban. Core: types, result, assert-never, limits, `lib/copy.ts`, first parser (tab, spaced dash, colon), session reducer, selectors. 38 core tests pass; `npm run lint` and `npm run typecheck` pass. `npm run build` not yet run: `app/page.tsx` still references the deleted demo SVGs until Task 6.
- Reducer note: `pasteText` in state is the text of the current Deck ("" when none); the Paste box draft lives locally in the Paste screen so "Edit text" keeps the Deck until a later "Make cards" succeeds.
- Vite prints two non-blocking notices (ESM config loaded as CJS; `vite-tsconfig-paths` now supported natively). Kept the plugin as the story/architecture specify.

### File List

- package.json, package-lock.json (modified)
- public/ (deleted)
- app/globals.css, app/layout.tsx (modified)
- eslint.config.mjs (modified)
- vitest.config.ts, vitest.setup.ts (new)
- lib/copy.ts, lib/copy.test.ts (new)
- lib/core/types.ts, result.ts, assert-never.ts, limits.ts (new)
- lib/core/parse-lines.ts, parse-lines.test.ts (new)
- docs/design-sheet.md (new, approved 2026-11-10)
- lib/core/session.ts, session.test.ts, selectors.ts, selectors.test.ts (new)
- app/page.tsx (replaced)
- components/flash-flip-app.tsx, flash-flip-app.test.tsx (new)
- components/screens/paste-screen.tsx, ready-screen.tsx, study-screen.tsx, result-screen.tsx (new)
- components/ui/button.tsx, flip-card.tsx, skipped-lines.tsx, screen-heading.tsx, live-region.tsx (new)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status updates)

### Change Log

- 2026-11-10: Story 1.1 implemented. Housekeeping and Vitest setup; pure core (types, parser v1, reducer, selectors, copy); approved design sheet and tokens; Paste, Ready, Study and bare Result screens; 57 tests. Status: review.

### Review Findings

- [x] [Review][Patch] (decided 1a) Add a "Back" control on Paste when a Deck exists. Was: No way back from Paste to the kept Deck after "Edit text" — AC5/AC6 say the Deck is kept, but Paste has no Cancel/Back; the only exits are a successful "Make cards" or "New deck", so the kept Deck is unreachable. Options: add a "Back" control (small scope add), or accept and document that Edit text is one-way until Story 1.2. [components/screens/paste-screen.tsx, components/flash-flip-app.tsx:30-41]
- [x] [Review][Patch] (decided 2a) Remove the whitespace collapse so Cards match pasted text. Was: Term/Definition whitespace is collapsed (`.replace(/\s+/g, " ")`) — Task 3.2 says only "trim". Options: remove the collapse (Cards match the pasted text), or keep it and add it to the spec plus a test. [lib/core/parse-lines.ts:50-51]
- [x] [Review][Dismissed] (decided 3a: user approved; only tidy the leftover "Reply approved" section in the sheet) Design-sheet approval cannot be verified from the diff — the sheet says "approved by Amer, 2026-11-10" but still carries the "Reply 'approved'" section. Confirm the AC2 stop-and-approve actually happened. [docs/design-sheet.md:3]
- [x] [Review][Patch] (decided 4a) Change code to match the design sheet. Was: Code diverges from the approved design sheet — `text-small` used for the flip hint and card labels (sheet: counter only); Study heading is visible (sheet: visually hidden); `--space-gutter` is undefined (code hard-codes `px-4`); arbitrary values `max-h-[50vh]`/`min-h-48`. Fix the code, or update the sheet? [components/screens/study-screen.tsx, components/ui/flip-card.tsx, app/globals.css]
- [x] [Review][Patch] Second live region: `role="alert"` plus `setAnnouncement` announces the refusal twice (PAT-15 wants one polite region) [components/screens/paste-screen.tsx, components/flash-flip-app.tsx:33]
- [x] [Review][Patch] Announcements do not re-fire for identical text (repeat refusal, equal consecutive flips) and are never cleared on screen change [components/flash-flip-app.tsx:21,33, components/ui/live-region.tsx, components/screens/study-screen.tsx]
- [x] [Review][Patch] Stale refusal alert and Skipped-lines list stay visible while the Student edits the text [components/flash-flip-app.tsx:20,28-33]
- [x] [Review][Patch] "Existing Deck is kept" after a refused paste is untested (AC5, Task 7.1) [components/flash-flip-app.test.tsx]
- [x] [Review][Patch] `trim()` runs before the TAB rule, so `\tdef` and `term\t` give "no-separator" instead of missing-term/missing-definition [lib/core/parse-lines.ts:36]
- [x] [Review][Patch] Held Enter on "Knew it"/"Missed it" auto-repeats onto the next card's flip button and keeps toggling it [components/screens/study-screen.tsx]
- [x] [Review][Patch] Ready preview and Skipped-line text have no wrap guard; long unbroken strings overflow at 320 px (AC8) [components/screens/ready-screen.tsx:35, components/ui/skipped-lines.tsx:19-21]
- [x] [Review][Patch] `state.screen === "study"` with no current card silently renders the Result screen [components/flash-flip-app.tsx:66-80]
- [x] [Review][Patch] Reducer trusts caller-supplied `deckSize` instead of `order.length`; `pass-started` has no guards [lib/core/session.ts:35-46]
- [x] [Review][Patch] Textarea border in dark mode is 2.96:1 against its own background (needs 3:1) [app/globals.css, components/screens/paste-screen.tsx]
- [x] [Review][Patch] Test titles without PRD IDs ("does not mutate the previous state", `describe` blocks) (AC9/PAT-2) [lib/core/session.test.ts]
- [x] [Review][Defer] Scrollable region inside the flip `<button>` (keyboard cannot scroll long text) [components/ui/flip-card.tsx:34] — deferred, pre-existing
- [x] [Review][Defer] ScreenHeading focuses on every mount and `[tabindex="-1"]:focus-visible` hides all outlines [components/ui/screen-heading.tsx, app/globals.css:105] — deferred, pre-existing
- [x] [Review][Defer] No paste/Card size limit; text parsed twice and unwindowed Skipped lines [lib/core/limits.ts, components/flash-flip-app.tsx:23-26] — deferred, pre-existing (Story 1.3)
- [x] [Review][Defer] Unicode edge cases: zero-width chars, full-width colon/minus separators, NEL/U+2028 line breaks, `\n\r` line count, surrogate split at 80 chars [lib/core/parse-lines.ts] — deferred, pre-existing (Story 1.3)
- [x] [Review][Defer] Parser precedence quirks: colon beats leading/trailing dash (`- a: b`), bullet `- a - b`, `term:` reason, dash-only `- - -` makes a junk Card [lib/core/parse-lines.ts:17-29] — deferred, pre-existing (Story 1.3)
- [x] [Review][Defer] Lint guardrail gaps (`createElement` innerHTML, relative imports, `Math.random`/`Date` in core) [eslint.config.mjs] — deferred, pre-existing
- [x] [Review][Defer] Caret ranges in `package.json` vs exact manifest versions; confirm lockfile resolves to the manifest [package.json] — deferred, pre-existing

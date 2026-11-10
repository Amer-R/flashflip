---
baseline_commit: 00de100c7f57a07e8586633cd820636a2d6c0a0c
---

# Story 1.3: Bulletproof paste

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-year student,
I want my messy notes from Notion, Google Docs or chat apps to turn into the right cards, with anything unreadable listed rather than dropped,
so that I can trust the deck matches my notes.

**Covers:** FR-2 to FR-6 in full, FR-17, AD-3, AD-4 and AD-9, NFR-1 to NFR-4 on a production build, and the closing checks (`docs/manual-checklist.md`, README). It completes the Story 1.1 parser against all 31 acceptance rows (P-01 to P-31). Stories 1.1 and 1.2 are `done` and committed (`00de100`, tag `before-Live`).

## Acceptance Criteria

1. **Acceptance table (FR-2 to FR-5, AD-11).** Given the typed table in `lib/core/acceptance-table.ts`, when the parser test runs, then every row P-01 to P-31 passes, with test titles starting with the row ID. For every input, Cards + Skipped lines + blank Lines equals the number of Lines. `PARSER_VERSION` is bumped from 1 to 2.
2. **Lines and whitespace (FR-2).** Given Paste text with CRLF, LF, CR, U+2028 or U+2029 breaks, then each break ends a Line (`\r\n` counts as one break) and each Line is trimmed of Unicode White_Space plus U+FEFF and U+200B. A blank Line makes no Card and is not a Skipped line. No Term or Definition begins or ends with whitespace, U+FEFF or U+200B. (P-20 to P-24)
3. **List markers (FR-3).** Given a trimmed Line that starts with a bullet (•, ◦, ▪, ●, *, -, –, —) or a one- to three-digit number marker with "." or ")" followed by whitespace, then that one marker is removed before the Separator search. `3.14 - pi` and `A. Smith - economist` keep their leading text; letter markers such as "a)" stay. (P-13, P-14, P-19)
4. **Separators (FR-4).** Given a Line with several possible Separators, then the rules apply in this order and split at the first match of the first rule that matches: (1) a tab; (2) a run of one or more Unicode dashes (`\p{Dash}`) with whitespace on both sides (so `--` is one Separator); (3) a colon followed by whitespace, or a fullwidth colon (：) anywhere; (4) a run of two or more em dashes (——) anywhere. Term and Definition are trimmed, and runs of whitespace inside either collapse to one space (this restores the collapse the Story 1.1 review removed). `well-known` and `Ratio 3:1` have no Separator. `a - b - c` gives "a" and "b - c"; several tabs put everything after the first in the Definition as single spaces. (P-01 to P-12, P-15 to P-18)
5. **Skipped lines (FR-5, AD-3).** Given a non-blank Line with no Separator or an empty Term or Definition, then it is a Skipped line with its 1-based line number (blank Lines count), its first 80 grapheme clusters (counted with `Intl.Segmenter`, so an emoji or combining sequence is never split) and the reason "no separator", "missing term" or "missing definition". A wrapped Definition gives one Card and one Skipped line; duplicate Lines make duplicate Cards. (P-10, P-12, P-25 to P-28, P-31)
6. **Refusals (FR-6).** Given "Make cards" cannot make a Deck, then the Student stays on Paste with the text intact and any existing Deck kept. Paste text over 200,000 UTF-16 code units shows "Too much text (max 200,000 characters)"; no Cards shows "No cards could be made" with the Skipped lines listed below the Paste box; more than 1,000 Cards shows "Too many cards (max 1,000)". Exactly 200,000 characters and exactly 1,000 Cards still make a Deck. After any refusal a reload shows the same Deck as before, or Paste if there was none. Each refusal message is announced through the single live region.
7. **Long Skipped lists (AD-9).** Given more than 100 Skipped lines, when the Ready screen or the refusal view shows them, then it shows the first 100 and a "Show all N" control; the rest render with `content-visibility: auto` once shown. No Skipped line is ever dropped: the "N cards, M skipped" count is always right and "Show all N" reveals every line.
8. **Text exactly as made (FR-17).** Given Cards in any script, then the shown text equals the parsed text character for character, including emoji sequences and combining marks (P-29, P-30). Term and Definition sit in separate elements with `dir="auto"` (`خلية` lays out right-to-left, `cell` left-to-right). `<b>x</b>` displays as characters and `<img src=x onerror=alert(1)>` runs no script (React text only; ESLint bans `dangerouslySetInnerHTML`, already in place). A 1,000-character Definition wraps with no horizontal scrolling at 320 px, and the Card's content scrolls vertically when taller than the screen, also by keyboard.
9. **Security headers (AD-4, NFR-2).** Given a production build, when it is served, then `next.config.ts` sets, for production only, a CSP (`default-src 'self'`; `script-src 'self' 'unsafe-inline'`; `style-src 'self' 'unsafe-inline'`; `img-src 'self' data:`; `font-src 'self'`; `connect-src 'none'`; `object-src 'none'`; `base-uri 'none'`; `form-action 'none'`; `frame-ancestors 'none'`), `Referrer-Policy: no-referrer` and a `Permissions-Policy` denying camera, microphone and geolocation. There are no blocked first-party requests or console violations; pasting, making Cards, studying and finishing a Pass cause no network requests, set no cookies and load no third-party scripts, fonts or analytics.
10. **Speed (NFR-1).** Given 1,000 Lines, "Make cards" completes within 500 ms on a mid-range phone (measured and recorded in the checklist; a Node sanity test guards against a gross regression), and Study taps show their result within 200 ms.
11. **Crash boundary (PAT-6).** Given an unexpected render error, then `app/error.tsx` shows a "Start over" button that clears the Saved state and resets, with wording from `lib/copy.ts` and only `console.error` for logging.
12. **Closing checks.** Given the finished app, then `docs/manual-checklist.md` exists and is filled in for what can be run here and left as clear open items for what needs a real device: an axe-core run on the four screens, Safari on iOS and Chrome on Android at 320 px, sample Cards in Latin, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Chinese, Japanese, Korean, Thai and emoji with no replacement boxes, and the iOS 3D flip and swipe. `README.md` is replaced with run, test and deploy notes. At least 10 real pastes (PRD §9 question 1) are checked against FR-2 to FR-4 before they are frozen: the dev prepares `docs/real-pastes.md` and runs any pastes the Student supplies; **never invent "real" pastes**, and leave the count open if fewer than 10 are available.

## Tasks / Subtasks

- [x] Task 1: Text units and limits (AC: 2, 5, 6) — red-first, Node project
  - [x] 1.1 `lib/core/limits.ts`: add `MAX_PASTE_CHARS = 200_000`, `MAX_CARDS = 1_000`, `SKIPPED_LINES_SHOWN = 100` (PAT-16, comments cite FR-6 and AD-9). Keep `PREVIEW_CARD_COUNT` and `SKIPPED_LINE_DISPLAY_LENGTH`.
  - [x] 1.2 `lib/core/text-units.ts` (+ `text-units.test.ts`): `WHITESPACE` as a regex source `[\p{White_Space}\u200B\uFEFF]` (use the `u` flag); `trimText(s)`, `collapseWhitespace(s)` (runs → one space), and `truncateGraphemes(s, max)` using `Intl.Segmenter` (granularity "grapheme"). Tests titled `FR-2 …`/`FR-5 …`: NBSP, U+3000, U+FEFF, U+200B at both ends, a family emoji (`👨‍👩‍👧`) and `e` + U+0301 are never split at the 80 boundary, a string of exactly 80 clusters is unchanged. TypeScript target is ES2017: confirm `\p{…}` with the `u` flag and `Intl.Segmenter` typecheck (the architecture says they do; if `Intl.Segmenter` types are missing add the `lib` entry to `tsconfig.json`, do not add a dependency).
- [x] Task 2: Parser rules (AC: 2, 3, 4, 5, 6) — red-first, Node project
  - [x] 2.1 `lib/core/list-markers.ts` (+ test): `removeListMarker(line)` removes at most one leading marker: a bullet from `•◦▪●*-–—` or `\d{1,3}[.)]`, **only when followed by whitespace**. Not removed: `3.14 - pi`, `3.` with no space, `A. Smith`, `a)`, `1234. x`.
  - [x] 2.2 `lib/core/separators.ts` (+ test): `splitAtSeparator(line)` returns `[term, definition] | null`, trying in order (1) tab, (2) `/<ws>\p{Dash}+<ws>/u` using the shared whitespace class (a run such as `--` or `—` is one Separator, so `a -- b` splits at the run), (3) `/:<ws>|：/u`, (4) `/—{2,}/`. First match within the winning rule wins. Keep the Story 1.1 behaviour for a dash run at the very start or end of a Line (`LEADING_DASH`/`TRAILING_DASH`): it yields a Skipped line with "missing term"/"missing definition" instead of "no separator"; this is a deliberate 1.1 choice, only the reason differs, so keep it and cover it with a test. Tests for every precedence pair: tab > dash > colon > ——, hyphen inside a word, `Ratio 3:1`, `a - b - c`.
  - [x] 2.3 `lib/core/parse-lines.ts`: split Lines at `/\r\n|[\n\r  ]/`; trim each Line with the full whitespace set **except that a leading or trailing tab is kept for Separator detection** (the 1.1 rule, the test "a leading or trailing tab is a Separator" must keep passing), then `removeListMarker`, then `splitAtSeparator`, then `trimText` + `collapseWhitespace` on Term and Definition. A Line is blank when it is only whitespace (including U+FEFF/U+200B). The Skipped line `text` is `truncateGraphemes(<the trimmed Line, marker included>, SKIPPED_LINE_DISPLAY_LENGTH)`; `lineNumber` is the 1-based index among all Lines, blank ones included. Bump `PARSER_VERSION` to 2.
  - [x] 2.4 Refusals in the parser (typed results, AD-5): `MakeCardsRefusal` becomes `{ reason: "too-much-text" } | { reason: "too-many-cards" } | { reason: "no-cards"; skippedLines }`. Check `pasteText.length > MAX_PASTE_CHARS` **before** any splitting; count Cards while parsing and refuse when `cards.length > MAX_CARDS`. `deckOf` in `selectors.ts` keeps returning `null` for any refusal. Update every caller that reads `result.skippedLines` (the `refusal` handling in `flash-flip-app.tsx`, tests) to the new union.
  - [x] 2.5 Re-check Saved state with the bump: `saved-state.test.ts` and the session tests reference `PARSER_VERSION`; a stored `parserVersion: 1` now takes the "keep the Paste text, drop progress, open Ready" path (AC 8 of Story 1.2), provided the text still makes a Deck. Add a test that a stored 1.2-era state with progress opens Ready, not Study.
- [x] Task 3: Acceptance table and invariants (AC: 1, 10) — Node project
  - [x] 3.1 `lib/core/acceptance-table.ts`: P-01 to P-31 as typed data (`id`, `inputs: string[]` because P-22 and P-24 have several, `cards: [term, definition][]`, `skipped: [lineNumber, reason][]`). Copy the rows from PRD §4.1 exactly (the PRD table at `_bmad-output/planning-artifacts/prds/prd-flashflip-2026-11-10/prd.md`, lines ~124-154), writing invisible characters as escapes (` `, `\uFEFF`, `\u200B`, ` `, `\t`, `\r\n`) so they survive editors. Expected results as written there, including P-30's identical-characters check.
  - [x] 3.2 `lib/core/parse-lines.test.ts`: replace the 1.1 `ROWS` subset with a loop over the table, titles starting with the row ID (`P-19 …`). Keep the existing FR-4/FR-5 tests that are still valid.
  - [x] 3.3 Invariant test (FR-5): for the whole table plus ~500 generated Pastes from `seeded-random.ts` (random mixes of text, separators, markers, blank Lines, every break type, emoji) assert `cards + skipped + blank === lines` and that no Term or Definition begins or ends with whitespace, U+FEFF or U+200B. **No new dependency** (`fast-check` is not installed; use the seeded source).
  - [x] 3.4 Limits and speed: exactly 200,000 characters makes a Deck, 200,001 is `too-much-text`; exactly 1,000 Cards makes a Deck, 1,001 is `too-many-cards`; no Cards is `no-cards` with the Skipped lines. A 1,000-Line parse finishes in well under 500 ms in Node (assert a generous bound such as 250 ms; the real NFR-1 number comes from a phone).
- [x] Task 4: Refusal messages and screens (AC: 6, 7) — jsdom project
  - [x] 4.1 `lib/copy.ts` (PAT-4; PRD wording verbatim): `tooMuchText: "Too much text (max 200,000 characters)"` (build the number with `toLocaleString("en-US")` from `MAX_PASTE_CHARS` or keep the literal; the test guards the exact string), `tooManyCards: (max) => "Too many cards (max 1,000)"`, `showAllSkipped: (n) => "Show all N"`. Keep `noCardsMade`. Update `lib/copy.test.ts`.
  - [x] 4.2 `components/flash-flip-app.tsx`: the `refusal` state carries the reason (and the Skipped lines for `no-cards`); `makeCards` maps the reason to the message, announces it through `announce(...)`, keeps the draft and any Deck (the `deck-made` dispatch happens only on success). `PasteScreen` shows the message in the existing `data-testid="refusal"` node and, for `no-cards`, the Skipped lines below it. Do not clear Saved state on a refusal.
  - [x] 4.3 `components/ui/skipped-lines.tsx` (AD-9): show the first `SKIPPED_LINES_SHOWN` lines; when there are more, a native `<button>` "Show all N" (44 px target) reveals the rest, which render with `content-visibility: auto` and `contain-intrinsic-size` (a small utility in `globals.css`). Component state only (PAT-10). Used by Ready and by the refusal view.
  - [x] 4.4 jsdom tests titled with FR IDs: each refusal keeps the text and the Deck; a reload after a refusal shows the Deck as before or Paste; 150 Skipped lines show 100 plus "Show all 150", and clicking shows all 150; the refusal is announced once in the single live region (still exactly one `aria-live="polite"`).
- [x] Task 5: Show text exactly (AC: 8) — jsdom project
  - [x] 5.1 `components/ui/flip-card.tsx`: give each face a scroll container (`max-h` as a viewport-relative token, e.g. `max-h-[60dvh]`, `overflow-y-auto`, keep `wrap-anywhere`) so a tall Card scrolls inside the face and the page does not grow; the swipe surface keeps `touch-action: pan-y` (already in `study-screen.tsx`). A scroll container inside a `<button>` is not keyboard-focusable: add an `onKeyDown` for ArrowUp/ArrowDown (and PageUp/PageDown) on the Card button that calls `scrollBy` on the visible face, keeping the existing `event.repeat` guard and Enter/Space flip. Do not rework the two-face flip or `inert`/`aria-hidden`. If tokens are needed, add them in `globals.css` under `@theme` (PAT-14).
  - [x] 5.2 Tests: Arabic Term with Latin Definition render in separate `dir="auto"` elements; `<b>x</b>` and `<img src=x onerror=alert(1)>` appear as text and create no `<b>` or `<img>` elements; P-29/P-30 strings round-trip character for character through the Ready preview and the Study Card (compare `textContent`); a 1,000-character Definition renders in one element. jsdom cannot measure layout, so the 320 px and scroll checks go in the manual pass (Task 8).
- [x] Task 6: Security headers (AC: 9)
  - [x] 6.1 `next.config.ts`: add `async headers()` returning the three header groups for `source: "/(.*)"`, **only when `process.env.NODE_ENV === "production"`** (dev needs eval and a websocket for HMR). Keep the starter's `cacheComponents`, `partialPrefetching` and the `turbopack` rules block as they are. Join the CSP directives with `; `.
  - [x] 6.2 (run here: headers via curl, same-origin resources, no CSP violation events, empty console; the full finish-a-Pass network run and the cookie panel stay OPEN in docs/manual-checklist.md) Verify on a production build (`npm run build`, `npm run start`): `curl -I http://localhost:3000` shows all three headers; in Chrome (claude-in-chrome) there are no CSP violations in the console and no blocked first-party requests (`_next/static/**` scripts, styles and the self-hosted Geist font all load); pasting, making Cards, studying and finishing a Pass make no network requests; `document.cookie` is empty. Record the results in the checklist. If `connect-src 'none'` or `unsafe-inline` breaks a Next bootstrap request, fix the policy, not the app, and note the change in the Dev Agent Record.
- [x] Task 7: Crash boundary (AC: 11)
  - [x] 7.1 `app/error.tsx` (a Client Component per Next's convention): `console.error` the error, show a heading and a "Start over" `<button>` that calls `removeSavedState()` from `lib/storage/local-storage` and then `reset()`. Wording in `lib/copy.ts` (new text: a short apology and "Start over"). Use the existing tokens and `Button`; native elements only. `app/` may import `lib/storage`; screens/ui may not. A jsdom test renders the boundary with a stubbed `reset` and a seeded Saved state and checks the key is removed.
- [x] Task 8: Closing checks and docs (AC: 10, 12)
  - [x] 8.1 `docs/manual-checklist.md`: sections for NFR-1 (parse time on a phone, tap latency), NFR-2 (no network, no cookies, headers, console), NFR-3 (axe-core on Paste, Ready, Study and Result; keyboard pass; contrast; 44 px targets), NFR-4 (Safari iOS and Chrome Android at 320 px; desktop browsers), FR-17 scripts list (Latin, Cyrillic, Greek, Arabic, Hebrew, Devanagari, Chinese, Japanese, Korean, Thai, emoji: put a ready-to-paste sample block in the doc), iOS 3D flip and swipe, the static-route check, reduced motion, the swipe direction assumption (right = Knew it) and the device-only notice. Fill in what you ran here (curl headers, desktop Chrome via claude-in-chrome at 320 px, axe via a CDN-free method such as `npx @axe-core/cli` only if it needs no new project dependency; otherwise leave open) and mark the rest **OPEN: needs a real device** — never tick a box you did not run.
  - [x] 8.2 `docs/real-pastes.md`: a template with columns (source app, pasted text, intended Cards, Cards made, Skipped lines, verdict) and the rule that fewer than 10 real pastes leaves FR-2 to FR-4 "not frozen". If the Student has supplied pastes in this session, run them through `parseLines` and record the results; otherwise leave it as the open item described in AC 12.
  - [x] 8.3 Replace `README.md` (still the create-next-app text) with: what FlashFlip is, the Paste format in two lines, `npm run dev|build|start|lint|typecheck|test`, Node `>=22.12`, privacy (nothing leaves the device), the localStorage note, and deploy notes for Vercel (static output, no environment variables, no functions; first-deploy route chosen at deploy time).
- [x] Task 9: Verification (all ACs)
  - [x] 9.1 `npm run lint`, `typecheck`, `test` and `build` pass. Remember ESLint flat-config blocks **replace** a rule's options instead of merging: if you touch `eslint.config.mjs`, re-probe `lib/core` for `window`, `document`, `navigator` and `localStorage` (Story 1.2 review finding).
  - [x] 9.2 (run here: no overflow with the page forced to 320 px, a tall Card scrolls and ArrowDown scrolls it; a true 320 px viewport, a full keyboard-only pass and reduced motion stay OPEN in docs/manual-checklist.md) On the production build in Chrome: 320 px width has no horizontal scroll with a 1,000-character Definition and with 150 Skipped lines; a tall Card scrolls inside its face; keyboard-only flip, scroll and Mark work; reduced motion still works. Update the Dev Agent Record with what was and was not verified.

## Dev Notes

### Scope guards (do not build ahead)
- Precision over recall (PRD §4.1, SM-C1): a Line the parser cannot read with confidence is **listed, never guessed at**. Do not loosen Separator rules to lower the Skipped count. Do not remove the Ready screen's Skipped list or preview (SM-C2). No letter markers (`a)`), no joining of wrapped Lines, no editing of a Card, no dedupe of duplicate Lines.
- No new runtime or dev dependency (`fast-check`, axe packages, animation or sanitising libraries are all out). No analytics, cookies, third-party fonts or scripts (NFR-2).
- Do not change the reducer, Saved state shape, shuffle or score logic. The only Story 1.2 touch points are `PARSER_VERSION`, the parser's refusal union and its callers.
- The Paste screen is still never restored (AD-1). A refusal never writes or clears Saved state.

### Architecture requirements (must follow)
- **AD-3** limits count UTF-16 code units (`string.length`); the 80-character Skipped display counts grapheme clusters through `Intl.Segmenter`. **AD-4** static headers, production only, verified on a production build. **AD-5** parsing returns typed results, never throws; only the storage adapter catches exceptions. **AD-9** first 100 Skipped lines plus "Show all N", the rest with `content-visibility: auto`; every Skipped line stays listed.
- **PAT-1/8** kebab-case files, `@/` imports, no barrels. **PAT-2** test titles start with the PRD ID; the acceptance table is `lib/core/acceptance-table.ts` iterated by the parser test. **PAT-4** all Student-facing strings in `lib/copy.ts`. **PAT-5** `lib/core/**` stays pure (no `react`, `next`, `window`, `document`, `navigator`, `localStorage`). **PAT-7** glossary words verbatim (`Card`, `Deck`, `SkippedLine` with reason `'no-separator' | 'missing-term' | 'missing-definition'`). **PAT-12** parse only on "Make cards" and when the Deck is derived from stored text, never on keystrokes. **PAT-14** tokens only. **PAT-15** one `aria-live="polite"` region, native `<button>`s. **PAT-16** SCREAMING_SNAKE_CASE constants with a comment citing the PRD or AD ID.
- Parsing is on the Node project (`lib/core/**`, `lib/copy.test.ts`); screens, hooks and `app/error.tsx` tests are jsdom.

### Current state of files being changed (read before editing)
Read each file first. The repo has mixed CRLF/LF endings, so match each file's endings (prefer a full rewrite with the Write tool for small files; line-ending-aware edits for large ones).
- `lib/core/parse-lines.ts`: exports `PARSER_VERSION = 1`, `ParsedDeck`, `MakeCardsRefusal = { reason: "no-cards"; skippedLines }`, `parseLines(text): Result<ParsedDeck, MakeCardsRefusal>`. Uses `LINE_BREAK = /\r\n|\n|\r/`, `TAB`, `SPACED_DASH = /\s[-–—]+\s/`, `COLON = /:\s/`, `LEADING_DASH`, `TRAILING_DASH`, a trim that keeps tabs, `.trim()` on Term and Definition (no collapse), and `line.slice(0, 80)` for Skipped text. All of this is replaced by the modules in Tasks 1 and 2.
- `lib/core/parse-lines.test.ts`: a 1.1 `ROWS` subset (P-01 to P-06, P-09 to P-12) plus tests for tab precedence, leading/trailing tab reasons and others. Keep the still-valid ones.
- `lib/core/limits.ts`: `PREVIEW_CARD_COUNT`, `SKIPPED_LINE_DISPLAY_LENGTH` only.
- `lib/core/selectors.ts`: `deckOf(state)` returns `ParsedDeck | null` (null on any refusal). `lib/core/saved-state.ts` re-derives the Deck through `deckOf` and uses `PARSER_VERSION` (mismatch keeps the Paste text and opens Ready). `lib/core/session.ts` is untouched by this story.
- `components/flash-flip-app.tsx`: `makeCards(text)` calls `parseLines`; on `result.ok` it dispatches `deck-made`; otherwise `setRefusal(result.skippedLines)` and `announce(copy.noCardsMade)`. `refusal` is `SkippedLine[] | null` today and is passed to `PasteScreen` as `refusedSkippedLines`. Preserve `announce`, `celebrate`, `refocusCard`, the restoring wrapper and the `onMark` guard added in the 1.2 review.
- `components/screens/paste-screen.tsx`: the refusal block shows `copy.noCardsMade` plus `<SkippedLines>` whenever `refusedSkippedLines` is set; it needs the reason-specific message and must show Skipped lines only for `no-cards`. The draft is local state; Back is shown only while a Deck exists.
- `components/ui/skipped-lines.tsx`: renders every line, no windowing. `ready-screen.tsx` uses it, as does the refusal view.
- `components/ui/flip-card.tsx`: a `<button class="flip-scene">` with two faces (`data-face`), `inert`/`aria-hidden` on the hidden face, `data-testid="term"`/`"definition"`, `dir="auto"` elements, `wrap-anywhere`, an `onKeyDown` that blocks `event.repeat`. There is no scroll container yet. `study-screen.tsx` wraps it in a `touch-pan-y` swipe surface.
- `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true`, a `turbopack.rules` block for `*.css` through `@tailwindcss/turbopack`. **Keep all of it.**
- `eslint.config.mjs`: `dangerouslySetInnerHTML` ban, `lib/core/**` purity block, screens/ui import boundary, and the PAT-11 `localStorage` block (which now ignores `lib/core/**`). Extend carefully; blocks replace rule options.
- `app/layout.tsx` loads Geist through `next/font` (self-hosted at build, covered by `font-src 'self'`). No `app/error.tsx` exists yet.
- `README.md` is the create-next-app default. `docs/` has only `design-sheet.md`.

### Learnings from Stories 1.1 and 1.2 (apply here)
- **Whitespace collapse:** 1.1's review removed it because that spec said "trim"; FR-4 requires it. This story restores it (Task 2.3).
- **One live region:** keep exactly one `aria-live="polite"` region; messages go through `announce(...)`. Do not add `role="alert"`.
- **Tabs at Line ends:** the 1.1 parser keeps a leading or trailing tab so it can act as a Separator. FR-2 says to trim whitespace from both ends, which would erase that Separator. Keep the 1.1 behaviour (P-01 to P-31 do not cover it); it is a Skipped line either way, only the reason differs.
- **Don't trust callers:** derive sizes from state, add guards for impossible transitions. **Held Enter** must not auto-repeat onto the next control (flip-card keeps its guard).
- **ESLint:** a later flat-config block that sets the same rule replaces the earlier options. After any change, probe `lib/core` with `window` and `localStorage` and confirm both are flagged.
- **Tests:** every title and `describe` starts with a PRD ID; `data-testid` for visual-only nodes; the `vitest.setup.ts` stubs `<dialog>` methods and clears localStorage after each test.
- **Browser checks matter:** 1.2's pointer-capture bug was invisible in jsdom. For this story, layout (320 px, scroll inside a face) cannot be tested in jsdom: do it in Chrome on the production build.
- **Review style:** each finding in 1.2 was verified against the code; keep changes minimal and tested, and write the Dev Agent Record honestly about what was not run.

### Deferred items this story owns (from `deferred-work.md`)
- Parser Unicode edge cases: zero-width characters, full-width colon (rule 3), U+2212 (MINUS SIGN does have the Unicode Dash property, so it is a Separator; FR-4 says any Dash character), U+2015 (is `\p{Dash}`, so it is), NEL (U+0085 is White_Space but **not** a line break in FR-2, so it is trimmed, not split), `\n\r` is two breaks (LF then CR), so it produces an extra blank Line, which counts in line numbers; the 80-unit truncation splitting a surrogate pair (fixed by grapheme truncation).
- Parser precedence quirks: `- a: b` made Card "- a" (fixed by marker removal first); `- a - b` split at the second dash (same fix); `term:` with an ASCII colon and nothing after it has no whitespace after the colon, so by FR-4 it is "no separator" (the fullwidth `細胞：` is "missing definition", P-26); `- - -` makes no junk Card (after marker removal `- -` has no Separator with whitespace on both sides).
- No paste or Card size limit; text parsed twice (`makeCards` and the `useMemo`) and Skipped lines rendered unwindowed (the limits and AD-9 windowing fix these; the double parse is fine, parse once more only on "Make cards" and on restore).
- A scrollable region inside the flip `<button>` (Task 5.1).
- **Not in this story:** ScreenHeading focus-on-every-mount, the lint guardrail gaps (`createElement` with `dangerouslySetInnerHTML`, relative-path imports, `Math.random`/`Date` in `lib/core`), caret versions in `package.json`. Leave them deferred.

### Technical notes
- **Whitespace set:** use one shared source, `[\p{White_Space}\u200B\uFEFF]`, everywhere (trim, collapse, the spaced-dash rule, the colon-then-whitespace rule). JS `\s` and `String.prototype.trim` miss U+200B, so do not use them for Lines, Terms or Definitions. FR-2 puts U+200B and U+FEFF inside "whitespace", so the collapse also turns an inner U+200B into a space; this follows the PRD literally. If the real-paste check shows this harms a script that uses U+200B between words (Thai), record it as a PRD question rather than changing the rule silently.
- **Dash property:** `\p{Dash}` includes `-` `–` `—` `―` and others. A run of dashes is one Separator, so `a --- b` splits at the whole run.
- **Rule 4 vs rule 2:** `細胞——生命` has no whitespace, so rule 2 misses it and rule 4 (`—{2,}`) takes it. `a —— b` has whitespace on both sides, so rule 2 takes it first (the result is the same).
- **Marker removal happens before Separator search and does not trim the rest beyond the marker's trailing whitespace.** Removing the marker from `1. mitosis - cell division` leaves `mitosis - cell division`.
- **Counts:** a Line is blank if it is empty after trimming; the invariant is `cards + skipped + blank === lines`, where `lines = text.split(LINE_BREAK).length` (an empty Paste text is one blank Line).
- **Refusal order:** length first, so a 5 MB paste is never split; then parse; then the Card cap. A text with more than 1,000 Cards and many Skipped lines is `too-many-cards`; a text with zero Cards is `no-cards` even if it has more than 100 Skipped lines.
- **`content-visibility: auto`** needs `contain-intrinsic-size` (for example `auto 3rem`) so the scroll bar does not jump; it is ignored in browsers without support, where rows render normally.
- **CSP and Next 16:** the architecture settled on static headers with `'unsafe-inline'` for scripts and styles because Next's bootstrap needs inline scripts without nonces (nonces would force dynamic rendering). `connect-src 'none'` is not in Next's docs, so it is verified, not assumed. In development the headers are off.
- **`headers()` and `cacheComponents`:** the config function is build-time config, not a request API; it is allowed. Keep the exported config shape `NextConfig`.
- **Performance:** the new parser should stay a single pass with precompiled regexes (module-level constants); no per-Line regex construction. The grapheme segmenter is created once at module level.
- **Libraries:** Next 16.4.6, React 19.3.1, Tailwind 4.3 (CSS-first), Vitest 5.1, jsdom 31, TypeScript 5.9 (`target: ES2017`, check `Intl.Segmenter` typing). No upgrades.

### Project Structure Notes
- New files (architecture tree): `lib/core/{text-units,list-markers,separators,acceptance-table}.ts` (+ tests for the first three), `app/error.tsx`, `docs/manual-checklist.md`, `docs/real-pastes.md`.
- Modified: `lib/core/{parse-lines,limits,selectors?}.ts`, `lib/core/parse-lines.test.ts`, `lib/core/saved-state.test.ts` (parser version), `lib/copy.ts`, `lib/copy.test.ts`, `components/flash-flip-app.tsx` (+ tests), `components/screens/paste-screen.tsx`, `components/ui/skipped-lines.tsx`, `components/ui/flip-card.tsx`, `app/globals.css`, `next.config.ts`, `README.md`.
- No variances from the architecture. The Skipped-line `text` field keeps its name; it now holds up to 80 grapheme clusters.
- Branch `engineered` (pushed). Stories 1.1 and 1.2 are committed; this story's changes start from a clean tree at `00de100`.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Bulletproof paste]
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] (AD-3, AD-4, AD-5, AD-9, AD-11, PAT-1 to PAT-18, scope guards)
- [Source: _bmad-output/planning-artifacts/prds/prd-flashflip-2026-11-10/prd.md#4.1 Paste and make Cards] (FR-2 to FR-6, acceptance table P-01 to P-31) and §9 question 1 (real pastes)
- [Source: _bmad-output/planning-artifacts/architecture.md] (AD-3, AD-4, AD-9, PAT-2, PAT-6, project directory structure, verification list)
- [Source: _bmad-output/implementation-artifacts/1-2-score-shuffle-and-keep-cards-after-refresh.md#Review Findings] and [deferred-work.md]
- [Source: docs/design-sheet.md] (tokens)

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5.5 (claude-sonnet-5-5)

### Debug Log References

- Backslashes and U+2028/U+2029 escapes were altered by the shell when files were written through heredocs; the pattern modules were rewritten with the Write tool and `String.raw`, and two raw U+2028/U+2029 characters that ended up inside source files were turned back into escapes.
- Probe results: `\p{Dash}` includes U+2212 MINUS SIGN, so it is a Separator (the story's Dev Notes said it was not; FR-4 says "any character with the Unicode Dash property", so the code and tests follow the property).
- `- - -` becomes a "missing term" Skipped line (marker removed, then the 1.1 leading-dash rule), not "no separator"; either way no junk Card.

### Completion Notes List

- Parser rebuilt from small pure modules: `text-units.ts` (one whitespace set `[\p{White_Space}\u200B\uFEFF]`, trim, collapse, grapheme truncation), `list-markers.ts`, `separators.ts` (tab, spaced Unicode dash run, colon+whitespace or fullwidth colon, run of two or more em dashes; the 1.1 leading/trailing dash rule kept), `parse-lines.ts` (5 line-break kinds, tab kept at Line ends, marker then separator, collapse restored, Skipped text cut at 80 grapheme clusters, limits). `PARSER_VERSION` is 2, so a stored Story 1.2 state opens Ready (tested).
- `MakeCardsRefusal` is now `too-much-text | too-many-cards | no-cards`; length is checked before splitting, the Card cap while parsing. UI shows the PRD messages through `refusalOf` in `flash-flip-app.tsx`; refusals are announced through the single live region and never touch the Saved state.
- `SkippedLines` shows the first 100 and a "Show all N" button; lines after the 100th carry `.skipped-rest` (`content-visibility: auto`). The "N cards, M skipped" count is always the full count.
- `FlipCard` faces have a scroll container (`.face-scroll`, 60dvh); ArrowUp/Down and PageUp/Down scroll the visible face by keyboard (the held-key guard now blocks only Enter and Space).
- `next.config.ts` sets the CSP, Referrer-Policy and Permissions-Policy for production only. `app/error.tsx` (PAT-6) clears the Saved state on "Start over". `app/**` tests were added to the jsdom project.
- Docs: `README.md` replaced, `docs/manual-checklist.md` filled in for what ran and OPEN items for the rest, `docs/real-pastes.md` template.
- Fixed a Story 1.2 regression found on the way: `button.tsx` had `duration-(--duration-tap)disabled:opacity-50` (a missing space, from the review patch), which broke the disabled styling. Now `duration-(--duration-tap) disabled:opacity-50`.
- Tests: 289 pass (was 177); lint, typecheck and build pass. Acceptance table P-01 to P-31 (34 test inputs; P-22 has 3 and P-24 has 2), invariant over the table plus 500 seeded random pastes, limits at exactly 200,000 characters and 1,000 Cards, refusals, reload after refusal, Show all, markup safety, direction attributes, keyboard scrolling, error boundary.
- Verified in Chrome on the production build: the three headers, only same-origin resources, no CSP violation events and an empty console, 150 Skipped lines show 100 then 150, `<b>` and `<img>` are text, a 1,000-character Definition scrolls inside the face (968 px content in a 552 px box) and ArrowDown scrolled it, no content overflow when the page width was forced to 320 px with CSS (a rough proxy only; the automation window could not be narrowed, so a real 320 px viewport is still OPEN).
- **Not verified / open:** real devices (iOS Safari, Android Chrome), a true 320 px viewport (the automation window could not be narrowed; the CSS-forced 320 px width is only a proxy), the phone timing for NFR-1, axe-core, a full keyboard-only pass, reduced motion in a browser, all scripts rendering without replacement boxes, and cookies in the Application panel (cookie access is blocked in the automation browser; no `Set-Cookie` header was sent). **AC 12's 10 real pastes are open: 0 of 10** (`docs/real-pastes.md`); none were invented, so FR-2 to FR-4 are not yet "frozen".
- Decisions flagged for the Student: (1) U+200B inside text collapses to a space (FR-2 read literally; possible Thai impact); (2) a leading or trailing tab stays a Separator (Story 1.1 behaviour); (3) "Show all N" hides lines after the first 100 until clicked; (4) the swipe direction assumption from Story 1.2 still stands.

### File List

- lib/core/limits.ts (modified: `MAX_PASTE_CHARS`, `MAX_CARDS`, `SKIPPED_LINES_SHOWN`)
- lib/core/text-units.ts, text-units.test.ts (new)
- lib/core/list-markers.ts, list-markers.test.ts (new)
- lib/core/separators.ts, separators.test.ts (new)
- lib/core/acceptance-table.ts (new)
- lib/core/parse-lines.ts, parse-lines.test.ts (modified: full rules, refusal union, `PARSER_VERSION` 2, acceptance-table loop)
- lib/copy.ts, lib/copy.test.ts (modified: refusal, Show all, error boundary strings)
- components/flash-flip-app.tsx (modified: `refusalOf`), components/flash-flip-app.refusals.test.tsx (new), components/flash-flip-app.session.test.tsx (modified: parserVersion 1 test)
- components/screens/paste-screen.tsx (modified: `refusal` prop)
- components/ui/skipped-lines.tsx (modified: first 100, Show all)
- components/ui/flip-card.tsx (modified: scroll containers, keyboard scroll), components/ui/flip-card.test.tsx (new)
- components/ui/button.tsx (modified: fixed the missing space before `disabled:opacity-50`)
- app/globals.css (modified: `.skipped-rest`, `.face-scroll`)
- app/error.tsx, app/error.test.tsx (new)
- next.config.ts (modified: production-only headers)
- vitest.config.ts (modified: `app/**` tests in the jsdom project)
- README.md (replaced), docs/manual-checklist.md, docs/real-pastes.md (new)
- _bmad-output/implementation-artifacts/sprint-status.yaml, 1-3-bulletproof-paste.md (status updates)

### Change Log

- 2026-11-10: Story 1.3 created (ready-for-dev).
- 2026-11-10: Code review patches applied (8): linear-time trimming (a 50,000-space Line took 3 s before), lazy Intl.Segmenter with a fallback, invisible characters written as escapes, Show all focus and reset, modifier keys left alone in the Card scroll handler, vh fallback for the scroll height, worst-case speed tests, record corrections; 298 tests. Decision 1 resolved: keep the leading-tab rule. Status: done.
- 2026-11-10: Story 1.3 implemented. Full FR-2 to FR-6 parser against P-01 to P-31, grapheme truncation, 200,000-character and 1,000-Card refusals, "Show all N", scrolling Card faces with keyboard scroll, production security headers, crash boundary, README and manual checklist; 289 tests. Open: real-device checks and the 10 real pastes. Status: review.

### Review Findings

Code review 2026-11-10 (Blind Hunter, Edge Case Hunter, Acceptance Auditor) of commit 2ac83e5. 1 decision-needed, 8 patch, 7 defer, 8 dismissed.

- [x] [Review][Decision] RESOLVED (option 1, keep as is): Indented list items are skipped: a leading tab is kept as a Separator (Story 1.1 rule), so nested bullets pasted from Word or Notion as "<TAB>- a - b" or "<TAB>a - b" split at index 0 and become "missing term" Skipped lines, and their list marker is never removed. FR-2 literally says to trim whitespace at both ends of each Line. Options: (a) keep as is; (b) trim leading tabs only when a list marker follows; (c) trim all leading and trailing tabs, as FR-2 reads (a bare "<TAB>def" or "term<TAB>" is then listed as "no separator" instead of "missing term/definition", still a Skipped line). [lib/core/parse-lines.ts, lib/core/text-units.ts]
- [x] [Review][Patch] Quadratic regex backtracking: EDGES, EDGES_KEEP_TABS and TRAILING_DASH retry from every start inside a long whitespace run. Measured: one Line of "x" + 50,000 spaces + "y" takes 3.1 s, so 199,000 spaces would freeze the tab for about a minute (NFR-1). Trim by scanning, and anchor the trailing-dash rule to a single whitespace character; add a worst-case test [lib/core/text-units.ts, lib/core/separators.ts]
- [x] [Review][Patch] `new Intl.Segmenter` runs at module load with no fallback, so an engine without it fails the whole app at import. Create it lazily and fall back to code-point truncation [lib/core/text-units.ts]
- [x] [Review][Patch] Task 3.1 and the acceptance-table header say invisible characters are written as escapes, but raw NBSP, U+200B, U+FEFF and U+200D are in the source (acceptance-table.ts, the WHITESPACE source in text-units.ts, three test files). Replace them with escapes [lib/core/*.ts, components/flash-flip-app.refusals.test.tsx]
- [x] [Review][Patch] "Show all N": the button unmounts on click so keyboard focus falls to the body, and `showAll` stays true when a later refusal reuses the mounted component. Move focus to the first revealed line and reset when the list changes [components/ui/skipped-lines.tsx]
- [x] [Review][Patch] The keyboard scroll handler ignores Ctrl, Alt, Meta and Shift, so it swallows shortcuts such as Alt+Left; leave modified keys alone [components/ui/flip-card.tsx]
- [x] [Review][Patch] `.face-scroll` uses `max-height: 60dvh` with no fallback; add a `vh` line first [app/globals.css]
- [x] [Review][Patch] Record accuracy: the Dev Agent Record says 35 acceptance-table inputs (it is 34) and describes a "320 px-wide emulation" while the checklist says only that the window could not be narrowed; the checklist's static-route line contradicts itself and the 300 ms timing is an upper bound that is not usable as an NFR-1 figure; Tasks 6.2 and 9.2 read as fully verified [this file, docs/manual-checklist.md]
- [x] [Review][Patch] The NFR-1 speed test only covers short Lines; add a worst-case whitespace-run test with a generous bound [lib/core/parse-lines.test.ts]
- [x] [Review][Defer] Up to about 100,000 one-character Skipped lines can all render after "Show all N" (React render cost; AD-9 requires every line to stay listed) [components/ui/skipped-lines.tsx] - deferred, needs a windowing approach and a product call
- [x] [Review][Defer] No `app/global-error.tsx`; errors in the root layout bypass "Start over" [app/error.tsx] - deferred
- [x] [Review][Defer] Lines of only U+200E, U+200F, U+2060 or U+200C (bidi and joiner marks) are not blank under FR-2's whitespace set and show as empty Skipped lines [lib/core/text-units.ts] - deferred, a PRD question for the real-paste check
- [x] [Review][Defer] `\p{Dash}` also matches wave dashes and fullwidth hyphen as Separators (FR-4 says any Dash-property character; precision may argue for a shorter list) [lib/core/separators.ts] - deferred, PRD question
- [x] [Review][Defer] An inner U+200B becomes a space (FR-2 read literally), with no test for it; possible Thai impact [lib/core/text-units.ts] - deferred, real-paste check
- [x] [Review][Defer] Near-limit pastes (200,000 characters plus Marks) may exceed the localStorage quota; the save-failed notice covers it but this was not exercised [lib/hooks/use-saved-state.ts] - deferred
- [x] [Review][Defer] The 60dvh scroll height and the 48 px key step are literals, not tokens or cited constants (PAT-14, PAT-16) [app/globals.css, components/ui/flip-card.tsx] - deferred

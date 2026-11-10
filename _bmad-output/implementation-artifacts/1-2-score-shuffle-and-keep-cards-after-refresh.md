---
baseline_commit: 1882f7abbae2cac7a82e4fd8f3f48c5508ef9b40
---

# Story 1.2: Score, shuffle and keep cards after refresh

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a first-year student,
I want to see my score, shuffle the cards, and find my deck still there after a refresh,
so that I can repeat passes and come back to my notes without redoing anything.

**Covers:** FR-10 to FR-16, plus AD-1, AD-2, AD-8, PAT-9, PAT-11, PAT-13 and PAT-18, and the design tokens' motion use, 3D flip, swipe, confetti and reduced-motion fallbacks (AD-10). The design sheet is already approved (`docs/design-sheet.md`), so nothing gates this story.

## Acceptance Criteria

1. **Score (FR-10).** Given a finished Pass, when the Result screen opens, then it shows the Score as "X of N (P%)", where X is the number of "Knew it" Marks, N the Deck size, and P = 100 × X ÷ N rounded half up: 5 of 7 → 71%, 1 of 8 → 13%, 3 of 8 → 38%, 0 of 4 → 0%, 4 of 4 → 100%, and a 1-Card Deck "1 of 1 (100%)" or "0 of 1 (0%)".
2. **Start again and New deck (FR-11).** Given the Result screen, when the Student taps "Start again", then all Marks clear and a new Pass starts at Card 1 of N on the Study screen, in Deck order if Shuffle is off or in a new random order if it is on. And "New deck" discards the Deck and the Pass and opens an empty Paste screen.
3. **Study-screen confirmation (FR-11).** Given the Study screen with at least one Mark, when the Student taps "New deck", then a native `<dialog>` asks "Discard this deck and your progress?"; declining changes nothing. With no Marks on the Study screen, or on the Ready screen, no confirmation appears.
4. **Shuffle setting (FR-12).** Given the Ready or Result screen, when the Student toggles Shuffle, then the setting changes (off by default) and it is never offered on the Study screen. With Shuffle off a Pass visits Cards in Deck order. With Shuffle on a Pass visits every Card exactly once in random order (tested for Decks of 1, 2, 10 and 1,000 Cards), fixed when the Pass starts and unchanged during the Pass and after a reload.
5. **Unbiased shuffle (FR-13, PAT-18).** Given a 3-Card Deck and a seeded random source, over 10,000 Passes each of the six orders occurs in 14.7% to 18.7% of them. And an exhaustive check of every draw sequence confirms the permutation is unbiased. And neither the reducer nor `shuffle.ts` calls `Math.random`; the caller passes the order in the `pass-started` action.
6. **Save (FR-14, AD-1, PAT-9, PAT-11).** Given a Deck is made, or a Mark, "Start", "Start again" or Shuffle change happens, when the state updates, then the Saved state is written to `flashflip:saved-state` after the update, outside the tap's critical path. It holds `version`, `parserVersion`, `pasteText`, `screen`, `shuffle`, `order` and `marks`, but not the Deck, Skipped lines or position. A Deck shown on the Paste screen (after "Edit text") is saved as `screen: "ready"`; with no Deck the key is removed rather than written. Only `lib/storage/` touches `localStorage`.
7. **Restore (FR-14, AD-8, PAT-13).** Given a Deck of 10 Cards with 4 Marked, when the page reloads, then it opens on Card 5 of 10, Term first, with the same Pass order and the same 4 Marks. A reload on the Result screen shows the same Score. A reload on the Ready screen shows the same Cards, Skipped lines and Shuffle setting, and "Edit text" shows the same Paste text. With no Saved state the app opens on an empty Paste screen, with a neutral skeleton shown until the restore finishes so the Paste screen never flashes first.
8. **Bad stored data (FR-16, AD-2).** Given stored data that is invalid, inconsistent with the re-derived Deck, or of an unknown version, when the page opens, then it is ignored and the app opens on the Paste screen without crashing. On a `parserVersion` mismatch the Paste text is kept, progress is dropped, and the app opens on the Ready screen.
9. **Device-only notice (FR-15).** Given the Ready, Study and Result screens, when each shows, then it shows a visible, non-collapsed notice, in at least body-size text, that the Deck lives only in this browser on this device, that clearing the browser's site data deletes it, and that on iPhone Safari it can also be deleted after about a week without opening the site unless the site is added to the Home Screen.
10. **Storage failure (FR-16).** Given storage is blocked, unavailable or full, when the app tries to save, then every screen keeps working and shows "Can't save here: your deck will be lost when you close this tab". Storage functions return typed results (AD-5).
11. **Motion and tokens (AD-10, NFR-3).** Given the approved design sheet, the tokens stay in `app/globals.css` under `@theme`, dark first, light following the system, both clearing WCAG 2.2 AA. The 3D flip, screen transitions, swipe-to-Mark (enabled only after a flip; buttons and keyboard kept) and the Result confetti all have `motion-reduce` fallbacks.
12. **Completion effect (AD-10).** Given the Student marks the last Card, when the Result screen opens, then a CSS confetti burst plays above a casual headline ("Pass complete!", from the design sheet) and the Score. The headline and Score are real text, announced once through the single `aria-live="polite"` region, and the Score is never hidden behind the effect. The effect is decorative (`aria-hidden`), plays once per Pass, stays inside the viewport with no horizontal scrolling at 320 px, and never blocks "Start again", "New deck" or Shuffle. With `prefers-reduced-motion` it becomes a static celebration (the headline with a still accent). It adds no network request, library or third-party asset. The headline reads the same for any Score. "Start again" replays it at the end of the next Pass; reloading on the Result screen shows the headline and Score but does not replay the burst.

## Tasks / Subtasks

- [x] Task 1: Pure core (AC: 1, 4, 5) — red-first, Node project
  - [x] 1.1 `lib/core/score.ts`: `knewCount(marks)` and `scorePercent(knew, total)` using integer math, halves up: `Math.floor((200 * knew + total) / (2 * total))`. Guard `total === 0` (return 0; never reached from the UI). Tests titled `FR-10 …` for every example in AC 1.
  - [x] 1.2 `lib/core/shuffle.ts`: `shuffleOrder(length, random: () => number): number[]` (Fisher–Yates, `j = Math.floor(random() * (i + 1))`, never `Math.random`). Move `identityOrder` here from `selectors.ts` (the architecture tree puts it in `shuffle.ts`) and update imports. Tests `FR-12 …` for Decks of 1, 2, 10 and 1,000 (each index exactly once).
  - [x] 1.3 `lib/core/seeded-random.ts` (test support, e.g. mulberry32) and the FR-13 tests: (a) exhaustive — feed scripted draws `(j + 0.5) / (i + 1)` for every `j` combination of a 3-Card Deck (3 × 2 = 6 sequences) and assert all six permutations appear exactly once; (b) 10,000 seeded Passes, each of the six orders between 14.7% and 18.7%. Use a fixed seed so the test is deterministic.
  - [x] 1.4 `lib/core/session.ts`: add `shuffle: boolean` to `SessionState` (initial `false`) and a `shuffle-set { shuffle }` action, accepted only on `ready` and `result` screens (ignored on `paste` and `study`). Let `pass-started` start from `ready` **or** `result` (Start again), still requiring a non-empty `order`; it clears Marks. `deck-made` keeps the current `shuffle`; `deck-discarded` returns `initialState` (Shuffle off). Keep every `switch` ending in `assertNever`. Update the existing reducer tests (the 1.1 test "pass-started is ignored outside Ready" must now allow Result).
  - [x] 1.5 `lib/core/selectors.ts`: add `score(deck, state)` returning `{ knew, total, percent }`. No `position` or `score` in state or stored JSON (PAT-10).
- [x] Task 2: Saved state, storage adapter, persistence hook (AC: 6, 7, 8, 10) — red-first
  - [x] 2.1 `lib/core/parse-lines.ts`: export `PARSER_VERSION = 1` (Story 1.3 bumps it).
  - [x] 2.2 `lib/core/saved-state.ts`: `SAVED_STATE_VERSION = 1`; `SavedState = { version, parserVersion, pasteText, screen: "ready" | "study" | "result", shuffle, order, marks }` (no `null`, no dates); `toSavedState(state): SavedState | null` (returns `null` when `pasteText === ""`, meaning "remove the key"; maps `paste` to `ready`); `parseSavedState(json: string)` → `Result<RestoredState, { reason: "invalid-data" | "unknown-version" }>` using the two-stage validator (AD-2): stage 1 structure (types, enums, sizes), stage 2 consistency against the re-derived Deck (`deckOf`): `ready` has empty `order` and `marks`; `study` and `result` have `order` as a permutation of `0..N-1` and each Mark `"knew" | "missed"`; `study` has `marks.length < N`, `result` has `marks.length === N`. Hand-written, no schema library. On a `parserVersion` mismatch return the Paste text with progress dropped (a `ready` state) provided the text still makes a Deck. Pure, so it lives in `lib/core/` and is tested in the Node project.
  - [x] 2.3 `lib/storage/local-storage.ts`: the only file that touches `localStorage` under the key `flashflip:saved-state`. `readSavedState()`, `writeSavedState(json)`, `removeSavedState()` return typed results (`storage-unavailable`); this is the only place allowed to `try/catch` (AD-5, PAT-11). Catch quota and `SecurityError` on read, write and even on `window.localStorage` access. Tests in the jsdom project with a stubbed storage (blocked, throwing on `setItem`, full).
  - [x] 2.4 `lib/hooks/use-saved-state.ts`: `useSavedState(state)` runs one effect after state changes that writes (or removes) via the adapter, and returns `saveFailed`. Saving must not run in the tap's click handler (NFR-1, AD-8). Clear `saveFailed` after a later successful write.
  - [x] 2.5 `components/flash-flip-app.tsx`: implement the `restoring` phase (PAT-13, AD-8). Split into an outer `FlashFlipApp` that renders `<Skeleton />` on the server and on the first client render, then reads storage in a mount effect and renders an inner session component with the restored (or initial) state as the `useReducer` initial value. No loading flag in the reducer. Add `components/ui/skeleton.tsx` (neutral, no spinner).
  - [x] 2.6 Wire the hook in the session component; render `<SaveFailedNotice />` (copy: "Can't save here: your deck will be lost when you close this tab") on every screen when `saveFailed` is true.
  - [x] 2.7 ESLint: allow `localStorage` only in `lib/storage/**` (extend `eslint.config.mjs`: `no-restricted-globals` for `localStorage` elsewhere, plus the existing core ban). Keep the other existing rules.
- [x] Task 3: Result, Ready, Study screens (AC: 1, 2, 3, 4, 9, 12)
  - [x] 3.1 `lib/copy.ts` (PAT-4; PRD-fixed strings stay verbatim): `resultHeading` becomes "Pass complete!", `score(x, n, p)` → `"X of N (P%)"`, `startAgain: "Start again"`, `shuffle: "Shuffle"`, `discardConfirm: "Discard this deck and your progress?"` plus casual labels for the dialog buttons (for example "Discard" and "Keep studying"), `deviceOnlyNotice` (the three facts of FR-15), `saveFailed`. Update `lib/copy.test.ts` to guard the exact PRD wording.
  - [x] 3.2 `components/ui/shuffle-toggle.tsx`: a native `<button type="button" role="switch" aria-checked>` labelled "Shuffle", 44 px target, visible focus. Shown on Ready and Result only.
  - [x] 3.3 `components/ui/notices.tsx`: `DeviceOnlyNotice` (body-size text, never collapsed, shown on Ready, Study and Result) and `SaveFailedNotice`.
  - [x] 3.4 `components/ui/confirm-dialog.tsx`: native `<dialog>` opened with `showModal()`, never `window.confirm` (PAT-15). The Study screen's "New deck" button (omitted in Story 1.1) opens it only when `marks.length > 0`; with none it discards at once. Declining changes nothing. Add `confirm-dialog.test.tsx`. jsdom may not implement `HTMLDialogElement.showModal`/`close`: stub them in `vitest.setup.ts` if missing.
  - [x] 3.5 `components/screens/result-screen.tsx`: headline, Score text, "Start again", "New deck", Shuffle toggle, device-only notice. `components/screens/ready-screen.tsx`: add the Shuffle toggle and notice. `components/screens/study-screen.tsx`: add "New deck" and the notice; no Shuffle.
  - [x] 3.6 `components/flash-flip-app.tsx` (session component): "Start" and "Start again" compute the Pass order with `shuffle ? shuffleOrder(n, Math.random) : identityOrder(n)` and dispatch `pass-started { order }` (the caller injects `Math.random`; never inside core). `shuffle-set` on toggle. Compute the Score with `score(deck, state)`.
- [x] Task 4: Motion and completion effect (AC: 11, 12)
  - [x] 4.1 3D flip in `components/ui/flip-card.tsx` using `--duration-flip` and `--ease-pop` (already in `@theme`); keep it a native `<button>` (click, Enter, Space) and keep Term and Definition as plain React text in separate `dir="auto"` elements. Render the hidden face `aria-hidden` and `inert` so only the visible face is read and focusable. `motion-reduce`: instant swap, no rotation. If an iOS Safari 3D issue appears, fall back to a 2D flip (checklist item in Story 1.3).
  - [x] 4.2 Screen transitions with `--duration-screen`, with a `motion-reduce` fallback (none). Tap feedback within 200 ms (NFR-1).
  - [x] 4.3 `lib/hooks/use-swipe.ts` (Pointer Events; jsdom project): a horizontal drag past a threshold Marks the flipped Card; enabled only after the Card has been flipped once; `touch-action: pan-y` on the swipe surface; a short movement is still a tap (flip); a drag must not also fire the flip click. Direction mapping is an assumption — **right = "Knew it", left = "Missed it"** — confirm with the Student-facing design; keep both buttons and keyboard working. Dynamic offset via inline `style` transform only (PAT-14). `use-swipe.test.tsx`.
  - [x] 4.4 `components/ui/confetti.tsx`: CSS-only burst, `aria-hidden`, `pointer-events-none`, clipped to the viewport (`overflow-hidden`, no horizontal scroll at 320 px), keyframes in `globals.css`. `motion-reduce`: no animation, show the headline with a static accent instead.
  - [x] 4.5 Play the burst only on the last Mark of a Pass (local `celebrate` flag in the session component, not in reducer state, not stored); reset on Start again and New deck. A restore onto Result shows the headline and Score without the burst. Announce "headline + Score" once through the live region when the last Mark lands: in the `onMark` handler, for the last Card, call `announce(...)` instead of `announce("")`.
- [x] Task 5: Tests and verification (all ACs)
  - [x] 5.1 Component tests (jsdom, titled with FR IDs): Score on Result; Start again (Deck order and shuffled with a stubbed `Math.random`); Shuffle only on Ready and Result; confirmation appears only with Marks and declining changes nothing; restore for each screen (Ready, Study at Card 5 of 10 with the same Marks, Result with the same Score) using a stubbed `localStorage`; empty storage gives an empty Paste; skeleton first; invalid and unknown-version data open Paste; `parserVersion` mismatch opens Ready; blocked/throwing/full storage shows the save-failed notice and the app keeps working; the notice appears on all three screens.
  - [x] 5.2 `npm run lint`, `typecheck`, `test` and `build` pass. Check on a production build: no network requests after load (NFR-2), 320 px layout without horizontal scroll, reduced-motion fallback (toggle the OS setting or emulate in dev tools).

## Dev Notes

### Scope guards (do not build ahead)
- NOT in this story: list-marker removal, fullwidth colon, `——`, Unicode whitespace, grapheme truncation, the 200,000-character and 1,000-Card limits and their refusal messages, "Show all N", security headers, `docs/manual-checklist.md`, README, `app/error.tsx` (PAT-6 crash boundary arrives with the closing checks unless a restore crash makes it necessary). These belong to Story 1.3.
- No analytics, no cookies, no third-party fonts or scripts, no animation library (NFR-2, AD-10). No streaks, sharing or leaderboards.
- "Missed it" only counts toward the Score. Do not build retry-missed (PRD §7.2).
- Precision over recall: do not touch parser rules in this story other than exporting `PARSER_VERSION`.

### Architecture requirements (must follow)
- **AD-1/AD-2** one versioned key, Deck and Skipped lines re-derived, hand-written two-stage validator, no migrations; **AD-5** typed results, only the storage adapter catches exceptions; **AD-6** pure reducer, randomness injected (`pass-started { order }`); **AD-8** static shell, restore after mount, neutral skeleton, saving after the state update.
- **PAT-3** one `Action` union in `lib/core/session.ts`, new action `shuffle-set`, every `switch` ends in `assertNever`; **PAT-9** saved JSON is camelCase with no `null`, a Deck on the Paste screen is saved as `ready`, no Deck removes the key; **PAT-10** state holds `screen`, `pasteText`, `shuffle`, `order`, `marks` only (flip state, swipe offset, `celebrate` are local); **PAT-11** only `lib/storage/` touches `localStorage`, one persistence hook; **PAT-13** one `restoring` phase before the reducer exists, no other spinners; **PAT-14** tokens only, inline `style` only for the swipe transform; **PAT-15** native `<button>`, focus to heading on mount, one `aria-live="polite"` region, native `<dialog>` for confirmations; **PAT-16** SCREAMING_SNAKE_CASE constants, comments cite a PRD or AD ID; **PAT-17** Node project for `lib/core/**` and `lib/copy.test.ts`, jsdom for `components/**`, `lib/hooks/**`, `lib/storage/**`; **PAT-18** `shuffleOrder(length, random)`.
- ESLint already bans screens and ui from importing the parser, reducer, selectors, saved-state and storage; keep screens receiving derived data as props.

### Current state of files being changed (read before editing)
Story 1.1 is `done` (code review applied 2026-11-10). Read each file before editing; the repo has mixed CRLF/LF endings, so match each file's existing endings when you edit.
- `lib/core/session.ts`: `SessionState = { screen, pasteText, order, marks }`. Actions: `deck-made`, `pass-started { order }`, `card-marked { mark }`, `text-editing-started`, `text-editing-cancelled`, `deck-discarded`. `card-marked` ends the Pass using `state.order.length` (not a caller-supplied size). `pass-started` is currently ignored unless `screen === "ready"` with a non-empty order — **widen it to also accept `result`** for "Start again". `text-editing-cancelled` returns to `ready` when a Deck exists (the "Back" button added in the review).
- `lib/core/selectors.ts`: `deckOf`, `position`, `currentCard`, `identityOrder`. Keep `deckOf` memoized on `pasteText` in the caller (PAT-12).
- `components/flash-flip-app.tsx`: one component owning the reducer, `refusal` and an `announcement` `{ message, seq }` state with an `announce(message)` helper (the `seq` makes identical consecutive messages announce again; the helper is cleared on Mark, Start, Back and New deck). It already defensively renders Ready when `screen === "study"` has no current Card. The Paste screen is keyed by `pasteText` and gets `onEdit` (clears the refusal), `onBack` (only while a Deck exists). **Preserve all of this** when you split it into the restoring wrapper and the session component.
- `components/screens/study-screen.tsx`: the Study heading is visually hidden (`ScreenHeading visuallyHidden`). `StudyCard` is keyed by `position`; flip state is local. It calls `focus()` on the card button when `refocus` is true (`position > 1`) — **on a restore to Card 5 this would steal focus on page load**; pass `refocus` only after a Mark made in this session (track it in the parent), not when `marks.length > 0` came from storage.
- `components/ui/flip-card.tsx`: a `<button>` with `onKeyDown` that `preventDefault`s `event.repeat` (a held Enter must not flip the next Card — keep this); the max-height scrolling was removed, so long text now grows the page. `data-testid="term"` / `"definition"` are used by tests; with two faces rendered, update those tests to check the visible (non-`aria-hidden`) face.
- `components/ui/live-region.tsx`: `LiveRegion({ message, seq })`. `components/ui/screen-heading.tsx`: takes `visuallyHidden`. `components/ui/button.tsx`: `variant` primary/secondary/knew/missed, 44 px min size.
- `components/screens/result-screen.tsx`: bare, only "New deck". `ready-screen.tsx`: counts, preview, Skipped lines, Start / Edit text / New deck (preview and Skipped lines use `wrap-anywhere`).
- `app/globals.css`: tokens from the approved sheet, including `--spacing-gutter` (used as `px-gutter`), motion tokens `--duration-flip`, `--duration-screen`, `--duration-tap`, `--ease-pop` (defined, unused so far), `--text-small` (counter only). Add keyframes here. `[tabindex="-1"]:focus-visible { outline: none }` exists for programmatic heading focus.
- `docs/design-sheet.md` (approved 2026-11-10): the Story 1.2 Result headline is "Pass complete!" and must read the same for any Score. `--color-surface-raised` is reserved for pressed/hover — use it for those states here.
- `eslint.config.mjs`: has the `dangerouslySetInnerHTML` ban, the `lib/core/**` purity rules (including `localStorage` as a banned global there) and the screens/ui import boundary. Extend; keep existing rules.
- `vitest.config.ts`/`vitest.setup.ts`: two projects; `vitest.setup.ts` registers jest-dom and `cleanup`. `lib/storage/**` and `lib/hooks/**` tests already fall in the jsdom project.
- `app/page.tsx` is the trivial Server Component rendering `<FlashFlipApp />` (keep; with `cacheComponents` all storage access stays inside Client Component effects). `next.config.ts`: do not change (headers are Story 1.3).

### Learnings from the Story 1.1 code review (apply here)
- **Live region:** there must be exactly one `aria-live="polite"` region; do not add `role="alert"` or a second live region (1.1 removed one). The refusal is announced via `announce(...)`.
- **Announcement clearing:** messages are cleared on screen changes through `announce("")`; use the `seq` in `LiveRegion` so repeated text re-announces.
- **Held Enter** on a button must not auto-repeat onto the next control (flip card guards `event.repeat`).
- **Stale UI state:** clear derived messages when their input changes (the refusal clears on edit).
- **Don't trust caller-supplied sizes in the reducer;** derive lengths from state (`order.length`). Add guards for impossible transitions rather than rendering a wrong screen.
- **Tests:** every test title starts with a PRD ID (`FR-10 …`); `describe` blocks too. Use `data-testid` for visual-only nodes. A real browser pass was not done for key auto-repeat; do a manual check of the flip card and swipe on a production build.
- **Known open item that Story 1.3 owns (do not "fix" here):** FR-4 says runs of whitespace inside a Term or Definition collapse to one space. The 1.1 review removed the collapse because Story 1.1's spec said "trim"; **Story 1.3 must restore it** (and the review's deferred parser/Unicode items in `_bmad-output/implementation-artifacts/deferred-work.md`).

### Deferred items that touch this story's files
- ScreenHeading steals focus on every mount and `[tabindex="-1"]:focus-visible` hides outlines app-wide (deferred). With restore, make sure the skeleton does not focus anything and the heading focuses once when the restored screen mounts.
- A scrollable region inside the flip `<button>` is deferred to Story 1.3 (FR-17: the Card scrolls vertically when taller than the screen; the architecture says the scroll container sits inside each face with `touch-action: pan-y` on the swipe surface). Design the two faces so that Story 1.3 can add it without re-working the flip.

### Technical notes
- **Rounding:** use integer arithmetic for halves-up percent (`floor((200 * X + N) / (2 * N))`): 1 of 8 → 13, 3 of 8 → 38, 5 of 7 → 71. Avoid floating `Math.round(100 * X / N)` edge cases.
- **Fisher–Yates with `random() ∈ [0, 1)`:** `for (i = n - 1; i > 0; i--) { j = floor(random() * (i + 1)); swap(a[i], a[j]) }`. The exhaustive test scripts `random` to return `(j + 0.5) / (i + 1)`.
- **Hydration:** the server and first client render must match (skeleton); read `localStorage` only inside `useEffect`. Do not read storage during render or in a `useState` initializer.
- **Restore flow:** `readSavedState` → `parseSavedState` → on `ok` use the restored `SessionState` (`screen`, `pasteText`, `shuffle`, `order`, `marks`); on failure start from `initialState`. Position is `marks.length` and the flip state is not stored, so a restored Study screen shows Term first.
- **Next.js / React:** Next 16.4.6, React 19.3.1, Tailwind 4 (CSS-first, tokens in `@theme`), Vitest 5.1, jsdom 31, TypeScript 5.9. `localStorage` quota and Safari private-mode errors surface on `setItem` (and on property access); handle both in the adapter.
- **Persistence timing:** save in a `useEffect` keyed on the state, not in the dispatching handlers. Skip the write on the very first render if the state equals what was just restored is optional; a redundant write is harmless.
- **iOS Safari 3D flip:** keep `backface-visibility: hidden` plus `-webkit-backface-visibility`, set `perspective` on the wrapper, and keep a 2D fallback ready (Story 1.3's checklist verifies on device).

### Project Structure Notes
- New files, per the architecture tree: `lib/core/{score,shuffle,seeded-random,saved-state}.ts` (+ tests), `lib/storage/local-storage.ts` (+ test), `lib/hooks/{use-saved-state,use-swipe}.ts(x)` (+ tests), `components/ui/{shuffle-toggle,confirm-dialog,notices,confetti,skeleton}.tsx` (+ tests where listed). Modified: `lib/core/{session,selectors,parse-lines}.ts`, `lib/copy.ts`, `components/flash-flip-app.tsx`, `components/screens/{ready,study,result}-screen.tsx`, `components/ui/flip-card.tsx`, `app/globals.css`, `eslint.config.mjs`, `vitest.setup.ts`.
- `identityOrder` moves from `selectors.ts` to `shuffle.ts` to match the tree; update the single import in `flash-flip-app.tsx` and the selectors test.
- No variances from the architecture. `components/ui/button.tsx` (added in Story 1.1) stays.
- Repository is local-only, so no CI work. Branch `engineered`; nothing is committed yet, and Story 1.1's work is in the working tree.

### References
- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Score, shuffle and keep cards after refresh]
- [Source: _bmad-output/planning-artifacts/epics.md#Additional Requirements] (AD-1, AD-2, AD-5, AD-6, AD-8, AD-10, PAT-9 to PAT-18, scope guards)
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules] (PAT-3, PAT-9 to PAT-15, PAT-18)
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries] (file tree, data boundaries, data flow, iOS 3D-flip notes)
- [Source: _bmad-output/planning-artifacts/prds/prd-flashflip-2026-11-10/prd.md#4.3 Score] (FR-10, FR-11) and #4.4 Shuffle (FR-12, FR-13) and #4.5 Saved state (FR-14 to FR-16)
- [Source: docs/design-sheet.md] (tokens, motion, tone)
- [Source: _bmad-output/implementation-artifacts/1-1-paste-cards-and-flip-quiz.md#Review Findings] and [deferred-work.md]

## Dev Agent Record

### Agent Model Used

Claude Sonnet 5.5 (claude-sonnet-5-5)

### Debug Log References

- jsdom keeps `localStorage` across tests in one file, so `vitest.setup.ts` now clears it before and after each test (otherwise a previous test's Deck was restored). It also stubs `HTMLDialogElement.showModal`/`close` when jsdom lacks them.
- `react-hooks/set-state-in-effect` flags the two effects that mirror an external system into state (the one-time restore after mount, and the save result). Both carry a targeted `eslint-disable-next-line` with the reason (AD-8, FR-16).
- A multi-heredoc shell command that mixed Python and apostrophes failed to parse and wrote nothing; the files were then written one by one.

### Completion Notes List

- **Story complete (2026-11-10).** All tasks done. `npm run lint`, `typecheck`, `test` (167 tests: 12 files, core + dom) and `build` pass. Production build checked in Chrome: Ready → Start → flip (real `matrix3d` rotation, Definition face shown) → Marks → Result; reload on Study restores Card 1 of 3, reload on Result restores "2 of 3 (67%)" with no confetti replay; no horizontal overflow and no control under 44 px at 320 px (iframe); every resource loaded from `localhost` only (no third-party requests).
- Core (red-first): `score.ts` (integer half-up percent), `shuffle.ts` (Fisher–Yates over an injected source; `identityOrder` moved here from `selectors.ts`), `seeded-random.ts` (mulberry32), `saved-state.ts` (PAT-9 shape, two-stage validator, `parserVersion` mismatch keeps text and opens Ready), reducer (`shuffle` state, `shuffle-set`, `pass-started` also from Result), `PARSER_VERSION = 1`. FR-13 is tested both exhaustively (all six draw sequences) and statistically (10,000 seeded Passes).
- Persistence: `lib/storage/local-storage.ts` is the only code touching `localStorage` and the only `try/catch` for it; ESLint now enforces that (probe file confirmed). `useSavedState` saves in an effect after state changes; `FlashFlipApp` is split into a restoring wrapper (skeleton until mount, then reads storage once) and a `Session` that owns the reducer.
- UI: Result (Score, headline, Start again, New deck, Shuffle), Ready (+ Shuffle), Study (+ New deck with a native `<dialog>` confirmation once a Mark exists), device-only notice on Ready/Study/Result, save-failed notice, 3D flip (two faces in one grid cell, hidden face `aria-hidden` + `inert`, instant swap under reduced motion), screen-enter transition, swipe hook (right = Knew it, left = Missed it), CSS-only confetti (reduced motion hides it; the headline keeps a still accent).
- Decisions and assumptions (flagged in the story for confirmation): swipe direction; `deck-made` keeps Shuffle while `deck-discarded` resets it; dialog buttons "Discard" / "Keep studying"; the Study screen's refocus-after-Mark is now a session flag so a restore never steals focus; the confetti and refocus flags are local UI state, not reducer or saved state (PAT-10).
- Not done: the manual `prefers-reduced-motion` check in a browser (covered only by CSS media queries and the CSS present in the build), real iOS/Android devices and the iOS 3D-flip check (Story 1.3 checklist), and a keyboard-only pass in a real browser (Testing Library covers click, Enter, Space, focus-to-heading). Tests for the screens were written after the screens; core tests were red-first.
- Vite still prints two non-blocking notices (ESM config loaded as CJS; `vite-tsconfig-paths` now natively supported). Unchanged from Story 1.1.

### File List

- lib/core/score.ts, score.test.ts (new)
- lib/core/shuffle.ts, shuffle.test.ts, seeded-random.ts (new)
- lib/core/saved-state.ts, saved-state.test.ts (new)
- lib/core/session.ts, session.test.ts (modified: `shuffle`, `shuffle-set`, `pass-started` from Result)
- lib/core/selectors.ts, selectors.test.ts (modified: `score`, `identityOrder` moved)
- lib/core/parse-lines.ts (modified: `PARSER_VERSION`)
- lib/copy.ts, lib/copy.test.ts (modified)
- lib/storage/local-storage.ts, local-storage.test.ts (new)
- lib/hooks/use-saved-state.ts, use-saved-state.test.tsx, use-swipe.ts, use-swipe.test.tsx (new)
- components/flash-flip-app.tsx (modified: restoring wrapper, Session), flash-flip-app.test.tsx (modified), flash-flip-app.session.test.tsx (new)
- components/screens/ready-screen.tsx, study-screen.tsx, result-screen.tsx, paste-screen.tsx (modified)
- components/ui/flip-card.tsx, screen-heading.tsx (modified)
- components/ui/confetti.tsx, confirm-dialog.tsx, confirm-dialog.test.tsx, notices.tsx, shuffle-toggle.tsx, skeleton.tsx (new)
- components/ui/button.tsx (modified: `duration-(--duration-tap)`)
- app/globals.css (modified: flip, screen-enter, confetti)
- eslint.config.mjs, vitest.setup.ts (modified)
- _bmad-output/implementation-artifacts/sprint-status.yaml (status updates)

### Change Log

- 2026-11-10: Story 1.2 implemented. Score, Start again, Shuffle with injected randomness, Saved state with a validated restore and skeleton, device-only and save-failed notices, native-dialog confirmation, 3D flip, swipe-to-Mark and confetti with reduced-motion fallbacks; 167 tests. Status: review.
- 2026-11-10: Code review patches applied (7): ESLint lib/core globals ban restored, swipe capture only on drag with pointer filtering and no stale `dragged`, no removal or save-failed notice on an empty start, ConfirmDialog `onClose` sync plus tests, onMark guard mirroring the reducer, `duration-tap` utility fixed. 177 tests; lint, typecheck and build pass. Decision resolved (option 1): the live region announces only the Score on finishing; the focused Result heading carries the headline.

### Review Findings

Code review 2026-11-10 (Blind Hunter, Edge Case Hunter, Acceptance Auditor). 1 decision-needed, 6 patch, 9 defer, 5 dismissed.

- [x] [Review][Decision] Result headline may be read twice: the last Mark announces "Pass complete! X of N (P%)" in the live region while ScreenHeading also focuses the "Pass complete!" h1. AC 12 says the headline and Score are announced once through the single live region. Options: (a) keep the heading focus and announce only the Score; (b) keep the full announcement and do not focus the heading on Result; (c) keep both. [components/flash-flip-app.tsx:124-134, components/ui/screen-heading.tsx:16]
- [x] [Review][Patch] ESLint: the new PAT-11 block replaces the `no-restricted-globals` options for lib/core, so the window/document/navigator ban (PAT-5, Task 2.7) is lost there. Exclude lib/core from that block (the core block already bans localStorage) and re-probe all four globals [eslint.config.mjs:64-79]
- [x] [Review][Patch] Swipe: `setPointerCapture` on the wrapper on pointerdown may retarget the click away from the flip button after the first flip (AC 11 tap = flip). Capture only after movement passes the tap slop [lib/hooks/use-swipe.ts:33]
- [x] [Review][Patch] Swipe: `dragged` is not cleared by `reset()` or `onPointerCancel`, so a later keyboard flip can be swallowed. Also ignore non-primary pointers and non-zero buttons, and track the pointerId [lib/hooks/use-swipe.ts:23-61]
- [x] [Review][Patch] Restore: an invalid, unknown-version or unreadable Saved state is deleted on mount because the first save effect runs `removeSavedState()` for the empty state (weakens AC 8 "ignored"), and a blocked store shows the save-failed notice on an empty Paste screen (AC 10). Skip the removal on the first effect run when there is no Deck, and add tests that the key survives [lib/hooks/use-saved-state.ts:14-19]
- [x] [Review][Patch] ConfirmDialog: add `onClose` sync so a browser-closed dialog cannot leave `confirming` stuck, and add the missing `confirm-dialog.test.tsx` (Task 3.4: Escape, cancel, confirm) [components/ui/confirm-dialog.tsx:33-40]
- [x] [Review][Patch] onMark computes `finished` and the Score from the render snapshot and `deck.cards.length`, while the reducer uses `order.length` and ignores extra Marks, so a double input can announce or celebrate without a state change. Guard on `state.screen === "study"` and `state.marks.length < state.order.length` [components/flash-flip-app.tsx:123-135]
- [x] [Review][Patch] The `duration-tap` class is not emitted by Tailwind v4 (only the variable exists in the built CSS), so Button's transition duration is a no-op. Use `duration-(--duration-tap)` or an equivalent [components/ui/button.tsx:23, app/globals.css]
- [x] [Review][Defer] Two tabs overwrite each other's Saved state; no `storage` listener [lib/hooks/use-saved-state.ts] — deferred, out of the story's scope (single device, single session)
- [x] [Review][Defer] Reducer trusts its callers: `pass-started` does not check the order is a permutation, `text-editing-started` is not guarded by screen [lib/core/session.ts] — deferred, unreachable from the UI today
- [x] [Review][Defer] The swipe drag transform ignores `prefers-reduced-motion` [components/screens/study-screen.tsx:53-57] — deferred, user-driven movement
- [x] [Review][Defer] Study with no current Card falls back to Ready, where Start does nothing [components/flash-flip-app.tsx:154-167] — deferred, unreachable through the validator
- [x] [Review][Defer] Accessibility polish: textarea `dir="auto"`, `aria-invalid`/`aria-describedby` on refusal, Mark buttons stay enabled after flipping back [components/screens/paste-screen.tsx, components/ui/flip-card.tsx] — deferred
- [x] [Review][Defer] No `<noscript>` message for the skeleton [components/ui/skeleton.tsx] — deferred
- [x] [Review][Defer] Confetti: the reduced-motion comment says "still accent" but the CSS only hides the burst; the fall height is fixed and can clip on short Result screens [app/globals.css, components/screens/result-screen.tsx] — deferred
- [x] [Review][Defer] Weak test assertions: substring `toHaveTextContent("t1")`, the restore focus test does not assert the Card is unfocused, `cardsMade(1, 0)` pluralisation locked in [components/flash-flip-app.session.test.tsx, lib/copy.test.ts] — deferred
- [x] [Review][Defer] Native `<dialog>` stub in vitest.setup.ts does not model focus trap or initial focus; verify in a real browser [vitest.setup.ts] — deferred

---
title: 'Flip-card quiz with shuffle'
type: 'feature'
ticket: '2'
created: '2026-10-28'
status: 'built'
baseline_revision: 'edd4bfb9bc2a6f8a220b6398736d61bb7ac1d5e4'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Story 1.1 saves a deck, but the student cannot quiz on it yet: there is no round, no card screen, no flip and no marking.

**Approach:** Add the core `shuffle` and the round transitions (`startRound`, `mark`) to the pure core. Rename Save deck to **Start**, which saves the deck and starts a shuffled round. Add a phone-first quiz screen that shows one card at a time, flips to the definition and records Knew it / Missed it.

## Boundaries & Constraints

**Always:**
- Follow architecture AD-1 to AD-12, with AD-11 as amended in story 1.1's plan (`onStart(cards, skipped)`, and a root-owned `role="status"` region that stays mounted with its text keyed on `deckRevision`). Use the exact names and signatures given there: `shuffle`, `isComplete`, `startRound`, `mark`, `QuizScreenProps`.
- Every round is built by the root from the `cards` passed to `onStart`, never from `state.deck` (AD-7). Its order never changes after creation.
- Labels are exactly **Start**, **Knew it** and **Missed it**. The flip control is a real `<button>`, Enter and Space flip it, and only the visible face is in the accessibility tree. Any flip animation sits inside `motion-safe:`. Tap targets are ≥ 44px.
- The root renders `<QuizScreen key={card.id} …/>`, so every card opens on its term.
- When a new card appears, focus moves to its flip control.
- **Decision (user, 2026-10-28):** After the last card, a minimal placeholder shows a "Round complete" heading and a **Back to deck** button that dispatches `goToPaste`; the button takes focus on mount. Story 1.3 replaces it with the score screen.
- **Decision (user, 2026-10-28):** Knew it / Missed it appear only once the definition is showing.
- **Decision (user, 2026-10-28):** Start sets the story 1.1 notice ("Saved N cards", plus skipped lines removed), and the root clears it on the first mark of the round.
- **Decision (user, 2026-10-28):** Keep the plan (~1,900 tokens) as one story: Start needs shuffle, the round transitions and the quiz screen together.

**Never:**
- No score screen, Retry missed or New round. That is story 1.3, which adds `scoreOf`, `missedIds` and `canRetry`.
- Rounds and results are never written to storage, and `startRound`/`mark` cause no storage call (AD-5, AD-8).
- No new dependencies.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Seeded shuffle | `shuffle(['a','b','c','d'], seededRng)` | A fixed permutation, the same on every run; the input array is unchanged | None |
| Shuffle is a permutation | any ids, `Math.random` | Same length and same members as the input | None |
| Start | 10 valid cards | Deck saved, `view = 'quiz'`, `round.order` is a permutation of the 10 ids, `index = 0` | None |
| `startRound` refused | `deck` is `null`, `order` is `[]`, or an id not in `deck` | State unchanged | None |
| Mark mid-round | index 3 of 10, `mark knew` | `results[order[3]] = 'knew'`, `index = 4`, still `quiz` | None |
| Mark last card | index 9 of 10 | `index = 10`, `view = 'score'`, `isComplete` true | None |
| Mark when done | `round` `null` or complete | State unchanged | None |
| Reload mid-round | a round in progress | Paste screen with the saved deck, no round | None |

</frozen-after-approval>

## Code Map

- `lib/flashflip/types.ts` — `Card`, `Round`, `View`, `AppState` already exist from story 1.1. Do not change them.
- `lib/flashflip/reducer.ts` — `Action` has `replaceDeck`, `clearDeck`, `goToPaste`. Add `startRound` and `mark` so the union matches AD-10 exactly. `initialState` is unchanged.
- `lib/flashflip/parse.ts` — unchanged.
- `lib/storage/deck-store.ts` — unchanged. No storage calls for rounds.
- `components/flashflip/flashflip-app.tsx` — root. Already owns `deckRevision`, `notice`, `pasteRef`, the focus-return `useEffect`, the always-mounted `<p role="status"><span key={deckRevision}>{notice}</span></p>`, and `handleStart(cards, skipped)` / `handleClear`. Keep all of these. `handleStart` gains the `startRound` dispatch; rendering gains the `quiz` view.
- `components/flashflip/paste-screen.tsx` — the button labelled "Save deck" becomes "Start". Nothing else changes. `plural` is exported from here.
- `components/flashflip/*.test.tsx` — use the existing `mount()` helper (`act` + `<Suspense>`) and the `afterEach` that clears the deck store. Tests that query `{ name: 'Save deck' }` become `{ name: 'Start' }`. A test that saves and then checks the paste screen must first return to it, by remounting (reload).
- `eslint.config.mjs`, `app/*`, `vitest.config.mts` — unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `lib/flashflip/shuffle.ts` + `shuffle.test.ts` — unbiased Fisher–Yates `shuffle<T>(items: readonly T[], rng: () => number = Math.random): T[]` returning a new array (AD-7). Test it with a small seeded rng (e.g. a mulberry32 inside the test file), check that it is a permutation, and check that the input is not mutated.
- [x] `lib/flashflip/round.ts` + `round.test.ts` — `isComplete(round)` per AD-8. The other `round.ts` exports belong to story 1.3.
- [x] `lib/flashflip/reducer.ts` + `reducer.test.ts` — `startRound` and `mark` with the AD-9 transitions and AD-8 guards. Test every matrix row that touches the reducer.
- [x] `components/flashflip/quiz-screen.tsx` + `quiz-screen.test.tsx` — `QuizScreenProps = { card: Card; position: number; total: number; onMark(result: 'knew' | 'missed'): void }` (AD-11). Show "Card N of M" and a full-width flip `<button>` that shows the term and, once flipped, the definition (only the visible face rendered). Knew it / Missed it buttons render only after the flip and call `onMark`. The flip button takes focus on mount. Test: opens on the term with no mark buttons; click, Enter and Space each flip; only one face is in the accessibility tree; after the flip Knew it / Missed it call `onMark` with the right value; position text.
- [x] `components/flashflip/flashflip-app.tsx` + `flashflip-app.test.tsx` — `handleStart` dispatches `replaceDeck` then `startRound` with `shuffle(cards.map(c => c.id))`, saves, and sets the notice. `handleMark(result)` dispatches `mark` and clears the notice when `round.index === 0`. Render `QuizScreen` for `order[index]` while `view === 'quiz'`, and the "Round complete" placeholder (inline in the root, or a small `round-complete.tsx`) while `view === 'score'`. Test through the real root: Start on 10 cards gives a quiz whose 10 cards are each shown once; the notice shows after Start and is empty after the first mark; marking advances; after the last mark "Round complete" shows with Back to deck focused, and Back to deck returns to the paste screen with the deck filled in; a remount mid-round shows the paste screen with the saved deck; Start writes the deck to storage and marking writes nothing.
- [x] `components/flashflip/paste-screen.tsx` + `paste-screen.test.tsx` — rename the button to **Start** and update the tests.

**Acceptance Criteria:**
- Given a 10-card deck, when Start is pressed, the page is reloaded and Start is pressed again, then the two rounds come out in different orders (a repeat is possible but has a 1 in 3,628,800 chance).
- Given a round, when each card appears, then it shows its term and the flip control has focus; tap, Enter or Space reveals the definition.
- Given a card on screen, when Knew it or Missed it is pressed, then the next card appears, and after the last card the round is complete.
- Given a round on a 375px-wide screen, then one card fills the screen and every control is at least 44px tall.

## Implementation Notes

- The placeholder is `components/flashflip/round-complete.tsx` (`RoundCompleteProps = { onBack(): void }`); the root passes a handler that dispatches `goToPaste`.
- The flip animation is a `flashflip-flip` keyframe in `app/globals.css`, applied only through `motion-safe:animate-[...]` to the face span (keyed by face, so it replays on each flip).
- jsdom does not implement keyboard activation of buttons, so `quiz-screen.test.tsx` asserts the flip control is a native `<button type="button">` whose Enter/Space key events are never cancelled; real Enter/Space flipping relies on native activation (the component adds no key handlers).
- Back to deck returns focus to the textarea via a separate `backCount` state that the root's focus effect also depends on; `deckRevision` still increments only on `replaceDeck`/`clearDeck` (AD-11).

## Plan Change Log

## Review Triage Log

Loop 1 — verdicts: medium 1, low 3, false 2.

| # | Finding | Verdict | Route | Evidence |
|---|---------|---------|-------|----------|
| 1 | Long unbroken term/definition overflows the card at 375px | medium | patch | True: the face `<span>` is a flex item with `min-width: auto`; `break-words` does not lower min-content, and the definition face has no wrap class. Fix: `w-full min-w-0 wrap-anywhere` on the span. |
| 2 | AC4 "one card fills the screen" vs `min-h-[50vh]` | false | rejected | AC4 restates R8 "one card per screen": only one card renders and the card plus mark buttons fit a 375px screen. |
| 3 | `app/globals.css` keyframe contradicts the Code Map's "`app/*` unchanged" | low | rejected | Only fix is editing this plan; the styling convention places styles in `globals.css` + `@theme`, and the animation is `motion-safe:` as the frozen block requires. |
| 4 | Focus drops to `body` after Back to deck | low | patch | True: the paste screen remounts under the same `deckRevision`, so the focus effect does not re-run. Keyboard users reach it every round. Fix: a separate focus counter the effect also depends on. |
| 5 | Enter/Space tests cannot fail (`press()` simulates native activation) | low | patch | True: the helper clicks any un-prevented BUTTON. Fix: replace with an assertion that the flip control is a native `<button type="button">`, which is what makes Enter/Space work. |
| 6 | No automated check that two rounds differ after a reload | false | rejected | The order is random by design; seeded `shuffle` tests plus the "built by shuffling the started cards" wiring test cover it, and the plan assigns the cross-reload comparison to the manual check. |

## Design Notes

AD-7's Start sequence, building on story 1.1's handler:

```tsx
function handleStart(cards: Card[], skipped: number) {
  if (cards.length === 0) return
  dispatch({ type: 'replaceDeck', cards })
  dispatch({ type: 'startRound', order: shuffle(cards.map(c => c.id)) })
  deckStore.saveDeck(cards)
  setNotice(/* as in story 1.1 */)
  setDeckRevision(r => r + 1)
}
```

The quiz screen's flipped state is ephemeral UI state inside `QuizScreen` (AD-5). Because the screen is keyed by card id, it resets on every new card with no effect. The flip button's accessible name is whichever face is showing, and `aria-pressed` is not used; the "Card N of M" line tells screen-reader users where they are.

## Verification

**Commands:**
- `npm test` — expected: all suites pass
- `npm run lint` — expected: 0 errors
- `npm run build` — expected: succeeds, and `/` is reported as static (`○`)

**Manual checks (if no CLI):**
- Run `npm run dev` at a 375px viewport: paste 10 cards, Start, flip with tap and with Enter/Space, mark every card, and check that the round completes. Reload, Start again, and compare the orders.

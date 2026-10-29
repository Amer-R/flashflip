---
title: 'Score and retry missed'
type: 'feature'
ticket: '3'
created: '2026-10-29'
status: 'built'
baseline_revision: 'e159fa279be6628ce567a6c66a3ecbd284257027'
route: 'full'
route_source: 'auto'
risk: 'low'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** After the last card the student sees only a "Round complete" placeholder (story 1.2). They get no score and cannot retry the cards they missed, which closes the study loop.

**Approach:** Add the derived round helpers to the core. Replace the placeholder with a score screen that shows known out of total and offers Retry missed, New round and Edit deck, each building its round in the root as AD-7 says.

## Boundaries & Constraints

**Always:**
- Follow architecture AD-1 to AD-12, with AD-11 as amended in story 1.1's plan (root-owned status region, `onStart(cards, skipped)`). Use the exact names and signatures given there: `scoreOf`, `missedIds`, `canRetry`, `ScoreScreenProps`.
- The score shown is always `scoreOf` of the round just completed, never `deck.length` (AD-8). Its copy is the known count and the round size separated by ` / `, e.g. `7 / 10`.
- Rounds are built only in the root (AD-7): New round is `startRound` with `shuffle(state.deck.map(c => c.id))`, and Retry missed is `startRound` with `shuffle(missedIds(state.round))`.
- Retry missed is rendered only when `canRetry(round)` is true. Retry repeats until nothing is missed.
- Edit deck dispatches `goToPaste`. The paste screen opens with the saved deck filled in, and focus returns to the textarea (reuse story 1.2's `backCount` mechanism).
- When the score screen appears, focus moves to the score heading, so screen readers read the score.
- Tap targets are ≥ 44px. Base styles target the phone, and `sm:` and up enhances.

**Never:**
- Results and rounds are never written to storage; Retry missed and New round cause no storage call (AD-5, AD-8).
- No new dependencies. No change to the paste or quiz screens' behaviour.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Mixed round | 10 cards, 7 knew, 3 missed | Score `7 / 10`; Retry missed offered | None |
| All known | 10 of 10 knew | Score `10 / 10`; no Retry missed | None |
| All missed | 0 of 10 knew | Score `0 / 10`; Retry missed offered with all 10 | None |
| Retry missed | after `7 / 10` | A round of only the 3 missed ids, reshuffled; its score is out of 3 | None |
| `missedIds` order | results over `order` | Missed ids in `order` order; never ids outside `order` | None |
| New round | after any score | A round of every deck id, reshuffled; score out of the deck size | None |
| Edit deck | from the score screen | Paste screen with the deck filled in, no round, textarea focused | None |
| Reload after a score | a completed round | Paste screen with the saved deck; no score or results remain | None |

</frozen-after-approval>

## Code Map

- `lib/flashflip/round.ts` — has `isComplete` only. Add `scoreOf`, `missedIds` and `canRetry` per AD-8. `Round` comes from `types.ts`, which is unchanged.
- `lib/flashflip/reducer.ts` — the `Action` union already matches AD-10, and `startRound` already refuses an empty order or unknown ids. No change is expected.
- `components/flashflip/round-complete.tsx` — story 1.2's placeholder. Delete it; the score screen replaces it.
- `components/flashflip/flashflip-app.tsx` — the root. It renders `RoundComplete` while `view === 'score'`, and `handleBackToDeck` dispatches `goToPaste` and bumps `backCount`, which re-runs the textarea focus effect. Keep `deckRevision`, `notice`, the keyed status `<span>`, `pasteRef` and the focus effect exactly as they are. Rename `handleBackToDeck` to `handleEditDeck`.
- `components/flashflip/quiz-screen.tsx`, `paste-screen.tsx` — unchanged. Copy their button classes (`min-h-11 rounded-full …`, primary dark and secondary bordered) for the score buttons.
- `components/flashflip/flashflip-app.test.tsx` — has `mount()`, `tenLines`, and quiz-round tests that flip and mark cards. Story 1.2's "ends with Round complete, Back to deck focused…" test becomes the Edit deck test.
- `lib/storage/deck-store.ts`, `eslint.config.mjs`, `app/*` — unchanged.

## Tasks & Acceptance

**Execution:**
- [x] `lib/flashflip/round.ts` + `round.test.ts` — `scoreOf(round): { knew: number; total: number }` with `total = order.length`, `missedIds(round): string[]` in `order` order, and `canRetry(round): boolean`. Test the matrix rows for mixed, all known, all missed and `missedIds` order, including a result keyed by an id that is not in `order`, which is ignored.
- [x] `components/flashflip/score-screen.tsx` + `score-screen.test.tsx` — `ScoreScreenProps = { knew: number; total: number; canRetry: boolean; onRetry(): void; onNewRound(): void; onEditDeck(): void }` (AD-11). A heading shows `{knew} / {total}` with a short caption ("cards known"); it has `tabIndex={-1}` and takes focus on mount. The buttons are **Retry missed** (only when `canRetry`), **New round** and **Edit deck**, each calling its prop. Test the copy, the hidden Retry, each callback, and the focus on mount.
- [x] `components/flashflip/flashflip-app.tsx` + `flashflip-app.test.tsx` — while `view === 'score'`, render `ScoreScreen` from `scoreOf(state.round)` and `canRetry(state.round)`. Add `handleRetry` and `handleNewRound` per the Always rules, and rename `handleBackToDeck` to `handleEditDeck`. Delete `round-complete.tsx`. Test through the real root:
  - marking 7 of 10 Knew it shows `7 / 10`;
  - Retry missed gives a 3-card round that shows only the missed terms, then scores out of 3;
  - Retry is absent after `10 / 10`;
  - New round gives 10 cards;
  - Edit deck shows the filled paste screen with the textarea focused;
  - a remount after a score shows the paste screen with no score;
  - Retry and New round write nothing to storage.

**Acceptance Criteria:**
- Given a completed round on a 375px-wide screen, then the score and the three buttons fit without horizontal scroll, and each button is at least 44px tall.
- Given the score screen, when it appears, then a screen reader announces the score, because focus is on the score heading.
- Given Retry missed repeated until nothing is missed, then the last score is full marks and Retry missed is no longer offered.

## Implementation Notes

## Plan Change Log

## Review Triage Log

Loop 1 — quick lens: no findings (high 0, medium 0, low 0, false 0, maybe-false 0). Noted, not a defect: the 375px no-scroll criterion is backed in tests only by the `min-h-11` class and rests on the manual check.

## Design Notes

Both new handlers build the round in the root from the current state; the reducer only stores it:

```tsx
function handleRetry() {
  if (!round) return
  dispatch({ type: 'startRound', order: shuffle(missedIds(round)) })
}
function handleNewRound() {
  if (!state.deck) return
  dispatch({ type: 'startRound', order: shuffle(state.deck.map(c => c.id)) })
}
```

## Verification

**Commands:**
- `npm test` — expected: all suites pass
- `npm run lint` — expected: 0 errors
- `npm run build` — expected: succeeds, and `/` is reported as static (`○`)

**Manual checks (if no CLI):**
- Run `npm run dev` at a 375px viewport: mark 7 of 10 Knew it, check `7 / 10`, retry the 3 missed until none are left, then New round and Edit deck. Reload and check that no score remains.

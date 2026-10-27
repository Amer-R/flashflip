---
type: epic
title: "Study loop on one page"
parent: initiative-flashflip-mvp
covers: [R1, R2, R3, R4, R5, R6, R7, R8, R9]
sources: [_bmad-output/initiative-flashflip-mvp/initiative-flashflip-mvp.md]
companions: [_bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md]
after: []
refined: true
risk: medium # first deploy and the new hydration path in story 1
---

# Study loop on one page

## Description

This epic delivers the whole FlashFlip loop on one static page, deployed to production on Vercel: paste and save a deck, quiz on shuffled flip cards, see a score, and retry missed cards. It is the initiative's only epic.

## Outcome

A student on a phone runs the full loop on the production URL with no account or install, meeting the initiative's Done when checks.

## Requirements

- R1 (parent R1): Pasting `term - definition` lines makes one card per line that contains ` - `, split at the first ` - `. The page shows how many lines were skipped.
- R2 (parent R2): Cards are shuffled at the start of every round.
- R3 (parent R3): Cards appear one at a time, showing the term. Tapping reveals the definition.
- R4 (parent R4): The student marks each card **Knew it** or **Missed it** and moves on to the next.
- R5 (parent R5): At the end of a round, the student sees a score of cards known out of cards in the round, e.g. `7 / 10`.
- R6 (parent R6): After the score, the student can start a round with only the missed cards.
- R7 (parent R7): The pasted deck survives a page reload. Knew it / Missed it results last only for the current visit.
- R8 (parent R8): The layout is phone-first, with one card per screen and large tap targets. It also works on a laptop.
- R9 (parent R9): A quiz can start only when at least one card has been parsed. Pasting new lines replaces the saved deck, and a **Clear deck** control removes it.

## Constraints

- No login, accounts, server or database (parent Constraints).
- Next.js App Router, TypeScript, Tailwind CSS, localStorage, one page, Vercel (parent Constraints; architecture AD-2).

## Done when

- Every story's Verify check passes on the production Vercel URL.
- A student pastes 10 terms and finishes a quiz with a score in under 3 minutes on the production URL.
- Unit tests for the core and the reducer pass with `npm test`, and `npm run build` succeeds with `ensureStatic`.
- The loop works from paste to retry on a phone-width screen and on a laptop.

## Boundaries

- Out: everything in the initiative's Boundaries, including multiple decks, results saved between visits, and spaced repetition.

## References

- parent — _bmad-output/initiative-flashflip-mvp/initiative-flashflip-mvp.md, section Requirements
- architecture — _bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md, sections Invariants & Rules, Consistency Conventions, Structural Seed

## Notes

- Decision: 2026-10-28 — The tracer bullet is story 1, "Paste and save cards". It covers the page, the core parser, the storage adapter, the test setup and the first Vercel deploy.
- Decision: 2026-10-28 — No closing refactor-sweep story, because the epic has three entries. An end-to-end suite was not requested.
- Decision: 2026-10-28 — The stories run strictly in order 1 → 2 → 3. Story 2 needs the deck, reducer and Start from story 1, and story 3 needs completed rounds from story 2. All three change the same state owner.
- Decision: 2026-10-28 — Refined from the initiative's lines alone. The architecture settles the shared decisions.

---
type: initiative
title: "Students quiz themselves on their own pasted terms"
parent: none
sources: [_bmad-output/initiative-flashflip-mvp/brief-flashflip/brief-flashflip.md]
companions: [_bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md]
after: []
risk: low
---

# Students quiz themselves on their own pasted terms

## Description

FlashFlip is a single web page that turns a student's own `term - definition` lines into flashcards. The student flips through the cards, marks each one, sees a score and retries the cards they missed. Everything stays in the browser. The MVP is the smallest version that shows the whole loop in a 20-minute classroom demo (brief Summary).

## Outcome

First-year students revising on their phones can test themselves on their own terms with no account or install, meeting the brief's 3-minute and live-demo success criteria.

## Requirements

- R1 (brief Solution 1): Pasting `term - definition` lines makes one card per line that contains ` - `, split at the first ` - `. The page shows how many lines were skipped.
- R2 (brief Solution 2): Cards are shuffled at the start of every round.
- R3 (brief Solution 2): Cards appear one at a time, showing the term. Tapping reveals the definition.
- R4 (brief Solution 2): The student marks each card **Knew it** or **Missed it** and moves on to the next.
- R5 (brief Solution 3): At the end of a round, the student sees a score of cards known out of cards in the round, e.g. `7 / 10`.
- R6 (brief Solution 3): After the score, the student can start a round with only the missed cards.
- R7 (brief Solution): The pasted deck survives a page reload. Knew it / Missed it results last only for the current visit.
- R8 (brief Solution): The layout is phone-first, with one card per screen and large tap targets. It also works on a laptop.
- R9 (user 2026-10-28): A quiz can start only when at least one card has been parsed. Pasting new lines replaces the saved deck, and a **Clear deck** control removes it.

## Constraints

- No login, accounts, server or database. Everything stays in the browser (brief Summary, Scope Out).
- The stack is fixed: Next.js App Router, TypeScript, Tailwind CSS, localStorage, one page, deployed on Vercel (user, 2026-10-28; architecture spine).
- Losing the deck when browser data is cleared is accepted (brief Solution).

## Done when

- A student can paste 10 terms and finish a quiz with a score in under 3 minutes (brief Success Criteria).
- The full loop runs live on the production Vercel URL with no setup, account or install: paste, flip and mark, score, retry (brief Success Criteria).
- After a reload, the deck is still there and the previous results are gone.
- The page works one-handed on a phone-width screen and on a laptop.

## Boundaries

- Out: login or accounts, deck sharing, AI-generated cards, images, a native app, any database or server, spaced repetition, multiple decks, import/export, and saving results between visits (brief Scope Out).
- Touch point: Vercel project and git remote — configured only; owner: the user (story 1.1 hitl step)
- Tracer path: paste lines → deck saved → shuffled round → flip and mark → score → retry missed, all on one page.

## References

- brief — _bmad-output/initiative-flashflip-mvp/brief-flashflip/brief-flashflip.md, sections Solution, Success Criteria, Scope
- architecture — _bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md, sections Invariants & Rules (AD-1 to AD-12), Stack

## Notes

- Assumption: A reload restores the deck only, never a round in progress (architecture AD-8).
- Source conflict: prd — _bmad-output/initiative-flashflip-mvp/prd-flashflip/ is a draft with no requirements. The brief was used instead; the PRD is not a source until it has content.
- Decision: 2026-10-28 — Retrying missed cards (R6) stays in the MVP.
- Decision: 2026-10-28 — Zero valid cards keeps Start disabled. Pasting replaces the deck, and Clear deck removes it (R9).
- Decision: 2026-10-28 — Sliced into one epic, `epic-study-loop`, with three stories. Shuffle moved from the score story into the quiz story because the architecture shuffles at round start (AD-7).

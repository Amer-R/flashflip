---
name: FlashFlip
status: final
created: '2026-10-31'
updated: '2026-10-31'
sources:
  - ../initiative-flashflip-mvp.md
companions:
  - DESIGN.md
  - ../architecture-flashflip/architecture-flashflip.md
---

# FlashFlip — Experience Spine

## Foundation

FlashFlip is a single-page, phone-first web app (Next.js App Router, Tailwind CSS v4) that also works on a laptop. There is no component library: the DESIGN.md tokens become Tailwind `@theme` variables in `app/globals.css`, and components use them as utility classes. `DESIGN.md` is the visual identity; this spine is the behaviour.

This spine is a **visual and motion refresh of the shipped loop** (stories 1.1–1.3). It changes no requirement, label, state transition or storage rule in the initiative or the architecture (AD-1 to AD-12, with AD-11 as amended in story 1.1's plan). Where this spine and the architecture seem to disagree, the architecture wins and the conflict goes back to the user.

Light and dark mode both follow the system setting (`prefers-color-scheme`); there is no toggle.

Composition reference: [mockups/key-quiz.html](mockups/key-quiz.html) (Quiz: slim bar, "Card N of M" above the progress bar, the card, then the mark buttons). Spine wins on conflict.

## Information Architecture

One page, three views. The reducer's `view` alone decides which one shows (AD-9).

| Surface | Reached from | Purpose |
|---|---|---|
| Paste | First visit, reload, Clear deck, Edit deck | Paste `term - definition` lines, see the counts, Start or Clear deck |
| Quiz | Start, Retry missed, New round | One card at a time: flip, then Knew it / Missed it |
| Score | Marking the last card of a round | The score, then Retry missed, New round or Edit deck |

The page header (the FlashFlip title in `{typography.display}` and the one-line subtitle) shows on Paste only. On Quiz and Score it is replaced by a slim 44px bar holding only the word "FlashFlip" in `{typography.button}`, so the card gets the height (user, 2026-10-31). The header therefore lives in the client root, not in `app/page.tsx`; the page stays static with its one `<Suspense>`.

## Voice and Tone

Microcopy is friendly and short, with at most one exclamation mark per screen. The fixed labels from the initiative never change: **Start**, **Knew it**, **Missed it**, **Clear deck**, **Retry missed**, **New round**, **Edit deck**, and the score `N / M`.

| Where | Copy |
|---|---|
| Paste subtitle | "Paste your notes. Flip. Learn." |
| Textarea hint | "One card per line, like `mitosis - cell division`" |
| Count chips | "4 cards" · "1 skipped" |
| Card hint (term face) | "Tap to flip" |
| Score band: all known | "Perfect round!" |
| Score band: 70% or more known | "Nice work" |
| Score band: below 70% | "Keep going — retry the ones you missed" |
| Status after Start | "Saved 4 cards · 1 skipped line removed" (unchanged from story 1.1) |
| Status after Clear deck | "Deck cleared" (unchanged) |

| Do | Don't |
|---|---|
| "Keep going" | "You failed 3 cards" |
| Plain verbs that match the buttons | Jokes in labels, or emoji in place of words |

## Component Patterns

Behavioural. Visual specs live in `DESIGN.md` → Components.

| Component | Use | Behavioural rules |
|---|---|---|
| Card (flashcard) | Quiz | The whole card is one native `<button>`. Tap, Enter or Space flips it both ways. Only the visible face is in the accessibility tree. Each new card mounts fresh on its term face (keyed by card id). |
| Knew it / Missed it | Quiz | Appear only after the first flip, as before. Pressing one plays the exit motion, then the next card mounts. A second press during the exit is ignored. |
| Start | Paste | Disabled at 0 cards (dashed, no shadow). Saves the deck and starts a shuffled round, as before. |
| Count chips | Paste | Update on every keystroke from the same `parseDeck` result as before. The skipped chip shows only when skipped > 0. Announced through the existing `aria-live` counts line. |
| Textarea | Paste | Labelled "Your cards" as before, seeded once from the saved deck. The focus outline turns grape. Typing never moves focus. |
| Secondary buttons | Paste, Score | Clear deck, New round and Edit deck keep their story 1.1–1.3 behaviour; only their look changes. |
| Progress bar | Quiz | Fill is `(position - 1) / total` while a card is showing. It grows when a card is marked. Decorative: `aria-hidden`, because "Card N of M" carries the same information as text. |
| Score + band message | Score | The band is chosen from `knew / total`. The heading that holds the band message and the score keeps focus on mount, as before. |
| Confetti | Score | Plays once when `knew === total`, behind the score. `aria-hidden`, never blocks taps, removed after it ends. |
| Buttons (all) | Everywhere | Press state: the button drops into its shadow while held. Released → the action fires on click as normal. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Loading | Page | The existing "Loading your deck…" fallback, in `{typography.body}` on `{colors.canvas}` |
| Empty | Paste | Empty textarea with the hint and a placeholder showing two example lines. Start disabled. Chips read "0 cards" only. |
| All lines malformed | Paste | "0 cards" plus the skipped chip; Start disabled |
| Deck saved, back on Paste | Paste | Textarea filled from the deck; chips show the counts |
| Term face | Quiz | Term centred; "Tap to flip" hint; no mark buttons |
| Definition face | Quiz | Definition on the `{colors.sun-soft}` back; Missed it and Knew it slide up into place under the card |
| Last card marked | Quiz → Score | The exit motion plays, then the Score view mounts |
| Full marks | Score | "Perfect round!", confetti, no Retry missed, New round is the primary button |
| Some missed | Score | Band message, Retry missed is the primary button |
| Storage unavailable | Paste | No visible change: the app works for the visit (AD-3) |
| Reduced motion | All | Every motion below becomes an instant change; no confetti |
| Dark mode | All | Dark tokens from `DESIGN.md`; the same layout and motion |

## Interaction Primitives

All motion is inside `motion-safe:`. Timings are short enough that a 10-card round still fits in 3 minutes.

- **Flip:** a 3D turn on the card's vertical axis, 350ms with ease-out. The face swaps at the halfway point.
- **Mark exit:** Knew it slides the card off to the right with a slight tilt; Missed it slides it off to the left. 250ms. The next card pops in with a small scale-up from 0.96, 150ms.
- **Press:** buttons translate 3px down and right into their shadow while held. Instant, not animated.
- **Progress fill:** the bar width eases to its new value in 250ms.
- **Confetti:** one 1.2s fall on full marks.
- **Banned:** looping or idle animation, sound, haptics, streak counters, timers or countdowns, and any motion that delays focus moving to the next card.

## Accessibility Floor

Behavioural. Visual contrast lives in `DESIGN.md`.

- Everything stories 1.1–1.3 guarantee stays:
  - the root-owned status region and its announcements;
  - focus on each new card's flip control, on the score heading, and back on the textarea after Clear deck and Edit deck;
  - only the visible face in the accessibility tree;
  - tap targets of at least 44px.
- Focus moves to the next card when it mounts, not when the exit motion starts, so screen-reader users never land on a card that is leaving.
- With `prefers-reduced-motion: reduce`, nothing moves: flip, exit, progress and confetti all become instant.
- Every focusable element shows the `DESIGN.md` focus ring in both themes.
- Knew it and Missed it always carry their text labels; the icons are `aria-hidden`.
- Confetti and the progress bar are `aria-hidden`.

## Responsive & Platform

Phone first. From `sm:` up, the column stays at most 36rem wide and centred, the display and score sizes step up one notch, and the Score actions sit in a row. On a laptop, the Quiz view keeps the card no taller than 28rem so the mark buttons stay in view without scrolling. The layout must not scroll sideways at 320px.

## Key Flows

### Flow 1: Revise before a lab quiz (Lina, first-year biology, on the bus with her phone in one hand)

1. Lina opens FlashFlip and pastes ten `term - definition` lines from her notes. The chips read "10 cards".
2. She taps **Start**. The Quiz view slides in with the progress bar empty and the first term on the card.
3. She taps the card. It turns over to the definition on its yellow back, and Missed it / Knew it slide up.
4. She taps **Knew it**. The card flies off to the right, the bar fills a step, and the next term pops in.
5. She works through all ten cards. She misses three.
6. The Score view shows "Nice work" and **7 / 10**, with the 7 in green. Retry missed is the big grape button.
7. She taps **Retry missed** and gets only the three she missed, reshuffled.
8. **Climax:** she gets all three. "Perfect round!" and **3 / 3** appear as confetti falls behind the score.

Failure path: a line without ` - ` shows the "1 skipped" chip before she starts, so she can fix it or ignore it.

### Flow 2: Live classroom demo (Mr. Haddad, presenting FlashFlip on a projector from his laptop)

1. He opens the production URL on the laptop, already in dark mode. The page loads with no sign-in.
2. He pastes five lines, one deliberately malformed. The chips read "4 cards" and "1 skipped".
3. He presses **Start**, then flips the first card with the Space bar.
4. He marks the cards with the mouse; the class watches each card fly left or right.
5. **Climax:** the Score view shows **3 / 4** and the band message. He presses **Edit deck**, the paste screen comes back with the deck filled in, and the class sees the whole loop ran on one page.

Failure path: if the room's laptop has reduced motion turned on, every step still works with instant changes.

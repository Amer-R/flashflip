---
title: 'Playful visual refresh'
type: 'feature'
ticket: '4'
created: '2026-10-31'
status: 'in-review'
baseline_revision: 'f9183a0a91ba64d19bf877ee31157394c622fb1d'
route: 'full'
route_source: 'auto'
risk: 'medium'
review: 'quick'
review_source: 'pinned'
lenses_ran: ['quick']
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-flashflip-mvp/ux-flashflip/DESIGN.md', '{project-root}/_bmad-output/initiative-flashflip-mvp/ux-flashflip/EXPERIENCE.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The shipped loop works but uses the scaffold's plain zinc styling. R10 asks for the playful sticker design captured in the UX documents.

**Approach:** Turn the DESIGN.md tokens into theme variables that switch with the system colour scheme, load Fredoka, and restyle the paste, quiz and score screens to DESIGN.md and EXPERIENCE.md. Add the count chips, progress bar, slim header, flip and mark-exit motion, score band message and full-marks confetti. Behaviour, labels, storage and focus stay as stories 1.1–1.3 left them.

## Boundaries & Constraints

**Always:**
- DESIGN.md and EXPERIENCE.md are the spec; `ux-flashflip/mockups/key-quiz.html` shows the Quiz composition, and the documents win on conflict. Architecture AD-1 to AD-12 still bind (AD-11 as amended in story 1.1's plan). Where the UX documents and the architecture disagree, stop and ask.
- Keep every story 1.1–1.3 behaviour and guarantee: labels **Start**, **Knew it**, **Missed it**, **Clear deck**, **Retry missed**, **New round**, **Edit deck**; the score `N / M`; the root-owned status region; focus on each new card, on the score heading, and on the textarea after Clear deck and Edit deck; only the visible card face in the accessibility tree; no storage call outside Start and Clear deck.
- Every motion sits behind `motion-safe:` or a reduced-motion check. With `prefers-reduced-motion: reduce`, flip, exit, progress fill and confetti are instant or absent, and marking advances immediately.
- Colour is never the only signal. Tap targets stay at least 44px. Nothing scrolls sideways at 320px.
- **Decision (user, 2026-10-31):** The page header moves into the client root and becomes a slim bar on Quiz and Score. `app/page.tsx` stays a static Server Component with `ensureStatic` and one `<Suspense>`.
- **Decision (user, 2026-10-31):** Keep the plan (~1,750 tokens) as one story: the theme, fonts, screens and motion ship together.

**Never:**
- No new npm dependency; Fredoka comes from `next/font/google`.
- No change to the reducer, core functions, storage or the action contract.
- No sound, haptics, looping animation, timers or theme toggle.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Counts with skipped | 5 lines, 1 malformed | Chips "4 cards" and "1 skipped"; the live counts line announces both | None |
| Counts without skipped | 4 valid lines | Only the "4 cards" chip | None |
| Mark with motion | motion allowed, Knew it pressed | The card exits right, then the next card mounts and takes focus; a second press during the exit does nothing | None |
| Mark with reduced motion | reduced motion, Missed it pressed | The next card mounts at once with focus; no exit motion | None |
| Progress | Card 3 of 10 showing | Bar fill 20%; after marking it grows to 30% | None |
| Band: full marks | `knew === total` | "Perfect round!", confetti (motion allowed only), New round is the primary button | None |
| Band: 70% or more | 7 / 10 | "Nice work" | None |
| Band: below 70% | 6 / 10 | "Keep going — retry the ones you missed" | None |
| Header by view | Paste vs Quiz/Score | Full title and subtitle on Paste; slim "FlashFlip" bar on Quiz and Score | None |

</frozen-after-approval>

## Code Map

- `app/globals.css` — scaffold `:root`/`@theme inline` with zinc-era `--background`/`--foreground`, a body `font-family: Arial` override, and story 1.2's `flashflip-flip` keyframe. Replace the colours with DESIGN.md tokens as CSS variables on `:root`, overridden under `@media (prefers-color-scheme: dark)`, and map them in `@theme inline` (`--color-canvas`, `--color-ink`, `--color-grape`, …, plus `--shadow-sticker` and `--font-display`) so utilities like `bg-canvas`, `text-ink`, `shadow-sticker` and `font-display` switch theme without `dark:` prefixes. Put keyframes in `@theme` as `--animate-*`. Drop the Arial override so `font-sans` (Geist) applies.
- `app/layout.tsx` — loads Geist and Geist Mono via `next/font/google` as CSS variables. Add Fredoka the same way (`variable: '--font-fredoka'`). See `node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md`.
- `app/page.tsx` — holds the `<header>` and `<main>` around `<Suspense>`. Move the header into the root; keep `ensureStatic`, `<main>` and the fallback.
- `components/flashflip/flashflip-app.tsx` — the root. Render the full header on Paste and the slim bar on Quiz/Score (both an `h1` "FlashFlip"). Keep every handler, `deckRevision`, `backCount`, `notice`, the keyed status span and the focus effect as they are.
- `components/flashflip/paste-screen.tsx`, `quiz-screen.tsx`, `score-screen.tsx` — restyle. Their props types do not change. QuizScreen gains the exit motion and the progress bar; ScoreScreen gains the band message and confetti.
- `components/flashflip/*.test.tsx` — tests read `'4 cards · 1 skipped'` and assert `className` contains `min-h-11`. Update these for the chips and the new button heights. Do not weaken any behaviour or focus assertion.
- `lib/**`, `eslint.config.mjs`, `vitest.config.mts`, `package.json` — unchanged.

## Tasks & Acceptance

**Execution:**
- [ ] `app/globals.css`, `app/layout.tsx` — theme variables for both modes, Fredoka, `--shadow-sticker` (outline colour per mode), the focus ring, and `--animate-*` keyframes for flip, exit-right, exit-left, pop-in and confetti.
- [ ] `app/page.tsx`, `components/flashflip/flashflip-app.tsx` — move the header into the root and add the slim bar. Test: the full title and subtitle show on Paste; the slim bar shows on Quiz and Score.
- [ ] `components/flashflip/paste-screen.tsx` + test — sticker textarea, count chips inside the existing `aria-live` line (skipped chip only above 0), full-width Start with a disabled look, and Clear deck as a secondary button. Test the chip matrix rows.
- [ ] `components/flashflip/quiz-screen.tsx` + test — progress bar (`aria-hidden`), sticker card with the 3D flip and the `sun-soft` back, a "Tap to flip" hint on the term face, Missed it / Knew it with icons (`aria-hidden`) at 56px. Pressing a mark plays the exit, then calls `onMark` once; reduced motion (or no `matchMedia`) calls it at once. Test the mark matrix rows and the progress widths.
- [ ] `components/flashflip/score-screen.tsx` + test — band message and score inside the focused heading, the known count in the knew colour, a CSS-only confetti layer (`aria-hidden`, `pointer-events-none`, hidden under reduced motion) on full marks, and the primary button rule. Test the band rows and that confetti renders only on full marks.
- [ ] `components/flashflip/flashflip-app.test.tsx`, `paste-screen.test.tsx`, `score-screen.test.tsx` — update text and class assertions for the new look; every behaviour test still passes unchanged in intent.

**Acceptance Criteria:**
- Given a phone at 375px and a laptop, in light and dark mode, when each screen is shown, then it matches DESIGN.md and EXPERIENCE.md, and the Quiz matches `mockups/key-quiz.html`.
- Given reduced motion turned on, when the whole loop runs from paste to retry, then nothing animates and every step still works.
- Given a 320px-wide screen, when any view is shown, then the page does not scroll sideways.
- Given keyboard-only use, when every control is focused in turn, then each shows the grape focus ring in both themes.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Design Notes

The exit waits for the motion, then hands off; focus moves only when the next card mounts:

```tsx
function mark(result: 'knew' | 'missed') {
  if (exiting) return
  const reduce = !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduce) return onMark(result)
  setExiting(result)                      // drives animate-exit-right / -left
  window.setTimeout(() => onMark(result), EXIT_MS)
}
```

jsdom has no `matchMedia`, so existing tests take the instant path. Motion tests stub `matchMedia` and use fake timers.

## Verification

**Commands:**
- `npm test` — expected: all suites pass
- `npm run lint` — expected: 0 errors
- `npm run build` — expected: succeeds, and `/` is reported as static (`○`)

**Manual checks (if no CLI):**
- `npm run dev` at 320px, 375px and laptop width, in light and dark, with reduced motion off and on: walk the loop and compare the Quiz with `mockups/key-quiz.html`.

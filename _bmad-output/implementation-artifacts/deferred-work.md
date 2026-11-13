# Deferred work

## Deferred from: code review of 1-1-paste-cards-and-flip-quiz (2026-11-10)

- Scrollable region inside the flip `<button>`: keyboard users cannot scroll long Definitions (components/ui/flip-card.tsx:34).
- ScreenHeading focuses on every mount, and `[tabindex="-1"]:focus-visible { outline: none }` removes outlines app-wide.
- No paste or Card size limit; text is parsed twice (makeCards and useMemo); Skipped lines are rendered unwindowed. Belongs to Story 1.3.
- Parser Unicode edge cases (Story 1.3): zero-width characters, full-width colon, U+2212 and U+2015 as separators, NEL/U+2028 line breaks, `\n\r` counted as two breaks, 80-unit truncation can split a surrogate pair.
- Parser precedence quirks (Story 1.3): `- a: b` makes Card "- a"; `- a - b` splits at the second dash; `term:` reports no-separator; `- - -` yields a junk Card.
- Lint guardrail gaps: `createElement(..., { dangerouslySetInnerHTML })`, relative-path imports into core, `Math.random`/`Date` not banned in lib/core.
- `package.json` uses caret ranges where the manifest names exact versions; verify package-lock resolves to the manifest.
- Story 1.3 must restore the FR-4 whitespace collapse (runs of whitespace inside a Term or Definition become one space). The Story 1.1 review removed it because that story's spec said "trim" only.

## Deferred from: code review of 1-2-score-shuffle-and-keep-cards-after-refresh (2026-11-10)

- Two tabs overwrite each other's Saved state; no `storage` listener (lib/hooks/use-saved-state.ts).
- Reducer trusts its callers: `pass-started` does not validate the order is a permutation; `text-editing-started` is not guarded by screen (lib/core/session.ts). Unreachable from the UI today.
- The swipe drag transform ignores `prefers-reduced-motion` (components/screens/study-screen.tsx).
- A `study` state with no current Card renders Ready, where Start does nothing; unreachable through `parseSavedState` (components/flash-flip-app.tsx).
- Accessibility polish: textarea `dir="auto"`, `aria-invalid`/`aria-describedby` on the refusal, Mark buttons stay enabled after flipping back to the Term.
- No `<noscript>` message for the skeleton.
- Confetti: reduced-motion comment says "still accent" but the CSS hides the burst; fixed fall height can clip on short Result screens.
- Weak test assertions: substring `toHaveTextContent("t1")`, restore focus test does not assert the Card is unfocused, `cardsMade(1, 0)` pluralisation locked in.
- vitest `<dialog>` stub does not model focus trap or initial focus; verify in a real browser.

## Deferred from: code review of 1-3-bulletproof-paste (2026-11-10)

- Up to about 100,000 one-character Skipped lines can all render after "Show all N"; needs windowing and a product call (components/ui/skipped-lines.tsx).
- No `app/global-error.tsx`: errors in the root layout bypass "Start over".
- Lines of only U+200E, U+200F, U+2060 or U+200C are not blank under FR-2's whitespace set and show as empty Skipped lines (PRD question for the real-paste check).
- `\p{Dash}` also matches wave dashes and the fullwidth hyphen as Separators (PRD question).
- An inner U+200B becomes a space; no test, possible Thai impact (real-paste check).
- Near-limit pastes may exceed the localStorage quota; not exercised.
- The 60dvh scroll height and the 48 px key step are literals, not tokens or cited constants.


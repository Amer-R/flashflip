---
title: 'Paste and save cards'
type: 'feature'
ticket: '1'
created: '2026-10-28'
status: 'ready-for-dev'
baseline_revision: ''
route: 'full'
route_source: 'auto'
risk: 'medium'
review: ''
review_source: ''
lenses_ran: []
review_loop_iteration: 0
context: ['{project-root}/_bmad-output/initiative-flashflip-mvp/architecture-flashflip/architecture-flashflip.md']
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** FlashFlip is still the create-next-app placeholder. Students have no way to turn pasted `term - definition` lines into a deck that survives a reload.

**Approach:** Build the tracer path through every layer of the architecture: the pure core (types, parser, deck reducer), the localStorage adapter, the client root with `use(browser())`, and a phone-first paste screen on a static page. Add the test and lint setup, then deploy to Vercel production.

## Boundaries & Constraints

**Always:**
- Follow architecture AD-1 to AD-12 and its Consistency Conventions. Where story scope allows, use exactly the names, signatures and key (`flashflip:deck:v1`) given there.
- "No deck" is `null`, and only `deck-store.ts` touches `localStorage`.
- The paste screen's preview count, the skipped count and the deck that gets saved all come from the same `parseDeck` result.
- Tap targets are ≥ 44px. Base styles target the phone, and `sm:` and up enhances.
- **Decision (user, 2026-10-28):** In this story the button is labelled **Save deck**. It dispatches `replaceDeck`, persists the deck, and shows "Saved N cards". It stays disabled with 0 cards. Story 1.2 renames it to Start and adds the round.
- **Decision (user, 2026-10-28):** Keep the full plan (~2,000 tokens) as one story, since the tracer has to cover every layer.

**Never:**
- No quiz, flip, round, shuffle or score UI or logic. That is stories 1.2 and 1.3.
- No server code, env vars, cookies or `dangerouslySetInnerHTML`.
- No new runtime dependencies. Dev dependencies are limited to the architecture's Stack table.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Valid paste | `a - b`, `c - d - e` | 2 cards; the second has definition `d - e`; 0 skipped | None |
| Malformed lines | `a-b`, `x - `, ` - y`, `plain` | 0 cards, 4 skipped, Save deck disabled | None |
| Blank lines and CRLF | `a - b\r\n\r\nc - d` | 2 cards, 0 skipped | None |
| Reload with saved deck | valid key in storage | The textarea is pre-filled via `formatDeck`, and the counts match | None |
| Corrupt storage | invalid JSON, `version: 2`, `cards: []`, duplicate ids | Treated as no deck: an empty textarea | `loadDeck` returns `null` and never throws |
| Storage unavailable | `localStorage` throws | The page works for this visit; nothing is saved | Swallowed in `deck-store` |
| Clear deck | a deck is saved | The key is removed, the textarea is emptied, Save deck is disabled | None |

</frozen-after-approval>

## Code Map

- `app/page.tsx` — the scaffold placeholder, replaced entirely. Server Component: `export const ensureStatic = 'navigation'`, then `<Suspense fallback="Loading your deck…">` around `<FlashFlipApp/>`. Read `node_modules/next/dist/docs/01-app/02-guides/single-page-applications.md` ("Rendering components only in the browser") for `use(browser())`.
- `app/layout.tsx` — keep the fonts and structure. Change only `metadata` to title `FlashFlip` and a one-line description.
- `app/globals.css` — keep the Tailwind v4 `@import` and `@theme`. Leave it unchanged unless the screen needs a token.
- `next.config.ts` — do not change: `cacheComponents`, `partialPrefetching` and the turbopack CSS rule must stay.
- `eslint.config.mjs` — flat config. Add the AD-1 and AD-3 restriction blocks after `...nextTs`.
- `tsconfig.json` — `@/*` maps to `./*`, and `**/*.mts` is already included.
- `package.json` — add a `test` script, `engines.node >=22.12`, and the dev dependencies from the Stack table, including bumping `@types/node` to `^24`. No test setup exists yet.
- `public/*.svg` — scaffold assets that are no longer referenced. Leave them.

## Tasks & Acceptance

**Execution:**
- [ ] `package.json`, `package-lock.json` — `npm i -D vitest@5.0.5 vite@8.3.5 @vitejs/plugin-react@6.1.2 vite-tsconfig-paths@6.1.1 jsdom@30.1.3 @testing-library/react@16.3.3 @testing-library/dom@10.4.2 @types/node@^24`. Add `"test": "vitest run"` and `"engines": {"node": ">=22.12"}`. These pin the architecture's verified stack.
- [ ] `vitest.config.mts` — `plugins: [tsconfigPaths(), react()]`, `environment: 'jsdom'`. This makes `@/` resolve in tests.
- [ ] `lib/flashflip/types.ts` — `Card`, `Round`, `View`, `AppState` exactly as in AD-8 and AD-9. These are the shared types for all stories.
- [ ] `lib/flashflip/parse.ts` + `parse.test.ts` — `parseDeck` and `formatDeck` per AD-6. Tests cover every I/O row above plus the round-trip property.
- [ ] `lib/flashflip/reducer.ts` + `reducer.test.ts` — `initialState`, `flashflipReducer`, and an `Action` union containing `replaceDeck`, `clearDeck` and `goToPaste` with the AD-9 transitions. Stories 1.2 and 1.3 add `startRound` and `mark`.
- [ ] `lib/storage/deck-store.ts` + `deck-store.test.ts` — `loadDeck`, `saveDeck` and `clearDeck` per AD-3. Tests cover the corrupt, unavailable, empty and round-trip cases.
- [ ] `components/flashflip/flashflip-app.tsx` — `'use client'` root per AD-4 and AD-5: owns the `deckRevision` counter, persists from the payload, and renders `PasteScreen` while `view === 'paste'`.
- [ ] `components/flashflip/paste-screen.tsx` + `paste-screen.test.tsx` — `PasteScreenProps` per AD-11, with the `onStart` prop wired to the Save deck button. Label the textarea, show live counts ("4 cards · 1 skipped"), and add Save deck and Clear deck buttons plus a "Saved N cards" status. Test the counts, the disabled Save deck, and that Save deck calls `onStart` with the previewed cards.
- [ ] `app/page.tsx`, `app/layout.tsx` — as in the Code Map.
- [ ] `eslint.config.mjs` — `no-restricted-imports` for `lib/flashflip/**`, and `no-restricted-globals` for `localStorage` outside `lib/storage/deck-store.ts`.
- [ ] **HITL (user)** — create an empty GitHub repo and `git push -u origin main`. Import it in Vercel with the Next.js preset and Node.js 24.x, then share the production URL.

**Acceptance Criteria:**
- Given an empty browser, when the student pastes 5 lines with 1 malformed, then the page shows 4 cards and 1 skipped, and Save deck is enabled.
- Given a deck saved with Save deck, when the page is reloaded, then the textarea shows the same deck and the same counts.
- Given a saved deck, when new lines are pasted and Save deck is pressed, then a reload shows the new deck only.
- Given a saved deck, when Clear deck is pressed, then the textarea is empty, Save deck is disabled, and a reload shows no deck.
- Given the production Vercel URL on a phone-width screen, when the above is repeated, then it behaves the same, with no login prompt.

## Implementation Notes

## Plan Change Log

## Review Triage Log

## Design Notes

The root conforms to the screen, never the other way round (AD-11). The `onStart` handler (the Save deck button in this story) is the only place that persists:

```tsx
function handleStart(cards: Card[]) {
  if (cards.length === 0) return
  dispatch({ type: 'replaceDeck', cards })
  deckStore.saveDeck(cards)
  setDeckRevision(r => r + 1)
}
```

## Verification

**Commands:**
- `npm test` — expected: all suites pass
- `npm run lint` — expected: 0 errors. A test import of `react` inside `lib/flashflip/` must fail lint.
- `npm run build` — expected: succeeds, and `/` is reported as static (`○`)

**Manual checks (if no CLI):**
- Run `npm run dev` at a 375px viewport and walk through the acceptance criteria. Then repeat on the production URL after the HITL step.

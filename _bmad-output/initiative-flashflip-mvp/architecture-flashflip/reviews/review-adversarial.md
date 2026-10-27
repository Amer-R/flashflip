---
review-of: architecture-flashflip.md
lens: adversarial (two-builder incompatibility)
date: '2026-10-28'
verdict: 'Not yet build-safe: sound paradigm, but the root/core seam and the root/screen seam are under-specified'
---

# Adversarial Review: FlashFlip MVP Architecture Spine

## Verdict

The paradigm (functional core, single stateful root, single storage adapter, single parser) is right, and AD-3, AD-6 and AD-7 close the obvious holes well. But the spine pins the *leaves* (`Card`, `Round`, `parseDeck`, `shuffle`, storage key) and leaves the *seams* open: the reducer's state shape, the action payloads, who owns `view`, the screen prop contracts, and the empty-deck representation. Two builders can each obey AD-1 to AD-8 to the letter and still produce a core and a shell that do not type-check together, or that type-check but disagree at runtime about whether a deck exists, which screen is showing, and what the textarea holds.

Twelve findings below: 4 high, 5 medium, 3 low. Each has a two-builder construction and proposed rule text. The high ones should be closed before stories are cut.

Split used throughout:

- **Builder C (core):** `lib/flashflip/*` including `reducer.ts`, plus `lib/storage/deck-store.ts`.
- **Builder S (shell):** `components/flashflip/*` (root plus three screens).

Where a finding needs a different split, it says so.

---

## High

### F1. App state shape and `view` ownership are undefined (two owners of `view`)

**Construction.** AD-5 puts the reducer in core but no AD or convention defines its state type. `View` is declared in `types.ts`, but nothing says whether it is *stored* in state or *derived*.

- C writes `type AppState = { deck: Card[]; round: Round | null; view: View }`. `mark` sets `view = 'score'` when `index === order.length`, and `startRound` sets `view = 'quiz'`.
- S treats `View` as derived, since AD-8 already defines completion as `index === order.length`. It renders `round == null ? paste : isComplete(round) ? score : quiz`, and expects state `{ deck: Card[] | null; round: Round | null }`.

Both are AD-compliant. Now `goToPaste` in C sets `view = 'paste'` but keeps `round`, while S's derivation still sees a round and shows quiz or score. Equally, C's "New round" never clears `view`. The two units disagree on which screen is showing, and they do not compile together.

**Fix (new AD-9, State model):**
> `AppState` is defined and exported from `lib/flashflip/types.ts` as `{ deck: Card[] | null; round: Round | null; view: View }`. `view` is stored state. Only the reducer changes it, and the shell never derives the screen from `round`. Transitions: `startRound` sets `view = 'quiz'`. `mark` that completes the round sets `view = 'score'`. `goToPaste` sets `view = 'paste'` and `round = null`. `replaceDeck` and `clearDeck` set `round = null` and `view = 'paste'`. The initial state comes from `initialState(deck: Card[] | null): AppState` in `lib/flashflip/reducer.ts`, which always returns `view = 'paste'`. The root's lazy initializer is exactly `() => initialState(loadDeck())`.

(Choosing *derived* view is equally valid. What matters is that the spine picks one.)

### F2. Action payloads are unspecified, so the reducer and the dispatchers do not type-check together

**Construction.** The conventions list action *names* only. AD-7 says `startRound` carries "the ordered ids" but gives no field name.

- C: `{ type: 'startRound'; ids: string[] }`, `{ type: 'mark'; result: 'knew' | 'missed' }`, `{ type: 'replaceDeck'; cards: Card[] }`.
- S: `{ type: 'startRound'; order: string[] }` (mirrors `Round.order`), `{ type: 'mark'; id: string; known: boolean }`, `{ type: 'replaceDeck'; text: string }`, with parsing inside the reducer. That is legal under AD-1, since parsing is still in core.

The last variant is the dangerous one. If `replaceDeck` carries text, the reducer parses, and the root cannot know which cards to `saveDeck` without parsing a second time. That breaks AD-5's "persist right after dispatching".

**Fix (tighten the Reducer actions convention into an AD, with the exact union):**
> `Action` in `lib/flashflip/reducer.ts` is exactly:
> `{ type: 'replaceDeck'; cards: Card[] } | { type: 'clearDeck' } | { type: 'startRound'; order: string[] } | { type: 'mark'; result: 'knew' | 'missed' } | { type: 'goToPaste' }`.
> Payloads carry already-parsed cards and already-shuffled ids. The reducer never parses and never calls `shuffle`. `mark` always applies to `order[index]`. The reducer stores `replaceDeck.cards` by reference and unchanged, so what the root saves is exactly what state holds. No other action types exist.

### F3. "No deck" has three possible representations, across state, storage and the parser

**Construction.** `loadDeck()` returns `Card[] | null`, and `parseDeck` can return `cards: []`. Nothing says whether an empty deck is `null` or `[]`, or whether `saveDeck([])` is legal.

- C's `deck-store` shape check accepts `{version:1, cards:[]}` and returns `[]`. C's reducer handles `clearDeck` by setting `deck: []`.
- S's root handles `clearDeck` by calling `saveDeck([])`, which is legal because the signature allows it, instead of `clearDeck()`. It decides "has a saved deck" with `deck !== null`.

After Clear, reload: storage holds `[]`, `loadDeck` returns `[]`, S thinks a deck exists and pre-fills nothing, while the Start guard "≥1 card" and S's "deck present" check disagree. A third builder checking `deck?.length` behaves differently again.

**Fix (tighten AD-3, and reference it from AD-9):**
> "No deck" is `null` everywhere: in `AppState.deck`, from `loadDeck()`, and as the result of `clearDeck`. A deck is never an empty array. `saveDeck` requires `cards.length >= 1`. Callers guarantee this, and `saveDeck([])` is a no-op. The shell clears with `deck-store.clearDeck()`, which removes the key. `loadDeck`'s shape check returns `null` unless `cards` is a non-empty array of objects whose `id`, `term` and `definition` are non-empty strings and whose `id`s are unique. `replaceDeck` is only dispatched with ≥1 card.

### F4. Retry and New round composition: the shell must compute "missed ids" with no core function to call

**Construction.** AD-7 makes the shell shuffle and then dispatch `startRound(order)`. For Retry, the shell first needs the missed ids. AD-1 says components never re-implement round rules, but core exports no `missedIds`. AD-8 says retry is "offered only when at least one is missed", but not who decides.

- S writes `Object.entries(round.results).filter(([,r]) => r === 'missed').map(([id]) => id)` in `flashflip-app.tsx`. That re-implements a round rule, and is arguably an AD-1 violation, but there is nothing else to call.
- C exports `retryOrder(round)` from `round.ts`, which shuffles internally with `Math.random`. That is legal under AD-7 ("called only when a round is created") but impure relative to AD-7's intent.
- The score-screen builder computes "any missed" as `knew < total`, while the root computes it from `results`. These diverge if `results` ever holds ids that are not in `order`, or if the score screen renders mid-round.

**Fix (extend AD-8):**
> `lib/flashflip/round.ts` exports `missedIds(round: Round): string[]`, which returns ids from `round.order` whose result is `'missed'`, in `order` order, and `canRetry(round): boolean` (`missedIds(round).length > 0`). Retry is exactly `dispatch({ type: 'startRound', order: shuffle(missedIds(round)) })`. New round is exactly `dispatch({ type: 'startRound', order: shuffle(deck.map(c => c.id)) })`. Both are built only in `flashflip-app.tsx`. No function in core calls `shuffle` with its default `rng`. Screens receive `canRetry` as a boolean prop and never inspect `results`.

---

## Medium

### F5. Screen prop contracts are open: paste-screen `onStart(text)` vs `onStart(cards)`

**Construction (split: Builder P does paste-screen, Builder R does the root).** The diagram lets screens import core, so both can call `parseDeck`.

- P runs `parseDeck` for the live preview and calls `onStart(result.cards)`.
- R expects `onStart(text: string)` and parses again in the root.

Both obey AD-6, since there is one parser implementation. They still don't connect, and if they were patched together ad hoc, the preview and the saved deck would come from two separate parse calls on possibly different text (for example, trimmed vs untrimmed state).

**Fix (new convention row or AD, Screen contracts):**
> Each screen's props interface is exported from its own file, and the root conforms to it:
> `PasteScreenProps = { deck: Card[] | null; onStart(cards: Card[]): void; onClear(): void }`. The paste screen calls `parseDeck` for both preview and start, and passes the same `cards` it previewed.
> `QuizScreenProps = { card: Card; position: number; total: number; onMark(result: 'knew' | 'missed'): void }`.
> `ScoreScreenProps = { knew: number; total: number; canRetry: boolean; onRetry(): void; onNewRound(): void; onEditDeck(): void }`.
> Screens never receive `dispatch` or the raw `AppState`.

### F6. Textarea text has two owners and the pre-fill format is unowned

**Construction.** AD-5 makes textarea contents ephemeral screen state. The state diagram says a saved deck is "pre-filled". But storage holds `Card[]`, not text, and no AD defines `Card[] → text`.

- P writes `` cards.map(c => `${c.term} - ${c.definition}`).join('\n') `` inline in the screen. That is format logic in a component (AD-1, AD-6 smell).
- C adds `formatDeck` with `' — '` or a trailing newline.
- After **Clear deck**, the root sets `deck = null`, but P's `useState(initialText)` keeps the old text. The screen shows a full textarea and a "no deck" state at once. **Edit deck** from score remounts and re-seeds, while Clear does not. The two paths behave differently.

**Fix (extend AD-6, plus a rule in AD-5):**
> `formatDeck(cards: Card[]): string` in `lib/flashflip/parse.ts` is the sole inverse of `parseDeck`: `term + ' - ' + definition` joined with `'\n'`, no trailing newline, so `parseDeck(formatDeck(c)).cards` deep-equals `c`. A unit test enforces this. The paste screen seeds its textarea only from `formatDeck(props.deck ?? [])` at mount. The root renders `<PasteScreen key={deckRevision} …/>`, where `deckRevision` increments on `replaceDeck` and `clearDeck`, so the textarea is re-seeded exactly when the deck changes.

(Alternatively, `onClear` empties the textarea inside the screen. Either way the spine must say which.)

### F7. Persist-after-dispatch can diverge from state when the reducer rejects or transforms

**Construction.** AD-5 says the root "persists right after dispatching a deck-replacing action". `dispatch` doesn't return the new state, so the root saves from the action payload.

- C's reducer ignores `replaceDeck` with 0 cards, or with duplicate ids (defensive and legal), or re-ids the cards.
- S's root unconditionally calls `saveDeck(action.cards)`.

Storage and state now differ. The next reload shows a deck the user never saw accepted.

**Fix (tighten AD-5):**
> The root persists from the action payload, never from state. It dispatches `replaceDeck` only after checking `cards.length >= 1`, and then calls `saveDeck(cards)` with the identical array. The reducer accepts every `replaceDeck` it receives without filtering or transforming (see F2). On `clearDeck` the root calls `deck-store.clearDeck()`. No other action triggers a storage call.

### F8. Start = `replaceDeck` and then `startRound`: order, ids and the stale closure

**Construction.** Start on the paste screen must both replace the deck and start a round. Nothing says whether that is two dispatches or one action, or where the round ids come from.

- S dispatches `replaceDeck(cards)` and then `startRound(shuffle(state.deck.map(c => c.id)))`. `state.deck` is the *pre-dispatch* closure, so the round is built from the old deck. Ids are positional (`c0…`), so they often overlap and the bug is silent: the round shows new cards by old ids, and the count may be wrong.
- C assumes `startRound.order` ids are always present in `deck` and doesn't check them.

**Fix (add to AD-7 or AD-9):**
> Start from the paste screen is exactly two dispatches, in order: `replaceDeck({ cards })`, then `startRound({ order: shuffle(cards.map(c => c.id)) })`, where both use the `cards` passed to `onStart` and never `state.deck`. The reducer handles `startRound` by setting `round = { order, index: 0, results: {} }` and `view = 'quiz'`. It ignores the action if `deck` is `null`, if `order` is empty, or if any id is not in `deck`.

### F9. `mark` past the end, and double-tap

**Construction.** Quiz builder S fires `onMark` on click without disabling. A double-tap on the last card sends two `mark`s. C's reducer writes `results[order[index]]` with `index === order.length`, which stores `results[undefined]`, and increments `index` to `length + 1`. AD-8's `index === order.length` completion check is now false forever, and with derived view (F1) the quiz screen renders `order[length+1]`, which is undefined.

**Fix (extend AD-8):**
> `mark` is a no-op when `round` is `null` or `round.index >= round.order.length`. `index` never exceeds `order.length`. `results` only ever has keys from `order`.

---

## Low

### F10. Name collision: the `clearDeck` action vs `deck-store.clearDeck()`

Both live in the root's scope. One builder imports `{ clearDeck } from '@/lib/storage/deck-store'`, and another writes an action creator `clearDeck()` in core. A shadowed import silently calls the wrong one: it dispatches nothing, or it wipes storage without touching state.

**Fix:**
> Core exports no action-creator functions. Actions are object literals. The root imports storage as a namespace: `import * as deckStore from '@/lib/storage/deck-store'`.

### F11. Card ids are positional, and their uniqueness scope is implicit

`c0…` ids are reassigned on every parse. That is fine today because rounds never outlive a deck (`replaceDeck` clears `round`, per F1). But a builder who keeps `round` across `replaceDeck` (nothing forbids it today) would score new cards against old results. F1's transition rule closes this. State it explicitly:

> Card ids are unique only within one deck and are meaningless across decks. Any action that replaces or clears the deck discards the current round.

### F12. The score screen's `total` source

`scoreOf` returns `{ knew, total }`. A score-screen builder that renders `deck.length` as the denominator, rather than `total`, is wrong for retry rounds (`3 / 10` instead of `3 / 4`). F5's `ScoreScreenProps` closes this by passing only `knew` and `total` from `scoreOf(round)`. Add to AD-8:

> The rendered score is always `scoreOf(round)` of the round just completed, never `deck.length`.

---

## Checked and found closed

- **Storage key, shape and version:** AD-3 is sufficient. There is a single owner and a single key (shape-check strictness is tightened in F3).
- **Parser format and skipped count:** AD-6 is unambiguous. The preview and the save cannot disagree if F5 holds.
- **Shuffle algorithm and purity:** AD-7 is sufficient once F4 bans default-`rng` calls in core.
- **Hydration:** AD-4 gives one reader and one moment. F1's `initialState(loadDeck())` makes it concrete.
- **Score persistence:** AD-8 says rounds are never stored, and there is one derivation.

# FlashFlip

Paste your notes, get flashcards, flip through them and see your score. Everything stays in your browser: the app makes no network requests after it loads, sets no cookies and has no accounts.

## How to paste

One card per line, with a separator between the term and the definition:

```
mitosis - cell division
osmosis: water moving across a membrane
1. enzyme – a catalyst
```

Separators are a tab, a dash with spaces around it, or a colon followed by a space (a fullwidth colon `：` and a double em dash `——` also work). List markers such as `•`, `-` and `1.` are removed first. A line that cannot be read with confidence is listed as a skipped line with its line number and the reason; it is never dropped silently. Limits: 200,000 characters and 1,000 cards per deck.

## Run it

Needs Node 22.12 or newer.

```bash
npm install
npm run dev        # development server on http://localhost:3000
npm run build      # production build
npm run start      # serve the production build
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run test       # Vitest (parser, reducer, storage, screens)
```

The security headers (CSP with `connect-src 'none'`, `Referrer-Policy`, `Permissions-Policy`) are set for production builds only, so check privacy and console behaviour with `npm run build && npm run start`, not `npm run dev`.

## Where your deck lives

The deck, your progress and the Shuffle setting are saved in this browser's `localStorage` (one key, `flashflip:saved-state`) on this device only. Clearing the browser's site data deletes it, and on iPhone Safari it can also be deleted after about a week without opening the site unless the site is added to the Home Screen. If the browser blocks saving, the app keeps working and shows a notice.

## Deploy

FlashFlip is a static Next.js site: no functions, no environment variables and no secrets, so it deploys to Vercel as static output. The first-deploy route (Vercel CLI or a Git import) is chosen at deploy time. Before a release, run through `docs/manual-checklist.md` on a production build.

## Project docs

- `docs/design-sheet.md`: approved design tokens, motion and tone.
- `docs/manual-checklist.md`: checks that need a production build or a real device.
- `docs/real-pastes.md`: real pastes checked against the parser rules.
- `_bmad-output/`: planning artifacts and story records.

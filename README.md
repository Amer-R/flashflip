# FlashFlip

Paste your notes, get flashcards, flip through them and see your score. Everything stays in your browser: the app makes no network requests after it loads, sets no cookies and has no accounts.

**Live demo:** <https://flashflip-three.vercel.app>

This repository is the companion to the talk **"AI Can Build It"**. This branch (`engineered`) is the **complete, finished app**: planned with the [BMAD Method](https://docs.bmad-method.org/), built story by story and tested. After you have explored it, compare it with the [vibe-coded version](#compare-with-the-vibe-coded-version).

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

## What to look at in this branch

- `_bmad-output/planning-artifacts/`: the brief, PRD, architecture and epics that came **before** any code.
- `_bmad-output/implementation-artifacts/`: one record per story, showing how each was built and checked.
- `lib/core/`: the paste parser, scoring, shuffle and saved-state logic, with a test file next to each module.
- `docs/`: design tokens, a manual test checklist and real pastes the parser was checked against.
- `.agents/` and `_bmad/`: the BMAD skills and config the AI team ran on. You do not need to edit these, they are there so you can see how the "team" was set up.

## Compare with the vibe-coded version

The same product was first built with one prompt and no review. Seeing both is the point of the exercise.

| | Vibe-coded ([`show-vibe`](../../tree/show-vibe)) | Engineered (this branch) |
|---|---|---|
| How | One prompt, output not reviewed | Brief, PRD, architecture, stories, then tests |
| Paste parser | A short list of separator patterns, no input limits | Documented rules, input limits, every unreadable line listed with its reason |
| Tests | None | Vitest for the parser, reducer, storage and screens |
| Privacy and security | No explicit policy | No network calls after load, strict CSP, no cookies, no accounts |

| Branch | What it is |
|---|---|
| `engineered` (default) | The finished, tested app with planning docs |
| [`show-vibe`](../../tree/show-vibe) | The vibe-coded app as first generated |
| [`main`](../../tree/main) | The vibe-coded app plus the interactive talk deck (`AI Can Build It.html`) |
| [`demo-done`](../../tree/demo-done) | Working branch this version was merged from |

Compare them with `git diff show-vibe..engineered --stat` or GitHub's compare view.

## Exercises

1. Paste messy notes (mixed bullets, missing separators, very long lines) into both versions. What differs, and why?
2. Read the PRD, then find where in the code each requirement is met.
3. Add a feature to the vibe version with one prompt, then add the same feature to the engineered version through a story. Compare the effort and the result.

## Contributing and feedback

This is a teaching repo. Questions and suggestions are welcome through [issues](../../issues).

## License

[MIT](LICENSE). Use it, change it, teach with it.

Made with ❤ by [Amer Radwan](https://www.linkedin.com/in/amerradwan/).

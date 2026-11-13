# FlashFlip

**Paste your notes, get flashcards, flip through them and see your score.**
A small Next.js app built twice on purpose, to show the difference between *vibe coding* and *AI engineering*.

**Live demo:** <https://flashflip-three.vercel.app> (the engineered version)

> **Start with the complete app:** the [`engineered`](../../tree/engineered) branch is the finished, tested demo and the repository default. This `main` branch holds the vibe-coded version and the talk deck, to explore afterwards.

This repository is the companion to the talk **"AI Can Build It"**. It is meant for students to read, run, compare and learn from.

## The idea

The same product, FlashFlip, was built two ways with AI:

| | Vibe-coded | Engineered |
|---|---|---|
| How | One prompt, output not reviewed | Brief, PRD, architecture, stories, then tests, with the [BMAD Method](https://docs.bmad-method.org/) |
| Paste parser | A short list of separator patterns, no input limits | Documented rules, input limits, and every unreadable line listed with its line number and reason |
| Tests | None | Vitest for the parser, reducer, storage and screens |
| Privacy and security | No explicit policy | No network calls after load, strict CSP, no cookies, no accounts |
| Branch | [`show-vibe`](../../tree/show-vibe) | [`engineered`](../../tree/engineered) (final polish on [`demo-done`](../../tree/demo-done)) |

Reading the two side by side is the point of the exercise: the vibe version looks fine in a demo, and the engineered version is the one you could safely put in front of users.

## Branches

| Branch | What it is | Start here if you want to... |
|---|---|---|
| `main` (this one) | The vibe-coded app plus the interactive talk deck | open the deck, or see the vibe version |
| [`show-vibe`](../../tree/show-vibe) | The vibe-coded app as first generated | study the "one prompt" result |
| [`engineered`](../../tree/engineered) (default) | The finished, tested app with planning docs | **start here** and study the engineered result |
| [`demo-done`](../../tree/demo-done) | Working branch the engineered version was merged from | follow the story-by-story history |

To compare them: `git diff main..engineered --stat`, or use GitHub's compare view at `/compare/main...engineered`.

## The interactive talk deck

`deck/index.html` is a self-contained slide deck. Open it in a browser, no server needed. It needs an internet connection for the QR-code library.

## Run it yourself

You need [Node.js](https://nodejs.org/) 22.12 or newer.

```bash
git clone https://github.com/Amer-R/flashflip.git
cd flashflip
npm install
npm run dev        # http://localhost:3000
```

To try the engineered version, switch branch first and use its extra scripts:

```bash
git switch engineered
npm install
npm run dev
npm run test       # Vitest
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
```

Paste format (engineered version): one card per line, with a tab, ` - `, or `: ` between the term and the definition.

```
mitosis - cell division
osmosis: water moving across a membrane
```

## What to look at in the engineered branch

- `_bmad-output/planning-artifacts/`: the brief, PRD, architecture and epics that came **before** any code.
- `_bmad-output/implementation-artifacts/`: one record per story, showing how each was built and checked.
- `lib/core/`: the paste parser, scoring, shuffle and saved-state logic, with a test file next to each module.
- `docs/`: design tokens, a manual test checklist and real pastes the parser was checked against.
- `.agents/` and `_bmad/`: the BMAD skills and config the AI team ran on. You do not need to edit these, they are there so you can see how the "team" was set up.

## Exercises

1. Paste messy notes (mixed bullets, missing separators, very long lines) into both versions. What differs, and why?
2. Read the PRD, then find where in the code each requirement is met.
3. Add a feature to the vibe version with one prompt, then add the same feature to the engineered version through a story. Compare the effort and the result.

## Contributing and feedback

This is a teaching repo. Questions and suggestions are welcome through [issues](../../issues).

## License

[MIT](LICENSE). Use it, change it, teach with it.

Made with ❤ by [Amer Radwan](https://www.linkedin.com/in/amerradwan/).

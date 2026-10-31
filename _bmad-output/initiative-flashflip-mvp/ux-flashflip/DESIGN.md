---
name: FlashFlip
description: Playful sticker-style flashcards for first-year students revising on their phones. Bright, chunky and friendly, never childish.
status: final
created: '2026-10-31'
updated: '2026-10-31'
colors:
  canvas: '#FFF7EC'
  card: '#FFFFFF'
  ink: '#1F1A33'
  ink-soft: '#5A5373'
  grape: '#6B3FD4'
  knew: '#13804A'
  missed: '#C8304F'
  sun: '#FFD23F'
  mint-soft: '#C9F5DD'
  sun-soft: '#FFF0B3'
  on-solid: '#FFFFFF'
  canvas-dark: '#17122B'
  card-dark: '#241C40'
  ink-dark: '#F6F1FF'
  ink-soft-dark: '#B8AED6'
  grape-dark: '#A98BFF'
  knew-dark: '#4FD98F'
  missed-dark: '#FF7A93'
  sun-dark: '#FFD23F'
  mint-soft-dark: '#14432F'
  sun-soft-dark: '#4A3B0C'
  on-solid-dark: '#17122B'
typography:
  display:
    fontFamily: 'Fredoka, system-ui, sans-serif'
    fontSize: 2.25rem
    fontWeight: 600
    lineHeight: 1.1
  score:
    fontFamily: 'Fredoka, system-ui, sans-serif'
    fontSize: 4rem
    fontWeight: 700
    lineHeight: 1
  card-term:
    fontFamily: 'Fredoka, system-ui, sans-serif'
    fontSize: 2rem
    fontWeight: 600
    lineHeight: 1.15
  card-definition:
    fontFamily: 'Geist Sans, system-ui, sans-serif'
    fontSize: 1.25rem
    fontWeight: 400
    lineHeight: 1.5
  button:
    fontFamily: 'Fredoka, system-ui, sans-serif'
    fontSize: 1.125rem
    fontWeight: 600
    lineHeight: 1
  body:
    fontFamily: 'Geist Sans, system-ui, sans-serif'
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: 'Geist Sans, system-ui, sans-serif'
    fontSize: 0.875rem
    fontWeight: 500
    lineHeight: 1.4
  input:
    fontFamily: 'Geist Mono, ui-monospace, monospace'
    fontSize: 1rem
    lineHeight: 1.5
rounded:
  sm: 12px
  md: 20px
  lg: 28px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 24px
  '6': 32px
  '8': 48px
  outline: 2px
  shadow-offset: 4px
  shadow-offset-pressed: 1px
components:
  card:
    background: '{colors.card}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.lg}'
    shadow: '{spacing.shadow-offset} {spacing.shadow-offset} 0 {colors.ink}'
  button-primary:
    background: '{colors.grape}'
    text: '{colors.on-solid}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.full}'
    shadow: '{spacing.shadow-offset} {spacing.shadow-offset} 0 {colors.ink}'
    min-height: 48px
  button-knew:
    background: '{colors.knew}'
    text: '{colors.on-solid}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.full}'
    shadow: '{spacing.shadow-offset} {spacing.shadow-offset} 0 {colors.ink}'
    min-height: 56px
  button-missed:
    background: '{colors.missed}'
    text: '{colors.on-solid}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.full}'
    shadow: '{spacing.shadow-offset} {spacing.shadow-offset} 0 {colors.ink}'
    min-height: 56px
  button-secondary:
    background: '{colors.card}'
    text: '{colors.ink}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.full}'
    shadow: '{spacing.shadow-offset} {spacing.shadow-offset} 0 {colors.ink}'
    min-height: 48px
  chip-cards:
    background: '{colors.mint-soft}'
    text: '{colors.ink}'
    radius: '{rounded.full}'
  chip-skipped:
    background: '{colors.sun-soft}'
    text: '{colors.ink}'
    radius: '{rounded.full}'
  progress-bar:
    track: '{colors.card}'
    fill: '{colors.grape}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.full}'
    height: 12px
  textarea:
    background: '{colors.card}'
    text: '{colors.ink}'
    outline: '{spacing.outline} solid {colors.ink}'
    radius: '{rounded.md}'
---

## Brand & Style

Visual reference: [mockups/key-quiz.html](mockups/key-quiz.html) shows the Quiz surface in light and dark, term and definition faces. This spine wins on any conflict with the mock.


FlashFlip should feel like a deck of stickers a student made themselves: bright, chunky, a little bouncy, and clearly theirs. The feeling the user asked for is **playful**. The look is a soft take on the "sticker" style: thick dark outlines, solid fills, hard offset shadows with no blur, generous rounded corners, and one cheerful moment of motion per action. It stays readable at a glance on a phone held in one hand, and grown-up enough that a first-year student isn't embarrassed to open it in a lecture hall.

Playful lives in shape, motion and a few words of copy, never in clutter. Each screen still has one obvious next action.

## Colors

A warm canvas with four solid accents. Every accent has a job, and colour is never the only signal: Knew it and Missed it always carry their labels.

- **Canvas (`{colors.canvas}` / `{colors.canvas-dark}`)** is the page background: a warm cream in light mode and a deep plum-ink in dark mode. Never pure white or pure black.
- **Card (`{colors.card}` / `{colors.card-dark}`)** is the surface of every sticker: the flashcard, the textarea, secondary buttons and the progress track.
- **Ink (`{colors.ink}` / `{colors.ink-dark}`)** is body text and, in light mode, every outline and shadow. In dark mode, an ink-coloured outline would vanish on the dark canvas, so outlines and offset shadows switch to `{colors.grape-dark}`.
- **Ink soft (`{colors.ink-soft}` / `{colors.ink-soft-dark}`)** is hints, "Card N of M", captions and the status line.
- **Grape (`{colors.grape}` / `{colors.grape-dark}`)** is the brand colour: Start, Retry missed (or New round when there is nothing to retry), and the progress fill.
- **Knew (`{colors.knew}` / `{colors.knew-dark}`)** is used only for the Knew it button and the known count on the score screen.
- **Missed (`{colors.missed}` / `{colors.missed-dark}`)** is used only for the Missed it button. It is never used for errors: FlashFlip has no error UI beyond the skipped count.
- **Sun (`{colors.sun}`)** is decoration only: confetti pieces and the full-marks burst. It is never a text colour on the canvas.
- **Mint soft and Sun soft** are the fills of the cards chip and the skipped chip on the paste screen.
- **On-solid (`{colors.on-solid}` / `{colors.on-solid-dark}`)** is the text on Grape, Knew and Missed fills. It is white in light mode and plum-ink in dark mode.

Contrast (WCAG AA, checked): every text pair is at least 4.5:1. The lowest are white on Knew (4.98:1) and white on Missed (5.26:1); ink-soft on the canvas is 6.77:1. In dark mode every pair is at least 6.7:1.

## Typography

Two families. **Fredoka** (rounded, friendly) sets anything that should feel playful: the page title (`{typography.display}`), the term face of the card (`{typography.card-term}`), the score (`{typography.score}`) and every button label (`{typography.button}`). Fredoka loads with `next/font/google`, which is built into Next and adds no npm dependency. **Geist Sans** stays for reading: the definition face (`{typography.card-definition}`), body text and meta lines. The textarea keeps **Geist Mono** (`{typography.input}`), so the `term - definition` lines line up.

Sizes are the phone values; `sm:` and up may step the display and score sizes up one notch. No all-caps, no letter-spaced labels.

## Layout & Spacing

Scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 px (`{spacing.1}` to `{spacing.8}`). The page is a single centred column, at most 36rem wide, with a 16px side margin on phones and 32px from `sm:`. Screens stack their parts with `{spacing.5}` between groups and `{spacing.3}` inside a group.

On the quiz screen the card takes the remaining height above the mark buttons, so one card fills the screen and the buttons sit within thumb reach at the bottom. On the score screen the score is centred in the upper half and the actions stack below.

## Elevation & Depth

There is one depth language: a **hard offset shadow** (`{spacing.shadow-offset}` right and down, no blur, in `{colors.ink}`). It marks things you can touch or that are "on the table": the card, the textarea and every button. Pressed buttons drop to `{spacing.shadow-offset-pressed}` and move down and right by the difference, so they look pushed in. Nothing uses blurred shadows, gradients or glassmorphism.

Text, chips, the status line and "Card N of M" sit flat on the canvas.

## Shapes

Big, soft corners give the playful tone: the flashcard uses `{rounded.lg}`, the textarea `{rounded.md}`, small surfaces `{rounded.sm}`, and every button, chip and the progress bar is a full pill (`{rounded.full}`). Every sticker shape has the `{spacing.outline}` ink outline. Outline, radius and shadow always travel together: a surface never has a shadow without the outline.

## Components

- **Card (flashcard)**: `{components.card}`. The term face is centred `{typography.card-term}` in `{colors.ink}`; the definition face is centred `{typography.card-definition}`. The definition face swaps its background to `{colors.sun-soft}` (`{colors.sun-soft-dark}`) so it is visibly "the back". A small "Tap to flip" hint in `{typography.meta}` sits under the card on the term face only.
- **Start (button-primary)**: `{components.button-primary}`, full width on phones. Disabled: `{colors.card}` fill, `{colors.ink-soft}` text, a dashed outline and no shadow.
- **Knew it / Missed it**: `{components.button-knew}` and `{components.button-missed}`, side by side in a two-column grid, 56px tall, with Missed it on the left and Knew it on the right. A small icon sits before each label, always with the label: ↺ on Missed it and ✓ on Knew it. Both carry the offset shadow like every other button.
- **Secondary buttons** (Clear deck, New round, Edit deck): `{components.button-secondary}`.
- **Count chips**: `{components.chip-cards}` ("4 cards") and `{components.chip-skipped}` ("1 skipped"). The skipped chip is shown only when the skipped count is above 0.
- **Textarea**: `{components.textarea}` with the offset shadow and a `{colors.grape}` focus outline that replaces the ink outline.
- **Progress bar**: `{components.progress-bar}`, above the card. Its fill width is `(position - 1) / total` while the card is showing and grows to the next step on mark.
- **Score**: the `N / M` score in `{typography.score}`. The known count N uses `{colors.knew}` and the slash and total use `{colors.ink}`. The band message sits above it in `{typography.display}`.
- **Confetti**: about 24 small rounded squares and circles in `{colors.sun}`, `{colors.grape}`, `{colors.knew}` and `{colors.missed}`. They fall once, for about 1.2s, behind the score on full marks only. CSS only.
- **Focus ring**: a 3px outline with a 3px offset on every focusable element: `{colors.grape}` in light mode and `{colors.grape-dark}` in dark mode, where the darker grape would not show.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Pair outline, radius and hard shadow on every touchable surface | Blurred shadows, gradients or glass effects |
| Keep Knew and Missed colours for those two buttons (and the known count) | Use Missed red for errors or warnings |
| Always show the label next to the colour or icon | Rely on green and red alone to say which button is which |
| One playful motion per action, inside `motion-safe:` | Looping or idle animations, or motion that delays the next card |
| Use Fredoka for buttons, terms, title and score only | Set definitions or long text in Fredoka |
| Keep Sun as decoration | Put text in Sun on the canvas |

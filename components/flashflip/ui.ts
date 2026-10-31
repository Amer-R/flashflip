/** DESIGN.md sticker button styles shared by the paste, quiz and score screens. */

// Outline, radius and hard shadow always travel together. While held, the button drops into its
// shadow: 4px -> 1px, moving 3px down and right. Instant, not animated.
const base =
  'inline-flex items-center justify-center gap-2 rounded-full border-2 border-line px-6 font-display text-lg leading-none font-semibold shadow-sticker cursor-pointer enabled:active:translate-x-[3px] enabled:active:translate-y-[3px] enabled:active:shadow-sticker-pressed disabled:cursor-not-allowed disabled:border-dashed disabled:border-ink-soft disabled:text-ink-soft disabled:shadow-none'

/** 48px grape button: Start, Retry missed, or New round when there is nothing to retry. */
export const buttonPrimary = `${base} min-h-12 bg-grape text-on-solid disabled:bg-card`

/** 48px card-coloured button: Clear deck, New round, Edit deck. */
export const buttonSecondary = `${base} min-h-12 bg-card text-ink`

/** 56px mark buttons. */
export const buttonKnew = `${base} min-h-14 px-4 bg-knew text-on-solid`
export const buttonMissed = `${base} min-h-14 px-4 bg-missed text-on-solid`

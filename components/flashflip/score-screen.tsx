'use client'

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { buttonPrimary, buttonSecondary } from './ui'

export type ScoreScreenProps = {
  knew: number
  total: number
  canRetry: boolean
  onRetry(): void
  onNewRound(): void
  onEditDeck(): void
}

/** The band message for a score (EXPERIENCE.md → Voice and Tone). */
export function bandMessage(knew: number, total: number) {
  if (total > 0 && knew === total) return 'Perfect round!'
  if (total > 0 && knew / total >= 0.7) return 'Nice work'
  return 'Keep going — retry the ones you missed'
}

const CONFETTI_COLORS = ['bg-sun', 'bg-grape', 'bg-knew', 'bg-missed']

// 24 pieces with fixed, spread-out positions (no randomness during render).
const CONFETTI = Array.from({ length: 24 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  shape: i % 3 === 0 ? 'rounded-full' : 'rounded-[3px]',
  style: {
    left: `${(i * 37 + 5) % 96}%`,
    animationDelay: `${(i * 53) % 300}ms`,
    '--fall': `${14 + ((i * 7) % 10)}rem`,
    '--spin': `${(i % 2 ? -1 : 1) * (200 + ((i * 41) % 320))}deg`,
  } as CSSProperties,
}))

/** One fall of CSS-only confetti behind the score. Hidden under reduced motion; removed once it ends. */
function Confetti() {
  const [done, setDone] = useState(false)
  if (done) return null
  return (
    <div
      aria-hidden="true"
      data-confetti
      className="pointer-events-none absolute inset-x-0 top-0 h-96 overflow-hidden motion-reduce:hidden"
    >
      {CONFETTI.map((piece, i) => (
        <span
          key={i}
          className={`absolute top-0 size-2.5 opacity-0 motion-safe:animate-confetti ${piece.color} ${piece.shape}`}
          style={piece.style}
          onAnimationEnd={i === CONFETTI.length - 1 ? () => setDone(true) : undefined}
        />
      ))}
    </div>
  )
}

/** End of a round: the score of the round just completed (AD-8) and the ways to go on (AD-7). */
export function ScoreScreen({ knew, total, canRetry, onRetry, onNewRound, onEditDeck }: ScoreScreenProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const perfect = total > 0 && knew === total

  // Focus the score heading on mount so screen readers read the band message and the score.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <section aria-label="Score" className="relative flex flex-col gap-6 pt-6 sm:pt-10">
      {perfect && <Confetti />}
      <h2
        ref={headingRef}
        tabIndex={-1}
        className="relative flex flex-col items-center gap-3 text-center focus:outline-none"
      >
        <span className="font-display text-[2.25rem] leading-[1.1] font-semibold sm:text-5xl">
          {bandMessage(knew, total)}
        </span>
        <span data-score className="font-display text-[4rem] leading-none font-bold tabular-nums sm:text-7xl">
          <span className="text-knew">{knew}</span> / {total}
        </span>
        <span className="text-base font-medium text-ink-soft">cards known</span>
      </h2>

      <div className="relative flex flex-col gap-3 sm:flex-row sm:justify-center">
        {canRetry && (
          <button type="button" onClick={onRetry} className={buttonPrimary}>
            Retry missed
          </button>
        )}
        <button type="button" onClick={onNewRound} className={canRetry ? buttonSecondary : buttonPrimary}>
          New round
        </button>
        <button type="button" onClick={onEditDeck} className={buttonSecondary}>
          Edit deck
        </button>
      </div>
    </section>
  )
}

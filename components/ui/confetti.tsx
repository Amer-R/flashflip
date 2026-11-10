// AD-10: a CSS-only burst. Decorative (aria-hidden), plays once when it mounts, and is
// hidden under prefers-reduced-motion (the Result headline carries a still accent instead).
const PIECES = 12;

export function Confetti() {
  return (
    <div className="confetti" aria-hidden="true" data-testid="confetti">
      {Array.from({ length: PIECES }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

// PAT-15: the single aria-live region; flips and messages announce through it.
// `seq` changes on every announcement so identical text is announced again.
export function LiveRegion({ message, seq }: { message: string; seq: number }) {
  return (
    <div role="status" aria-live="polite" className="sr-only">
      <span key={seq}>{message}</span>
    </div>
  );
}

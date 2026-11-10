import { copy } from "@/lib/copy";

// FR-12: shown on the Ready and Result screens only, never on Study.
export function ShuffleToggle({
  shuffle,
  onChange,
}: {
  shuffle: boolean;
  onChange: (shuffle: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={shuffle}
      onClick={() => onChange(!shuffle)}
      className="flex min-h-11 items-center gap-3 rounded-control border-2 border-border bg-surface px-6 py-2 font-semibold text-text"
    >
      <span>{copy.shuffle}</span>
      <span aria-hidden="true" className={shuffle ? "text-accent" : "text-text-muted"}>
        {shuffle ? copy.shuffleOn : copy.shuffleOff}
      </span>
    </button>
  );
}

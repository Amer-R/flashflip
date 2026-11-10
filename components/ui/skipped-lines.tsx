import { copy } from "@/lib/copy";
import type { SkippedLine } from "@/lib/core/types";

// FR-5 (basic): every Skipped line is listed. "Show all N" windowing is Story 1.3.
export function SkippedLines({ lines }: { lines: SkippedLine[] }) {
  if (lines.length === 0) return null;
  return (
    <section aria-labelledby="skipped-heading" className="mt-6">
      <h2 id="skipped-heading" className="font-semibold">
        {copy.skippedHeading}
      </h2>
      <ul className="mt-2 space-y-2 text-text-muted">
        {lines.map((line) => (
          <li key={line.lineNumber} className="wrap-anywhere">
            {copy.lineLabel(line.lineNumber)}{" "}
            <span dir="auto" className="text-text">
              {line.text}
            </span>{" "}
            ({copy.skipReason[line.reason]})
          </li>
        ))}
      </ul>
    </section>
  );
}

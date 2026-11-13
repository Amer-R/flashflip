"use client";

import { Button } from "@/components/ui/button";
import { copy } from "@/lib/copy";
import { SKIPPED_LINES_SHOWN } from "@/lib/core/limits";
import type { SkippedLine } from "@/lib/core/types";
import { useEffect, useRef, useState } from "react";

// FR-5, AD-9: the first SKIPPED_LINES_SHOWN Skipped lines are listed at once; "Show all N"
// reveals the rest, which render with `content-visibility: auto` (see .skipped-rest) so a
// very long list stays cheap. Every Skipped line stays listed, so none is dropped silently.
export function SkippedLines({ lines }: { lines: SkippedLine[] }) {
  // Remember which list was expanded, so a new list (a later refusal) starts collapsed.
  const [expandedList, setExpandedList] = useState<SkippedLine[] | null>(null);
  const firstRevealed = useRef<HTMLLIElement>(null);
  const showAll = expandedList === lines;

  useEffect(() => {
    // The button unmounts when pressed, so hand keyboard focus to the first revealed line.
    if (showAll) firstRevealed.current?.focus();
  }, [showAll]);

  if (lines.length === 0) return null;
  const hidden = lines.length > SKIPPED_LINES_SHOWN && !showAll;
  const visible = hidden ? lines.slice(0, SKIPPED_LINES_SHOWN) : lines;
  return (
    <section aria-labelledby="skipped-heading" className="mt-6">
      <h2 id="skipped-heading" className="font-semibold">
        {copy.skippedHeading}
      </h2>
      <ul className="mt-2 space-y-2 text-text-muted">
        {visible.map((line, index) => (
          <li
            key={line.lineNumber}
            ref={index === SKIPPED_LINES_SHOWN ? firstRevealed : undefined}
            tabIndex={index === SKIPPED_LINES_SHOWN ? -1 : undefined}
            className={`wrap-anywhere${index >= SKIPPED_LINES_SHOWN ? " skipped-rest" : ""}`}
          >
            {copy.lineLabel(line.lineNumber)}{" "}
            <span dir="auto" className="text-text">
              {line.text}
            </span>{" "}
            ({copy.skipReason[line.reason]})
          </li>
        ))}
      </ul>
      {hidden && (
        <div className="mt-3">
          <Button onClick={() => setExpandedList(lines)}>{copy.showAllSkipped(lines.length)}</Button>
        </div>
      )}
    </section>
  );
}

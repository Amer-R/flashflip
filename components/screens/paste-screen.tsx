"use client";

import { Button } from "@/components/ui/button";
import { ScreenHeading } from "@/components/ui/screen-heading";
import { SkippedLines } from "@/components/ui/skipped-lines";
import { copy } from "@/lib/copy";
import type { SkippedLine } from "@/lib/core/types";
import { useState } from "react";

// FR-1, FR-6 (partial). The draft is local so a Deck is kept until a later
// "Make cards" succeeds. It is a <textarea> outside a form: Enter inserts a line break.
export function PasteScreen({
  initialText,
  refusedSkippedLines,
  onMakeCards,
  onEdit,
  onBack,
}: {
  initialText: string;
  refusedSkippedLines: SkippedLine[] | null;
  onMakeCards: (text: string) => void;
  onEdit: () => void;
  onBack?: () => void; // present only while a Deck exists (FR-7)
}) {
  const [draft, setDraft] = useState(initialText);
  const empty = draft.trim() === "";

  return (
    <section className="screen-enter">
      <ScreenHeading>{copy.pasteHeading}</ScreenHeading>
      <label htmlFor="paste-box" className="mt-4 block font-semibold">
        {copy.pasteLabel}
      </label>
      <p id="paste-hint" className="text-text-muted">
        {copy.pasteHint}
      </p>
      <textarea
        id="paste-box"
        aria-describedby="paste-hint"
        value={draft}
        onChange={(event) => {
          setDraft(event.target.value);
          onEdit();
        }}
        rows={10}
        className="mt-2 w-full rounded-input border-2 border-border bg-surface p-4 text-text"
      />
      <div className="mt-4 flex flex-wrap gap-3">
        <Button variant="primary" disabled={empty} onClick={() => onMakeCards(draft)}>
          {copy.makeCards}
        </Button>
        {onBack && <Button onClick={onBack}>{copy.back}</Button>}
      </div>
      {refusedSkippedLines && (
        <div className="mt-6">
          <p data-testid="refusal" className="font-semibold text-missed">
            {copy.noCardsMade}
          </p>
          <SkippedLines lines={refusedSkippedLines} />
        </div>
      )}
    </section>
  );
}

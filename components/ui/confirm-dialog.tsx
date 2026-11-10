"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

// PAT-15, FR-11: a native <dialog> (never window.confirm). The cancel button comes first
// so it takes initial focus: the safe choice is the default.
export function ConfirmDialog({
  open,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const openRef = useRef(open);

  useEffect(() => {
    openRef.current = open;
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-message"
      onCancel={(event) => {
        // Escape: let our state close it, so declining changes nothing.
        event.preventDefault();
        onCancel();
      }}
      onClose={() => {
        // The browser closed it without our state (e.g. a close request that could not be
        // cancelled): sync back so "New deck" can open it again.
        if (openRef.current) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-card border-2 border-border bg-surface p-6 text-text backdrop:bg-black/60"
    >
      <p id="confirm-message" className="font-semibold">
        {message}
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="primary" autoFocus onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </dialog>
  );
}

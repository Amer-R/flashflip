import { copy } from "@/lib/copy";

// FR-15: visible, never collapsed, at least body-size text.
export function DeviceOnlyNotice() {
  return <p className="mt-8 text-text-muted">{copy.deviceOnlyNotice}</p>;
}

// FR-16: plain text, not a second live region (PAT-15).
export function SaveFailedNotice() {
  return (
    <p className="mb-4 rounded-input border-2 border-missed bg-surface p-3 font-semibold text-missed">
      {copy.saveFailed}
    </p>
  );
}

import type { Result } from "@/lib/core/result";

// PAT-11: the only code that touches localStorage. AD-5: this adapter is the only place
// that catches exceptions (storage blocked, unavailable or full) and turns them into results.
export const SAVED_STATE_KEY = "flashflip:saved-state";

export type StorageFailure = { reason: "storage-unavailable" };
const unavailable = { ok: false, reason: "storage-unavailable" } as const;

// `value` is null when nothing is stored.
export function readSavedState(): Result<string | null, StorageFailure> {
  try {
    return { ok: true, value: window.localStorage.getItem(SAVED_STATE_KEY) };
  } catch {
    return unavailable;
  }
}

export function writeSavedState(json: string): Result<null, StorageFailure> {
  try {
    window.localStorage.setItem(SAVED_STATE_KEY, json);
    return { ok: true, value: null };
  } catch {
    return unavailable;
  }
}

export function removeSavedState(): Result<null, StorageFailure> {
  try {
    window.localStorage.removeItem(SAVED_STATE_KEY);
    return { ok: true, value: null };
  } catch {
    return unavailable;
  }
}

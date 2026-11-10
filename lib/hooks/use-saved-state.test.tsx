import { initialState, type SessionState } from "@/lib/core/session";
import { useSavedState } from "@/lib/hooks/use-saved-state";
import { SAVED_STATE_KEY } from "@/lib/storage/local-storage";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const deck: SessionState = { screen: "ready", pasteText: "a - b", shuffle: false, order: [], marks: [] };

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("FR-14 useSavedState", () => {
  it("FR-14 writes the Saved state after the state changes", () => {
    const { rerender } = renderHook(({ state }) => useSavedState(state), { initialProps: { state: deck } });
    expect(JSON.parse(window.localStorage.getItem(SAVED_STATE_KEY)!)).toMatchObject({ pasteText: "a - b", screen: "ready" });
    rerender({ state: { ...deck, shuffle: true } });
    expect(JSON.parse(window.localStorage.getItem(SAVED_STATE_KEY)!)).toMatchObject({ shuffle: true });
  });

  it("FR-14 removes the key when the Deck is discarded", () => {
    const { rerender } = renderHook(({ state }) => useSavedState(state), { initialProps: { state: deck } });
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).not.toBeNull();
    rerender({ state: initialState });
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBeNull();
  });

  it("FR-16 AC 8 leaves unreadable stored data alone when the app starts with no Deck", () => {
    window.localStorage.setItem(SAVED_STATE_KEY, '{"version":99}');
    renderHook(() => useSavedState(initialState));
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBe('{"version":99}');
  });

  it("FR-16 shows no save-failed notice on an empty start even when storage is blocked", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const { result } = renderHook(() => useSavedState(initialState));
    expect(result.current.saveFailed).toBe(false);
  });

  it("FR-16 reports saveFailed when writing fails and clears it after a good write", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const { result, rerender } = renderHook(({ state }) => useSavedState(state), { initialProps: { state: deck } });
    expect(result.current.saveFailed).toBe(true);
    spy.mockRestore();
    rerender({ state: { ...deck, shuffle: true } });
    expect(result.current.saveFailed).toBe(false);
  });
});

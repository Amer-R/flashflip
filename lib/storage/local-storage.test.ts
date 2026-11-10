import { afterEach, describe, expect, it, vi } from "vitest";
import {
  SAVED_STATE_KEY,
  readSavedState,
  removeSavedState,
  writeSavedState,
} from "@/lib/storage/local-storage";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("FR-14 storage adapter", () => {
  it("FR-14 uses the single key flashflip:saved-state", () => {
    expect(SAVED_STATE_KEY).toBe("flashflip:saved-state");
    expect(writeSavedState("{}")).toEqual({ ok: true, value: null });
    expect(window.localStorage.getItem("flashflip:saved-state")).toBe("{}");
  });

  it("FR-14 reads what was written and null when nothing is stored", () => {
    expect(readSavedState()).toEqual({ ok: true, value: null });
    writeSavedState('{"a":1}');
    expect(readSavedState()).toEqual({ ok: true, value: '{"a":1}' });
  });

  it("FR-14 removes the key", () => {
    writeSavedState("{}");
    expect(removeSavedState()).toEqual({ ok: true, value: null });
    expect(readSavedState()).toEqual({ ok: true, value: null });
  });
});

describe("FR-16 storage failures become typed results", () => {
  it("FR-16 a full or blocked setItem returns storage-unavailable instead of throwing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    expect(writeSavedState("{}")).toEqual({ ok: false, reason: "storage-unavailable" });
  });

  it("FR-16 a throwing getItem returns storage-unavailable", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readSavedState()).toEqual({ ok: false, reason: "storage-unavailable" });
  });

  it("FR-16 a throwing removeItem returns storage-unavailable", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(removeSavedState()).toEqual({ ok: false, reason: "storage-unavailable" });
  });

  it("FR-16 storage that cannot even be accessed returns storage-unavailable", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    expect(readSavedState()).toEqual({ ok: false, reason: "storage-unavailable" });
    expect(writeSavedState("{}")).toEqual({ ok: false, reason: "storage-unavailable" });
  });
});

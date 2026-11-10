import { describe, expect, it } from "vitest";
import { PARSER_VERSION } from "@/lib/core/parse-lines";
import {
  SAVED_STATE_VERSION,
  parseSavedState,
  serializeSavedState,
  toSavedState,
} from "@/lib/core/saved-state";
import { initialState, type SessionState } from "@/lib/core/session";

const TEXT = "a - b\nc - d\ne - f";
const base: SessionState = { screen: "ready", pasteText: TEXT, shuffle: false, order: [], marks: [] };
const stored = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    version: SAVED_STATE_VERSION,
    parserVersion: PARSER_VERSION,
    pasteText: TEXT,
    screen: "study",
    shuffle: true,
    order: [2, 0, 1],
    marks: ["knew"],
    ...over,
  });

describe("FR-14 toSavedState", () => {
  it("FR-14 holds exactly the fields of PAT-9 and no derived data", () => {
    const saved = toSavedState({ ...base, screen: "study", order: [0, 1, 2], marks: ["knew"] });
    expect(saved).toEqual({
      version: SAVED_STATE_VERSION,
      parserVersion: PARSER_VERSION,
      pasteText: TEXT,
      screen: "study",
      shuffle: false,
      order: [0, 1, 2],
      marks: ["knew"],
    });
    expect(Object.keys(saved!).sort()).toEqual(
      ["marks", "order", "parserVersion", "pasteText", "screen", "shuffle", "version"],
    );
  });

  it("FR-14 a Deck shown on the Paste screen is saved as ready", () => {
    expect(toSavedState({ ...base, screen: "paste" })?.screen).toBe("ready");
  });

  it("FR-14 with no Deck there is nothing to save (the key is removed)", () => {
    expect(toSavedState(initialState)).toBeNull();
  });

  it("FR-14 serialized JSON has no null values", () => {
    expect(serializeSavedState({ ...base })).not.toContain("null");
  });
});

describe("FR-14 parseSavedState restore", () => {
  it("FR-14 restores Card 5 of 10 with the same order and Marks", () => {
    const text = Array.from({ length: 10 }, (_, i) => `t${i} - d${i}`).join("\n");
    const order = [9, 3, 0, 1, 2, 4, 5, 6, 7, 8];
    const result = parseSavedState(stored({ pasteText: text, order, marks: ["knew", "missed", "knew", "knew"] }));
    expect(result).toEqual({
      ok: true,
      value: { screen: "study", pasteText: text, shuffle: true, order, marks: ["knew", "missed", "knew", "knew"] },
    });
  });

  it("FR-14 restores the Result screen with all Marks", () => {
    const result = parseSavedState(stored({ screen: "result", marks: ["knew", "missed", "knew"] }));
    expect(result).toMatchObject({ ok: true, value: { screen: "result" } });
  });

  it("FR-14 restores the Ready screen with the Shuffle setting", () => {
    const result = parseSavedState(stored({ screen: "ready", order: [], marks: [] }));
    expect(result).toMatchObject({ ok: true, value: { screen: "ready", shuffle: true, pasteText: TEXT } });
  });
});

describe("FR-16 parseSavedState rejects bad data", () => {
  it.each([
    ["not JSON", "{nope"],
    ["not an object", "[]"],
    ["null", "null"],
    ["missing field", stored({ shuffle: undefined })],
    ["wrong type", stored({ shuffle: "yes" })],
    ["unknown screen", stored({ screen: "paste" })],
    ["order not an array", stored({ order: "012" })],
    ["a Mark that is not knew or missed", stored({ marks: ["maybe"] })],
    ["order not a permutation", stored({ order: [0, 0, 1] })],
    ["order too short", stored({ order: [0, 1] })],
    ["too many Marks for study", stored({ marks: ["knew", "knew", "knew"] })],
    ["too few Marks for result", stored({ screen: "result", marks: ["knew"] })],
    ["ready with progress", stored({ screen: "ready" })],
    ["Paste text that makes no Deck", stored({ pasteText: "nothing here" })],
    ["null field", stored({ order: null })],
  ])("FR-16 ignores %s", (_name, json) => {
    expect(parseSavedState(json)).toMatchObject({ ok: false, reason: "invalid-data" });
  });

  it("FR-16 an unknown version is ignored", () => {
    expect(parseSavedState(stored({ version: 99 }))).toEqual({ ok: false, reason: "unknown-version" });
  });
});

describe("FR-14 parserVersion mismatch", () => {
  it("FR-14 keeps the Paste text, drops the progress and opens Ready", () => {
    const result = parseSavedState(stored({ parserVersion: PARSER_VERSION + 1 }));
    expect(result).toEqual({
      ok: true,
      value: { screen: "ready", pasteText: TEXT, shuffle: true, order: [], marks: [] },
    });
  });

  it("FR-16 a mismatch whose text no longer makes a Deck is ignored", () => {
    expect(parseSavedState(stored({ parserVersion: PARSER_VERSION + 1, pasteText: "nothing" }))).toMatchObject({
      ok: false,
    });
  });
});

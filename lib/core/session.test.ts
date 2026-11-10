import { describe, expect, it } from "vitest";
import { initialState, reducer, type SessionState } from "@/lib/core/session";

const ready: SessionState = { ...initialState, screen: "ready", pasteText: "a - b\nc - d" };
const studying: SessionState = { ...ready, screen: "study", order: [0, 1], marks: [] };

describe("FR-1/FR-7/FR-9 reducer", () => {
  it("FR-1 deck-made shows Ready with the Paste text, replacing any old Pass", () => {
    const old: SessionState = { ...studying, marks: ["knew"] };
    expect(reducer(old, { type: "deck-made", pasteText: "x - y" })).toEqual({
      screen: "ready",
      pasteText: "x - y",
      shuffle: false,
      order: [],
      marks: [],
    });
  });

  it("FR-7 pass-started opens Study at Card 1 with all Marks cleared", () => {
    const s = reducer({ ...ready, marks: ["missed"] }, { type: "pass-started", order: [0, 1] });
    expect(s).toMatchObject({ screen: "study", order: [0, 1], marks: [] });
  });

  it("FR-9 card-marked records one Mark and stays on Study until the last Card", () => {
    const s = reducer(studying, { type: "card-marked", mark: "knew" });
    expect(s.screen).toBe("study");
    expect(s.marks).toEqual(["knew"]);
  });

  it("FR-9 marking the last Card opens the Result screen", () => {
    const one = reducer(studying, { type: "card-marked", mark: "knew" });
    const done = reducer(one, { type: "card-marked", mark: "missed" });
    expect(done.screen).toBe("result");
    expect(done.marks).toEqual(["knew", "missed"]);
  });

  it("FR-9 each Card gets exactly one Mark per Pass (extra Marks are ignored)", () => {
    const done = { ...studying, screen: "result" as const, marks: ["knew", "missed"] as const };
    const s = reducer({ ...done, marks: [...done.marks] }, { type: "card-marked", mark: "knew" });
    expect(s.marks).toEqual(["knew", "missed"]);
  });

  it("FR-9 a Mark is ignored outside the Study screen", () => {
    expect(reducer(ready, { type: "card-marked", mark: "knew" })).toBe(ready);
  });

  it("FR-7 text-editing-started opens Paste and keeps the Deck's text", () => {
    const s = reducer(ready, { type: "text-editing-started" });
    expect(s).toMatchObject({ screen: "paste", pasteText: "a - b\nc - d" });
  });

  it("FR-7 text-editing-cancelled returns from Paste to Ready while a Deck exists", () => {
    const editing = reducer(ready, { type: "text-editing-started" });
    expect(reducer(editing, { type: "text-editing-cancelled" })).toMatchObject({
      screen: "ready",
      pasteText: "a - b\nc - d",
    });
    expect(reducer(initialState, { type: "text-editing-cancelled" })).toBe(initialState);
  });

  it("FR-7 pass-started is ignored outside Ready or with an empty Pass order", () => {
    expect(reducer(studying, { type: "pass-started", order: [1, 0] })).toBe(studying);
    expect(reducer(ready, { type: "pass-started", order: [] })).toBe(ready);
  });

  it("FR-9 the Pass order, not the caller, decides when the Result opens", () => {
    const one: SessionState = { ...ready, screen: "study", order: [0], marks: [] };
    expect(reducer(one, { type: "card-marked", mark: "knew" }).screen).toBe("result");
  });

  it("FR-11 pass-started from Result starts a new Pass at Card 1 with all Marks cleared", () => {
    const result: SessionState = { ...studying, screen: "result", marks: ["knew", "missed"] };
    expect(reducer(result, { type: "pass-started", order: [1, 0] })).toMatchObject({
      screen: "study",
      order: [1, 0],
      marks: [],
    });
  });

  it("FR-12 shuffle-set changes the setting on Ready and Result only", () => {
    expect(reducer(ready, { type: "shuffle-set", shuffle: true }).shuffle).toBe(true);
    const result: SessionState = { ...studying, screen: "result", marks: ["knew", "missed"] };
    expect(reducer(result, { type: "shuffle-set", shuffle: true }).shuffle).toBe(true);
    expect(reducer(studying, { type: "shuffle-set", shuffle: true })).toBe(studying);
    expect(reducer(initialState, { type: "shuffle-set", shuffle: true })).toBe(initialState);
  });

  it("FR-12 Shuffle is off by default and survives a new Deck, but New deck resets it", () => {
    expect(initialState.shuffle).toBe(false);
    const on = { ...ready, shuffle: true };
    expect(reducer(on, { type: "deck-made", pasteText: "x - y" }).shuffle).toBe(true);
    expect(reducer(on, { type: "deck-discarded" })).toEqual(initialState);
  });

  it("FR-7 deck-discarded clears the Deck and the Pass and opens Paste", () => {
    expect(reducer(studying, { type: "deck-discarded" })).toEqual(initialState);
    expect(initialState.screen).toBe("paste");
    expect(initialState.pasteText).toBe("");
  });

  it("FR-9 does not mutate the previous state", () => {
    const before = JSON.stringify(studying);
    reducer(studying, { type: "card-marked", mark: "knew" });
    expect(JSON.stringify(studying)).toBe(before);
  });
});

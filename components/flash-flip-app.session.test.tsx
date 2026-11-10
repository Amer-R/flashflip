import { FlashFlipApp } from "@/components/flash-flip-app";
import { copy } from "@/lib/copy";
import { PARSER_VERSION } from "@/lib/core/parse-lines";
import { SAVED_STATE_KEY } from "@/lib/storage/local-storage";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

type User = ReturnType<typeof userEvent.setup>;

const deckText = (n: number) => Array.from({ length: n }, (_, i) => `t${i + 1} - d${i + 1}`).join("\n");

async function makeCards(user: User, text: string) {
  const box = screen.getByLabelText(copy.pasteLabel);
  await user.click(box);
  await user.paste(text);
  await user.click(screen.getByRole("button", { name: copy.makeCards }));
}

const termButton = () => screen.getByTestId("term").closest("button")!;

async function mark(user: User, label: string) {
  await user.click(termButton());
  await user.click(screen.getByRole("button", { name: label }));
}

async function startStudy(user: User, n: number) {
  await makeCards(user, deckText(n));
  await user.click(screen.getByRole("button", { name: copy.start }));
}

async function finishPass(user: User, marks: string[]) {
  for (const label of marks) await mark(user, label);
}

const saved = () => JSON.parse(window.localStorage.getItem(SAVED_STATE_KEY)!);
const storedState = (over: Record<string, unknown> = {}) =>
  JSON.stringify({
    version: 1,
    parserVersion: PARSER_VERSION,
    pasteText: deckText(3),
    screen: "study",
    shuffle: false,
    order: [0, 1, 2],
    marks: ["knew"],
    ...over,
  });

afterEach(() => {
  vi.restoreAllMocks();
});

describe("FR-10 Score", () => {
  it("FR-10 shows X of N (P%), rounded half up", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 7);
    await finishPass(user, [copy.knewIt, copy.knewIt, copy.knewIt, copy.knewIt, copy.knewIt, copy.missedIt, copy.missedIt]);
    expect(screen.getByTestId("score")).toHaveTextContent("5 of 7 (71%)");
  });

  it.each([
    [[copy.knewIt], "1 of 1 (100%)"],
    [[copy.missedIt], "0 of 1 (0%)"],
  ])("FR-10 a 1-Card Deck shows %j as %s", async (marks, text) => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 1);
    await finishPass(user, marks);
    expect(screen.getByTestId("score")).toHaveTextContent(text);
  });
});

describe("FR-11 Start again and New deck", () => {
  it("FR-11 Start again clears the Marks and starts at Card 1 of N in Deck order", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 3);
    await finishPass(user, [copy.knewIt, copy.missedIt, copy.knewIt]);
    await user.click(screen.getByRole("button", { name: copy.startAgain }));
    expect(screen.getByText(copy.position(1, 3))).toBeInTheDocument();
    expect(screen.getByTestId("term")).toHaveTextContent("t1");
    expect(screen.getByRole("button", { name: copy.knewIt })).toBeDisabled();
    expect(saved().marks).toEqual([]);
  });

  it("FR-11 New deck on the Result screen opens an empty Paste screen", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 1);
    await finishPass(user, [copy.knewIt]);
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBeNull();
  });

  it("FR-11 New deck on Study with no Marks discards at once, with no confirmation", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 2);
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });

  it("FR-11 New deck on Ready needs no confirmation", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await makeCards(user, deckText(2));
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });

  it("FR-11 New deck on Study with a Mark asks first, and declining changes nothing", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 3);
    await mark(user, copy.knewIt);
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    expect(screen.getByRole("dialog")).toHaveTextContent(copy.discardConfirm);
    await user.click(screen.getByRole("button", { name: copy.discardNo }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText(copy.position(2, 3))).toBeInTheDocument();
    expect(saved().marks).toEqual(["knew"]);
  });

  it("FR-11 confirming the question discards the Deck and the progress", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 3);
    await mark(user, copy.knewIt);
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    await user.click(screen.getByRole("button", { name: copy.discardYes }));
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBeNull();
  });
});

describe("FR-12 Shuffle", () => {
  it("FR-12 is offered on Ready and Result, off by default, and never on Study", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    expect(screen.queryByRole("switch", { name: /Shuffle/ })).not.toBeInTheDocument();
    await makeCards(user, deckText(1));
    expect(screen.getByRole("switch", { name: /Shuffle/ })).toHaveAttribute("aria-checked", "false");
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(screen.queryByRole("switch", { name: /Shuffle/ })).not.toBeInTheDocument();
    await finishPass(user, [copy.knewIt]);
    expect(screen.getByRole("switch", { name: /Shuffle/ })).toHaveAttribute("aria-checked", "false");
  });

  it("FR-12 with Shuffle on, the injected random source decides the Pass order", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await makeCards(user, deckText(3));
    await user.click(screen.getByRole("switch", { name: /Shuffle/ }));
    await user.click(screen.getByRole("button", { name: copy.start }));
    // Math.random() === 0 gives the order [1, 2, 0].
    expect(screen.getByTestId("term")).toHaveTextContent("t2");
    expect(saved().order).toEqual([1, 2, 0]);
    expect(saved().shuffle).toBe(true);
  });

  it("FR-12 changing Shuffle on the Result screen applies to Start again", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 3);
    await finishPass(user, [copy.knewIt, copy.knewIt, copy.knewIt]);
    await user.click(screen.getByRole("switch", { name: /Shuffle/ }));
    await user.click(screen.getByRole("button", { name: copy.startAgain }));
    expect(screen.getByTestId("term")).toHaveTextContent("t2");
  });
});

describe("FR-14 Saved state", () => {
  it("FR-14 writes the Saved state when a Deck is made and after every Mark", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBeNull();
    await makeCards(user, deckText(3));
    expect(saved()).toEqual({
      version: 1,
      parserVersion: PARSER_VERSION,
      pasteText: deckText(3),
      screen: "ready",
      shuffle: false,
      order: [],
      marks: [],
    });
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(saved()).toMatchObject({ screen: "study", order: [0, 1, 2], marks: [] });
    await mark(user, copy.missedIt);
    expect(saved()).toMatchObject({ screen: "study", marks: ["missed"] });
  });

  it("FR-14 a Deck shown on the Paste screen after Edit text is saved as ready", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await makeCards(user, deckText(2));
    await user.click(screen.getByRole("button", { name: copy.editText }));
    expect(saved().screen).toBe("ready");
  });

  it("FR-14 reloading on Study restores Card 5 of 10, Term first, with the same order and Marks", async () => {
    const user = userEvent.setup();
    const first = render(<FlashFlipApp />);
    await startStudy(user, 10);
    await finishPass(user, [copy.knewIt, copy.missedIt, copy.knewIt, copy.knewIt]);
    const before = saved();
    first.unmount();
    render(<FlashFlipApp />);
    expect(screen.getByText(copy.position(5, 10))).toBeInTheDocument();
    expect(screen.getByTestId("term")).toHaveTextContent("t5");
    expect(screen.getByRole("button", { name: copy.knewIt })).toBeDisabled();
    expect(saved()).toEqual(before);
  });

  it("FR-14 a restore does not steal focus onto the Card", () => {
    window.localStorage.setItem(SAVED_STATE_KEY, storedState());
    render(<FlashFlipApp />);
    expect(screen.getByRole("heading", { name: copy.studyHeading })).toHaveFocus();
  });

  it("FR-14 reloading on Result shows the same Score without replaying the confetti", async () => {
    const user = userEvent.setup();
    const first = render(<FlashFlipApp />);
    await startStudy(user, 3);
    await finishPass(user, [copy.knewIt, copy.missedIt, copy.knewIt]);
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
    first.unmount();
    render(<FlashFlipApp />);
    expect(screen.getByTestId("score")).toHaveTextContent("2 of 3 (67%)");
    expect(screen.getByRole("heading", { name: copy.resultHeading })).toBeInTheDocument();
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
  });

  it("FR-14 reloading on Ready shows the same Cards, Skipped lines and Shuffle, and Edit text the same text", async () => {
    const user = userEvent.setup();
    const first = render(<FlashFlipApp />);
    const text = `${deckText(2)}\nbad line`;
    await makeCards(user, text);
    await user.click(screen.getByRole("switch", { name: /Shuffle/ }));
    first.unmount();
    render(<FlashFlipApp />);
    expect(screen.getByText(copy.cardsMade(2, 1))).toBeInTheDocument();
    expect(screen.getByText("bad line")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: /Shuffle/ })).toHaveAttribute("aria-checked", "true");
    await user.click(screen.getByRole("button", { name: copy.editText }));
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue(text);
  });

  it("FR-14 with no Saved state the app opens on an empty Paste screen", () => {
    render(<FlashFlipApp />);
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });

  it("FR-14 the first render is a neutral skeleton, never the Paste screen", () => {
    window.localStorage.setItem(SAVED_STATE_KEY, storedState());
    const html = renderToString(<FlashFlipApp />);
    expect(html).toContain('aria-busy="true"');
    expect(html).not.toContain(copy.pasteLabel);
    expect(html).not.toContain(copy.pasteHeading);
  });
});

describe("FR-16 bad stored data", () => {
  it.each([
    ["not JSON", "{nope"],
    ["an unknown version", storedState({ version: 2 })],
    ["an order that is not a permutation", storedState({ order: [0, 0, 1] })],
    ["too many Marks", storedState({ marks: ["knew", "knew", "knew"] })],
    ["Paste text that makes no Deck", storedState({ pasteText: "nothing" })],
  ])("FR-16 ignores %s and opens an empty Paste screen", (_name, json) => {
    window.localStorage.setItem(SAVED_STATE_KEY, json);
    render(<FlashFlipApp />);
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });

  it("FR-16 a parserVersion mismatch keeps the Paste text, drops the progress and opens Ready", () => {
    window.localStorage.setItem(SAVED_STATE_KEY, storedState({ parserVersion: PARSER_VERSION + 1 }));
    render(<FlashFlipApp />);
    expect(screen.getByRole("heading", { name: copy.readyHeading })).toBeInTheDocument();
    expect(screen.getByText(copy.cardsMade(3, 0))).toBeInTheDocument();
    expect(saved()).toMatchObject({ screen: "ready", marks: [], order: [] });
  });

  it("FR-16 storage that cannot be read opens an empty Paste screen without crashing", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    render(<FlashFlipApp />);
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });
});

describe("FR-16 storage failure", () => {
  it("FR-16 when writing fails every screen keeps working and shows the notice", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("full", "QuotaExceededError");
    });
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await makeCards(user, deckText(2));
    expect(screen.getByText(copy.saveFailed)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(screen.getByText(copy.saveFailed)).toBeInTheDocument();
    await finishPass(user, [copy.knewIt, copy.missedIt]);
    expect(screen.getByTestId("score")).toHaveTextContent("1 of 2 (50%)");
    expect(screen.getByText(copy.saveFailed)).toBeInTheDocument();
  });

  it("FR-16 no notice appears while saving works", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await makeCards(user, deckText(2));
    expect(screen.queryByText(copy.saveFailed)).not.toBeInTheDocument();
  });
});

describe("FR-15 device-only notice", () => {
  it("FR-15 shows on Ready, Study and Result, and not on Paste", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    expect(screen.queryByText(copy.deviceOnlyNotice)).not.toBeInTheDocument();
    await makeCards(user, deckText(1));
    expect(screen.getByText(copy.deviceOnlyNotice)).toBeVisible();
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(screen.getByText(copy.deviceOnlyNotice)).toBeVisible();
    await finishPass(user, [copy.knewIt]);
    expect(screen.getByText(copy.deviceOnlyNotice)).toBeVisible();
  });
});

describe("FR-10 completion effect", () => {
  it("FR-10 the headline and Score are announced once, through the single polite region", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 2);
    await finishPass(user, [copy.knewIt, copy.missedIt]);
    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent(copy.score(1, 2, 50));
    expect(live).not.toHaveTextContent(copy.resultHeading);
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("FR-10 the confetti is decorative, plays after the last Mark and again after Start again", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 1);
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    await finishPass(user, [copy.missedIt]);
    expect(screen.getByTestId("confetti")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByTestId("score")).toBeVisible();
    await user.click(screen.getByRole("button", { name: copy.startAgain }));
    expect(screen.queryByTestId("confetti")).not.toBeInTheDocument();
    await finishPass(user, [copy.knewIt]);
    expect(screen.getByTestId("confetti")).toBeInTheDocument();
  });

  it("FR-10 the headline reads the same for any Score", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 1);
    await finishPass(user, [copy.missedIt]);
    expect(screen.getByRole("heading", { name: "Pass complete!" })).toBeInTheDocument();
  });
});

describe("FR-9 swipe to Mark", () => {
  function swipe(dx: number) {
    const surface = termButton().parentElement!;
    fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(surface, { clientX: 100 + dx, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(surface, { clientX: 100 + dx, clientY: 100, pointerId: 1 });
  }

  it("FR-9 a swipe before the first flip does nothing", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 3);
    swipe(200);
    expect(screen.getByText(copy.position(1, 3))).toBeInTheDocument();
  });

  it("FR-9 after a flip, swiping right Marks Knew it and left Marks Missed it", async () => {
    const user = userEvent.setup();
    render(<FlashFlipApp />);
    await startStudy(user, 3);
    await user.click(termButton());
    swipe(200);
    expect(screen.getByText(copy.position(2, 3))).toBeInTheDocument();
    await user.click(termButton());
    swipe(-200);
    expect(screen.getByText(copy.position(3, 3))).toBeInTheDocument();
    expect(saved().marks).toEqual(["knew", "missed"]);
  });
});

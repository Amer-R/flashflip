import { FlashFlipApp } from "@/components/flash-flip-app";
import { copy } from "@/lib/copy";
import { MAX_CARDS, MAX_PASTE_CHARS, SKIPPED_LINES_SHOWN } from "@/lib/core/limits";
import { SAVED_STATE_KEY } from "@/lib/storage/local-storage";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

// Story 1.3: FR-6 refusals, AD-9 long Skipped lists and FR-17 text shown exactly.

function setText(text: string) {
  // fireEvent.change sets a very long value at once (typing 200,000 characters would crawl).
  fireEvent.change(screen.getByLabelText(copy.pasteLabel), { target: { value: text } });
}

function makeCards(text: string) {
  setText(text);
  fireEvent.click(screen.getByRole("button", { name: copy.makeCards }));
}

const cardsText = (n: number) => Array.from({ length: n }, (_, i) => `t${i} - d${i}`).join("\n");
const skippedText = (n: number) => Array.from({ length: n }, (_, i) => `bad line ${i}`).join("\n");

describe("FR-6 refusals", () => {
  it("FR-6 text over 200,000 characters is refused with the PRD message, the text stays", () => {
    render(<FlashFlipApp />);
    const text = "a - b".padEnd(MAX_PASTE_CHARS + 1, " ");
    makeCards(text);
    expect(screen.getByTestId("refusal")).toHaveTextContent("Too much text (max 200,000 characters)");
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue(text);
    expect(screen.getByRole("heading", { name: copy.pasteHeading })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: copy.skippedHeading })).not.toBeInTheDocument();
  });

  it("FR-6 exactly 200,000 characters still make a Deck", () => {
    render(<FlashFlipApp />);
    makeCards("a - b".padEnd(MAX_PASTE_CHARS, " "));
    expect(screen.getByRole("heading", { name: copy.readyHeading })).toBeInTheDocument();
  });

  it("FR-6 more than 1,000 Cards is refused with the PRD message", () => {
    render(<FlashFlipApp />);
    makeCards(cardsText(MAX_CARDS + 1));
    expect(screen.getByTestId("refusal")).toHaveTextContent("Too many cards (max 1,000)");
    expect(screen.getByRole("heading", { name: copy.pasteHeading })).toBeInTheDocument();
  });

  it("FR-6 exactly 1,000 Cards still make a Deck", () => {
    render(<FlashFlipApp />);
    makeCards(cardsText(MAX_CARDS));
    expect(screen.getByText(copy.cardsMade(MAX_CARDS, 0))).toBeInTheDocument();
  });

  it("FR-6 each refusal is announced once through the single polite region", () => {
    render(<FlashFlipApp />);
    makeCards(cardsText(MAX_CARDS + 1));
    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(screen.getByRole("status")).toHaveTextContent(copy.tooManyCards(MAX_CARDS));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("FR-6 after a refusal a reload shows the same Deck as before", async () => {
    const user = userEvent.setup();
    const first = render(<FlashFlipApp />);
    makeCards("mitosis - cell division\nosmosis - water");
    await user.click(screen.getByRole("button", { name: copy.editText }));
    makeCards(cardsText(MAX_CARDS + 1));
    expect(screen.getByTestId("refusal")).toBeInTheDocument();
    first.unmount();
    render(<FlashFlipApp />);
    expect(screen.getByRole("heading", { name: copy.readyHeading })).toBeInTheDocument();
    expect(screen.getByText(copy.cardsMade(2, 0))).toBeInTheDocument();
  });

  it("FR-6 with no earlier Deck, a reload after a refusal shows the empty Paste screen", () => {
    const first = render(<FlashFlipApp />);
    makeCards("nothing here");
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBeNull();
    first.unmount();
    render(<FlashFlipApp />);
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });
});

describe("AD-9 long Skipped lists", () => {
  const items = () => within(screen.getByRole("region", { name: copy.skippedHeading })).getAllByRole("listitem");

  it("FR-5 the Ready screen shows the first 100 Skipped lines and a Show all control", () => {
    render(<FlashFlipApp />);
    makeCards(`ok - fine\n${skippedText(150)}`);
    expect(screen.getByText(copy.cardsMade(1, 150))).toBeInTheDocument();
    expect(items()).toHaveLength(SKIPPED_LINES_SHOWN);
    fireEvent.click(screen.getByRole("button", { name: "Show all 150" }));
    expect(items()).toHaveLength(150);
    expect(screen.queryByRole("button", { name: "Show all 150" })).not.toBeInTheDocument();
  });

  it("FR-5 exactly 100 Skipped lines show no control", () => {
    render(<FlashFlipApp />);
    makeCards(`ok - fine\n${skippedText(100)}`);
    expect(items()).toHaveLength(100);
    expect(screen.queryByRole("button", { name: /^Show all/ })).not.toBeInTheDocument();
  });

  it("FR-5 the refusal view lists the first 100 and Show all reveals every Skipped line", () => {
    render(<FlashFlipApp />);
    makeCards(skippedText(130));
    expect(screen.getByTestId("refusal")).toHaveTextContent(copy.noCardsMade);
    expect(items()).toHaveLength(100);
    fireEvent.click(screen.getByRole("button", { name: "Show all 130" }));
    expect(items()).toHaveLength(130);
  });

  it("FR-5 Show all moves keyboard focus to the first revealed line", () => {
    render(<FlashFlipApp />);
    makeCards(`ok - fine\n${skippedText(120)}`);
    fireEvent.click(screen.getByRole("button", { name: "Show all 120" }));
    expect(items()[SKIPPED_LINES_SHOWN]).toHaveFocus();
  });

  it("FR-5 a later refusal starts collapsed again even after Show all", () => {
    render(<FlashFlipApp />);
    makeCards(skippedText(130));
    fireEvent.click(screen.getByRole("button", { name: "Show all 130" }));
    expect(items()).toHaveLength(130);
    fireEvent.click(screen.getByRole("button", { name: copy.makeCards }));
    expect(items()).toHaveLength(SKIPPED_LINES_SHOWN);
    expect(screen.getByRole("button", { name: "Show all 130" })).toBeInTheDocument();
  });

  it("FR-5 the lines after the first 100 carry the content-visibility class", () => {
    render(<FlashFlipApp />);
    makeCards(`ok - fine\n${skippedText(120)}`);
    fireEvent.click(screen.getByRole("button", { name: "Show all 120" }));
    const all = items();
    expect(all[99]).not.toHaveClass("skipped-rest");
    expect(all[100]).toHaveClass("skipped-rest");
  });
});

describe("FR-17 text shown exactly", () => {
  function studyFirstCard(text: string) {
    render(<FlashFlipApp />);
    makeCards(text);
    fireEvent.click(screen.getByRole("button", { name: copy.start }));
  }

  it("FR-17 markup is shown as characters and creates no elements", () => {
    studyFirstCard("<b>x</b> - <img src=x onerror=alert(1)>");
    expect(screen.getByTestId("term")).toHaveTextContent("<b>x</b>");
    expect(screen.getByTestId("definition")).toHaveTextContent("<img src=x onerror=alert(1)>");
    expect(document.querySelector("b")).toBeNull();
    expect(document.querySelector("img")).toBeNull();
  });

  it("FR-17 Term and Definition are separate elements with automatic direction", () => {
    studyFirstCard("خلية - cell");
    const term = screen.getByTestId("term");
    const definition = screen.getByTestId("definition");
    expect(term).not.toBe(definition);
    expect(term).toHaveAttribute("dir", "auto");
    expect(definition).toHaveAttribute("dir", "auto");
    expect(term.textContent).toBe("خلية");
    expect(definition.textContent).toBe("cell");
  });

  it("P-29 P-30 emoji sequences and combining marks come through character for character", () => {
    const family = "\u{1F468}\u200D\u{1F469}\u200D\u{1F467}";
    studyFirstCard(`${family} - family\né - e with acute`);
    expect(screen.getByTestId("term").textContent).toBe(family);
    expect(screen.getByTestId("definition").textContent).toBe("family");
  });

  it("FR-17 a 1,000-character Definition stays in one element that can wrap", () => {
    const long = "x".repeat(1000);
    studyFirstCard(`term - ${long}`);
    const definition = screen.getByTestId("definition");
    expect(definition.textContent).toBe(long);
    expect(definition.closest(".wrap-anywhere")).not.toBeNull();
  });
});

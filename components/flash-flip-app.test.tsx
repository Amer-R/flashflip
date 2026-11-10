import { FlashFlipApp } from "@/components/flash-flip-app";
import { copy } from "@/lib/copy";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

const TEXT = "mitosis - cell division\nosmosis: water moving\nbad line\natom\tsmallest unit\nion - charged atom";

function setup() {
  const user = userEvent.setup();
  render(<FlashFlipApp />);
  return user;
}

async function makeCards(user: ReturnType<typeof userEvent.setup>, text: string) {
  const box = screen.getByLabelText(copy.pasteLabel);
  await user.clear(box);
  await user.click(box);
  await user.paste(text);
  await user.click(screen.getByRole("button", { name: copy.makeCards }));
}

describe("FR-1 Paste screen", () => {
  it("FR-1 Make cards is disabled while the text is empty or only whitespace", async () => {
    const user = setup();
    const button = screen.getByRole("button", { name: copy.makeCards });
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText(copy.pasteLabel), "   ");
    expect(button).toBeDisabled();
    await user.type(screen.getByLabelText(copy.pasteLabel), "a");
    expect(button).toBeEnabled();
  });

  it("FR-1 Enter inserts a line break and never makes cards", async () => {
    const user = setup();
    const box = screen.getByLabelText(copy.pasteLabel);
    await user.type(box, "a - b{Enter}c - d");
    expect(box).toHaveValue("a - b\nc - d");
    expect(screen.getByRole("heading", { name: copy.pasteHeading })).toBeInTheDocument();
  });

  it("FR-1 a successful Make cards shows the Ready screen", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    expect(screen.getByRole("heading", { name: copy.readyHeading })).toBeInTheDocument();
  });

  it("FR-1 a successful Make cards replaces any existing Deck", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    await user.click(screen.getByRole("button", { name: copy.editText }));
    await makeCards(user, "x - y");
    expect(screen.getByText(copy.cardsMade(1, 0))).toBeInTheDocument();
  });
});

describe("FR-6 refusal (no cards)", () => {
  it("FR-6 stays on Paste with the text intact and lists the Skipped lines", async () => {
    const user = setup();
    await makeCards(user, "nothing here\nnor here");
    expect(screen.getByRole("heading", { name: copy.pasteHeading })).toBeInTheDocument();
    expect(screen.getByTestId("refusal")).toHaveTextContent(copy.noCardsMade);
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("nothing here\nnor here");
    const items = within(screen.getByRole("region", { name: copy.skippedHeading })).getAllByRole("listitem");
    expect(items).toHaveLength(2);
  });

  it("FR-6 a refused paste after Edit text shows the refusal (no deck-made is dispatched, so the Deck is untouched; reload persistence is Story 1.2)", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    await user.click(screen.getByRole("button", { name: copy.editText }));
    await makeCards(user, "no separators");
    expect(screen.getByTestId("refusal")).toHaveTextContent(copy.noCardsMade);
    await user.click(screen.getByRole("button", { name: copy.back }));
    expect(screen.getByText(copy.cardsMade(4, 1))).toBeInTheDocument();
  });

  it("FR-6 the refusal and its Skipped lines clear as soon as the Student edits the text", async () => {
    const user = setup();
    await makeCards(user, "no separators");
    await user.type(screen.getByLabelText(copy.pasteLabel), "x");
    expect(screen.queryByTestId("refusal")).not.toBeInTheDocument();
  });

  it("FR-6 the refusal is announced once, through the single polite region", async () => {
    const user = setup();
    await makeCards(user, "no separators");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(copy.noCardsMade);
  });

  it("FR-7 Back is offered only while a Deck exists and returns to Ready", async () => {
    const user = setup();
    expect(screen.queryByRole("button", { name: copy.back })).not.toBeInTheDocument();
    await makeCards(user, TEXT);
    await user.click(screen.getByRole("button", { name: copy.editText }));
    await user.click(screen.getByRole("button", { name: copy.back }));
    expect(screen.getByRole("heading", { name: copy.readyHeading })).toBeInTheDocument();
  });
});

describe("FR-7 Ready screen", () => {
  it("FR-7 shows counts, the Skipped line, a 3-Card preview and the three buttons", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    expect(screen.getByText(copy.cardsMade(4, 1))).toBeInTheDocument();
    const skipped = within(screen.getByRole("region", { name: copy.skippedHeading }));
    expect(skipped.getByText("bad line")).toBeInTheDocument();
    expect(skipped.getByText(/no separator/)).toBeInTheDocument();
    const preview = screen.getAllByRole("listitem").filter((li) => li.textContent?.includes(copy.arrow));
    expect(preview).toHaveLength(3);
    expect(preview[0]).toHaveTextContent("mitosis → cell division");
    for (const name of [copy.start, copy.editText, copy.newDeck]) {
      expect(screen.getByRole("button", { name })).toBeInTheDocument();
    }
  });

  it("FR-7 a Deck smaller than 3 shows fewer preview Cards", async () => {
    const user = setup();
    await makeCards(user, "a - b");
    expect(screen.getAllByRole("listitem").filter((li) => li.textContent?.includes(copy.arrow))).toHaveLength(1);
  });

  it("FR-7 Edit text opens Paste with the same text", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    await user.click(screen.getByRole("button", { name: copy.editText }));
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue(TEXT);
  });

  it("FR-7 New deck opens an empty Paste screen", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });

  it("FR-7 Start opens Study at Card 1 of N, Term first", async () => {
    const user = setup();
    await makeCards(user, TEXT);
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(screen.getByText(copy.position(1, 4))).toBeInTheDocument();
    expect(screen.getByTestId("term")).toHaveTextContent("mitosis");
  });
});

// AD-10: both faces are in the DOM; only the visible one is exposed to assistive tech.
const faceOf = (which: "term" | "definition") => screen.getByTestId(which).closest("[data-face]")!;

describe("FR-8 and FR-9 Study screen", () => {
  async function study(text = TEXT) {
    const user = setup();
    await makeCards(user, text);
    await user.click(screen.getByRole("button", { name: copy.start }));
    return user;
  }

  it("FR-8 a click flips to the Definition and back", async () => {
    const user = await study();
    const card = screen.getByTestId("term").closest("button")!;
    expect(faceOf("term")).toHaveAttribute("aria-hidden", "false");
    expect(faceOf("definition")).toHaveAttribute("aria-hidden", "true");
    await user.click(card);
    expect(screen.getByTestId("definition")).toHaveTextContent("cell division");
    expect(faceOf("definition")).toHaveAttribute("aria-hidden", "false");
    expect(faceOf("term")).toHaveAttribute("aria-hidden", "true");
    await user.click(card);
    expect(screen.getByTestId("term")).toHaveTextContent("mitosis");
    expect(faceOf("term")).toHaveAttribute("aria-hidden", "false");
  });

  it("FR-8 Enter and Space flip the focused Card", async () => {
    const user = await study();
    screen.getByTestId("term").closest("button")!.focus();
    await user.keyboard("{Enter}");
    expect(faceOf("definition")).toHaveAttribute("aria-hidden", "false");
    await user.keyboard(" ");
    expect(faceOf("term")).toHaveAttribute("aria-hidden", "false");
  });

  it("FR-9 both Mark buttons are disabled until the Card has been flipped", async () => {
    const user = await study();
    expect(screen.getByRole("button", { name: copy.knewIt })).toBeDisabled();
    expect(screen.getByRole("button", { name: copy.missedIt })).toBeDisabled();
    await user.click(screen.getByTestId("term").closest("button")!);
    expect(screen.getByRole("button", { name: copy.knewIt })).toBeEnabled();
    expect(screen.getByRole("button", { name: copy.missedIt })).toBeEnabled();
  });

  it("FR-9 marking shows the next Card Term first with n up by 1", async () => {
    const user = await study();
    await user.click(screen.getByTestId("term").closest("button")!);
    await user.click(screen.getByRole("button", { name: copy.knewIt }));
    expect(screen.getByText(copy.position(2, 4))).toBeInTheDocument();
    expect(screen.getByTestId("term")).toHaveTextContent("osmosis");
    expect(screen.getByRole("button", { name: copy.knewIt })).toBeDisabled();
  });

  it("FR-9 marking the last Card opens the Result screen", async () => {
    const user = await study("a - b\nc - d");
    for (const label of [copy.knewIt, copy.missedIt]) {
      await user.click(screen.getByTestId("term").closest("button")!);
      await user.click(screen.getByRole("button", { name: label }));
    }
    expect(screen.getByRole("heading", { name: copy.resultHeading })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.newDeck }));
    expect(screen.getByLabelText(copy.pasteLabel)).toHaveValue("");
  });
});

describe("FR-17 basics", () => {
  it("FR-17 shows markup as characters in separate dir=auto elements", async () => {
    const user = setup();
    await makeCards(user, "<b>x</b> - <img src=x onerror=alert(1)>");
    await user.click(screen.getByRole("button", { name: copy.start }));
    const term = screen.getByTestId("term");
    expect(term).toHaveTextContent("<b>x</b>");
    expect(term).toHaveAttribute("dir", "auto");
    expect(term.querySelector("b")).toBeNull();
    await user.click(term.closest("button")!);
    const definition = screen.getByTestId("definition");
    expect(definition).toHaveTextContent("<img src=x onerror=alert(1)>");
    expect(definition).toHaveAttribute("dir", "auto");
    expect(document.querySelector("img")).toBeNull();
  });
});

describe("PAT-15 accessibility", () => {
  it("PAT-15 each screen moves focus to its heading", async () => {
    const user = setup();
    expect(screen.getByRole("heading", { name: copy.pasteHeading })).toHaveFocus();
    await makeCards(user, "a - b");
    expect(screen.getByRole("heading", { name: copy.readyHeading })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(screen.getByRole("heading", { name: copy.studyHeading })).toHaveFocus();
  });

  it("PAT-15 flips announce through one polite live region", async () => {
    const user = setup();
    await makeCards(user, "a - b");
    await user.click(screen.getByRole("button", { name: copy.start }));
    await user.click(screen.getByTestId("term").closest("button")!);
    const live = screen.getByRole("status");
    expect(live).toHaveAttribute("aria-live", "polite");
    expect(live).toHaveTextContent(copy.announceDefinition("b"));
  });
});

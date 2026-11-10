import { FlipCard } from "@/components/ui/flip-card";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// FR-17: a Card taller than the screen scrolls inside its visible face, also by keyboard.
// jsdom has no layout, so scrollHeight, clientHeight and scrollBy are stubbed here; the
// real scrolling is checked in a browser (docs/manual-checklist.md).
const card = { term: "term", definition: "a very long definition" };

function visibleScroller(flipped: boolean) {
  const face = document.querySelector<HTMLElement>(`[data-face="${flipped ? "definition" : "term"}"]`)!;
  return face.querySelector<HTMLElement>("[data-scroll]")!;
}

function stubLayout(el: HTMLElement, scrollHeight: number, clientHeight: number) {
  Object.defineProperty(el, "scrollHeight", { configurable: true, value: scrollHeight });
  Object.defineProperty(el, "clientHeight", { configurable: true, value: clientHeight });
  const scrollBy = vi.fn();
  el.scrollBy = scrollBy as unknown as typeof el.scrollBy;
  return scrollBy;
}

describe("FR-17 flip card scrolling", () => {
  it("FR-17 each face has its own scroll container", () => {
    render(<FlipCard card={card} flipped={false} onFlip={() => {}} />);
    expect(document.querySelectorAll("[data-scroll]")).toHaveLength(2);
    expect(visibleScroller(false)).toHaveClass("face-scroll");
  });

  it("FR-17 ArrowDown and ArrowUp scroll the visible face when its content is taller", () => {
    render(<FlipCard card={card} flipped={false} onFlip={() => {}} />);
    const scrollBy = stubLayout(visibleScroller(false), 900, 300);
    const button = screen.getByRole("button");
    fireEvent.keyDown(button, { key: "ArrowDown" });
    fireEvent.keyDown(button, { key: "ArrowUp" });
    expect(scrollBy.mock.calls).toEqual([[{ top: 48 }], [{ top: -48 }]]);
  });

  it("FR-17 PageDown scrolls by most of a screenful of the visible face", () => {
    render(<FlipCard card={card} flipped={true} onFlip={() => {}} />);
    const scrollBy = stubLayout(visibleScroller(true), 900, 300);
    fireEvent.keyDown(screen.getByRole("button"), { key: "PageDown" });
    expect(scrollBy).toHaveBeenCalledWith({ top: 270 });
  });

  it("FR-17 the arrow keys are left alone when nothing is taller than the face", () => {
    render(<FlipCard card={card} flipped={false} onFlip={() => {}} />);
    const scrollBy = stubLayout(visibleScroller(false), 200, 300);
    const notPrevented = fireEvent.keyDown(screen.getByRole("button"), { key: "ArrowDown" });
    expect(scrollBy).not.toHaveBeenCalled();
    expect(notPrevented).toBe(true);
  });

  it("FR-8 a held Enter or Space does not flip again, but a held arrow keeps scrolling", () => {
    const onFlip = vi.fn();
    render(<FlipCard card={card} flipped={false} onFlip={onFlip} />);
    const scrollBy = stubLayout(visibleScroller(false), 900, 300);
    const button = screen.getByRole("button");
    expect(fireEvent.keyDown(button, { key: "Enter", repeat: true })).toBe(false);
    expect(fireEvent.keyDown(button, { key: " ", repeat: true })).toBe(false);
    fireEvent.keyDown(button, { key: "ArrowDown", repeat: true });
    expect(scrollBy).toHaveBeenCalledTimes(1);
  });
});

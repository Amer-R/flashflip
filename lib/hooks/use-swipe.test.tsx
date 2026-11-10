import { SWIPE_THRESHOLD_PX, useSwipe } from "@/lib/hooks/use-swipe";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function Surface({ enabled, onSwipe, onClick }: { enabled: boolean; onSwipe: (d: string) => void; onClick: () => void }) {
  const { handlers, offset } = useSwipe({ enabled, onSwipe });
  return (
    <div data-testid="surface" data-offset={offset} {...handlers}>
      <button type="button" onClick={onClick}>
        flip
      </button>
    </div>
  );
}

function drag(dx: number, dy = 0) {
  const surface = screen.getByTestId("surface");
  fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, pointerId: 1 });
  fireEvent.pointerMove(surface, { clientX: 100 + dx, clientY: 100 + dy, pointerId: 1 });
  fireEvent.pointerUp(surface, { clientX: 100 + dx, clientY: 100 + dy, pointerId: 1 });
}

describe("FR-9 swipe to Mark", () => {
  it("FR-9 a long drag right reports right and a long drag left reports left", () => {
    const onSwipe = vi.fn();
    render(<Surface enabled onSwipe={onSwipe} onClick={() => {}} />);
    drag(SWIPE_THRESHOLD_PX + 20);
    drag(-(SWIPE_THRESHOLD_PX + 20));
    expect(onSwipe.mock.calls).toEqual([["right"], ["left"]]);
  });

  it("FR-9 is disabled until the Card has been flipped", () => {
    const onSwipe = vi.fn();
    render(<Surface enabled={false} onSwipe={onSwipe} onClick={() => {}} />);
    drag(200);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("FR-9 a short drag is not a swipe", () => {
    const onSwipe = vi.fn();
    render(<Surface enabled onSwipe={onSwipe} onClick={() => {}} />);
    drag(SWIPE_THRESHOLD_PX - 20);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("FR-9 a mostly vertical drag is not a swipe", () => {
    const onSwipe = vi.fn();
    render(<Surface enabled onSwipe={onSwipe} onClick={() => {}} />);
    drag(SWIPE_THRESHOLD_PX + 5, 300);
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it("FR-8 a drag does not also fire the flip click, but a plain tap still does", () => {
    const onClick = vi.fn();
    render(<Surface enabled onSwipe={() => {}} onClick={onClick} />);
    drag(SWIPE_THRESHOLD_PX + 20);
    fireEvent.click(screen.getByRole("button", { name: "flip" }));
    expect(onClick).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "flip" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("FR-8 a cancelled drag does not swallow the next flip click", () => {
    const onClick = vi.fn();
    render(<Surface enabled onSwipe={() => {}} onClick={onClick} />);
    const surface = screen.getByTestId("surface");
    fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(surface, { clientX: 140, clientY: 100, pointerId: 1 });
    fireEvent.pointerCancel(surface, { pointerId: 1 });
    fireEvent.click(screen.getByRole("button", { name: "flip" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("FR-9 ignores the secondary mouse button and a second pointer mid-gesture", () => {
    const onSwipe = vi.fn();
    render(<Surface enabled onSwipe={onSwipe} onClick={() => {}} />);
    const surface = screen.getByTestId("surface");
    fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, pointerId: 1, button: 2 });
    fireEvent.pointerMove(surface, { clientX: 300, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(surface, { clientX: 300, clientY: 100, pointerId: 1 });
    expect(onSwipe).not.toHaveBeenCalled();

    fireEvent.pointerDown(surface, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerDown(surface, { clientX: 0, clientY: 100, pointerId: 2 });
    fireEvent.pointerMove(surface, { clientX: 200, clientY: 100, pointerId: 1 });
    fireEvent.pointerUp(surface, { clientX: 200, clientY: 100, pointerId: 2 });
    expect(onSwipe).not.toHaveBeenCalled();
    fireEvent.pointerUp(surface, { clientX: 200, clientY: 100, pointerId: 1 });
    expect(onSwipe).toHaveBeenCalledWith("right");
  });

  it("FR-9 follows the pointer while dragging and resets afterwards", () => {
    render(<Surface enabled onSwipe={() => {}} onClick={() => {}} />);
    const surface = screen.getByTestId("surface");
    fireEvent.pointerDown(surface, { clientX: 0, clientY: 0, pointerId: 1 });
    fireEvent.pointerMove(surface, { clientX: 40, clientY: 0, pointerId: 1 });
    expect(surface).toHaveAttribute("data-offset", "40");
    fireEvent.pointerUp(surface, { clientX: 40, clientY: 0, pointerId: 1 });
    expect(surface).toHaveAttribute("data-offset", "0");
  });
});

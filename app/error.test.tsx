import ErrorBoundary from "@/app/error";
import { copy } from "@/lib/copy";
import { SAVED_STATE_KEY } from "@/lib/storage/local-storage";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// PAT-6: the crash boundary offers "Start over", which clears the Saved state.
afterEach(() => {
  vi.restoreAllMocks();
});

describe("PAT-6 crash boundary", () => {
  it("PAT-6 logs the error with console.error and shows the Start over button", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const error = new Error("boom");
    render(<ErrorBoundary error={error} reset={() => {}} />);
    expect(spy).toHaveBeenCalledWith(error);
    expect(screen.getByRole("heading", { name: copy.errorHeading })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.startOver })).toBeInTheDocument();
  });

  it("PAT-6 Start over clears the Saved state and resets", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    window.localStorage.setItem(SAVED_STATE_KEY, "{}");
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error("boom")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: copy.startOver }));
    expect(window.localStorage.getItem(SAVED_STATE_KEY)).toBeNull();
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("PAT-6 Start over still resets when storage is blocked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    const reset = vi.fn();
    render(<ErrorBoundary error={new Error("boom")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: copy.startOver }));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});

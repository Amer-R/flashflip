import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

function setup(open: boolean) {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  const view = render(
    <ConfirmDialog
      open={open}
      message="Discard?"
      confirmLabel="Discard"
      cancelLabel="Keep studying"
      onConfirm={onConfirm}
      onCancel={onCancel}
    />,
  );
  return { onConfirm, onCancel, view };
}

describe("FR-11 ConfirmDialog", () => {
  it("FR-11 opens the native dialog only when asked", () => {
    const { view } = setup(false);
    const dialog = document.querySelector("dialog")!;
    expect(dialog.open).toBe(false);
    view.rerender(
      <ConfirmDialog open message="Discard?" confirmLabel="Discard" cancelLabel="Keep studying" onConfirm={() => {}} onCancel={() => {}} />,
    );
    expect(dialog.open).toBe(true);
  });

  it("FR-11 the safe button comes first and cancels", () => {
    const { onCancel, onConfirm } = setup(true);
    const buttons = screen.getAllByRole("button", { hidden: true });
    expect(buttons[0]).toHaveTextContent("Keep studying");
    fireEvent.click(buttons[0]);
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("FR-11 the second button confirms", () => {
    const { onCancel, onConfirm } = setup(true);
    fireEvent.click(screen.getByRole("button", { name: "Discard", hidden: true }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it("FR-11 Escape (cancel event) is prevented and reported as a cancel", () => {
    const { onCancel } = setup(true);
    const dialog = document.querySelector("dialog")!;
    const event = new Event("cancel", { cancelable: true });
    dialog.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("FR-11 a close the browser made on its own is reported as a cancel", () => {
    const { onCancel } = setup(true);
    const dialog = document.querySelector("dialog")!;
    dialog.dispatchEvent(new Event("close"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("FR-11 closing because the prop went false does not report a cancel", () => {
    const { onCancel, view } = setup(true);
    view.rerender(
      <ConfirmDialog open={false} message="Discard?" confirmLabel="Discard" cancelLabel="Keep studying" onConfirm={() => {}} onCancel={onCancel} />,
    );
    document.querySelector("dialog")!.dispatchEvent(new Event("close"));
    expect(onCancel).not.toHaveBeenCalled();
  });
});

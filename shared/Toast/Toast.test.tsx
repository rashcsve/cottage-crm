import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TOAST_DEFAULT_DURATION_MS } from "./constants";
import { Toast } from "./Toast";
import { ToastProvider } from "./ToastProvider";
import { useToast } from "./useToast";

describe("Toast", () => {
  it.each([
    ["success", "status", "polite"],
    ["info", "status", "polite"],
    ["error", "alert", "assertive"],
  ] as const)(
    "renders a %s toast with role=%s and aria-live=%s",
    (type, role, ariaLive) => {
      render(
        <Toast id="t1" type={type} message="Saved" onDismiss={vi.fn()} />,
      );

      const toast = screen.getByRole(role);
      expect(toast).toHaveAttribute("aria-live", ariaLive);
      expect(toast).toHaveTextContent("Saved");
    },
  );

  it("dismisses by id through the close button named by common.close", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    render(
      <Toast id="t1" type="success" message="Saved" onDismiss={onDismiss} />,
    );

    await user.click(screen.getByRole("button", { name: "close" }));

    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("renders no action button when no action is given", () => {
    render(
      <Toast id="t1" type="success" message="Saved" onDismiss={vi.fn()} />,
    );

    expect(screen.getAllByRole("button")).toHaveLength(1);
  });

  it("runs the action and dismisses the toast by default", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onClick = vi.fn();
    render(
      <Toast
        id="t1"
        type="success"
        message="Item deleted"
        action={{ label: "Undo", onClick }}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).toHaveBeenCalledWith("t1");
  });

  it("keeps the toast open when the action sets dismissOnClick=false", async () => {
    const user = userEvent.setup();
    const onDismiss = vi.fn();
    const onClick = vi.fn();
    render(
      <Toast
        id="t1"
        type="info"
        message="Item deleted"
        action={{ label: "Undo", onClick, dismissOnClick: false }}
        onDismiss={onDismiss}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Undo" }));

    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

function ToastTrigger() {
  const toast = useToast();

  return (
    <>
      <button type="button" onClick={() => toast.success("Saved")}>
        Show success
      </button>
      <button type="button" onClick={() => toast.error("Failed")}>
        Show error
      </button>
      <button
        type="button"
        onClick={() => toast.info("Sticky", { duration: 0 })}
      >
        Show sticky
      </button>
    </>
  );
}

describe("ToastProvider", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("shows toasts with the matching live-region role", () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Show success" }).click();
      screen.getByRole("button", { name: "Show error" }).click();
    });

    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    expect(screen.getByRole("alert")).toHaveTextContent("Failed");
  });

  it("auto-dismisses after the default duration", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Show success" }).click();
    });
    expect(screen.getByRole("status")).toHaveTextContent("Saved");

    act(() => {
      vi.advanceTimersByTime(TOAST_DEFAULT_DURATION_MS);
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps a toast with duration 0 until it is dismissed", () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>,
    );

    act(() => {
      screen.getByRole("button", { name: "Show sticky" }).click();
    });
    act(() => {
      vi.advanceTimersByTime(TOAST_DEFAULT_DURATION_MS * 10);
    });
    expect(screen.getByRole("status")).toHaveTextContent("Sticky");

    act(() => {
      screen.getByRole("button", { name: "close" }).click();
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("throws when useToast is used outside the provider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    expect(() => render(<ToastTrigger />)).toThrow(
      "useToast must be used within ToastProvider",
    );

    consoleError.mockRestore();
  });
});

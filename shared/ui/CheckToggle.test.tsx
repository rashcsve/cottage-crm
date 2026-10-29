import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CheckToggle } from "./CheckToggle";

describe("CheckToggle", () => {
  it("renders an unchecked toggle button named by its label", () => {
    render(<CheckToggle checked={false} label="Toggle item" readOnlyStateLabel="Not completed" onToggle={vi.fn()} />);

    const toggle = screen.getByRole("button", { name: "Toggle item" });
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("aria-busy", "false");
    expect(toggle).toBeEnabled();
  });

  it("exposes the checked state with aria-pressed", () => {
    render(<CheckToggle checked label="Toggle item" readOnlyStateLabel="Not completed" onToggle={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Toggle item" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onToggle on click and on keyboard activation", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(<CheckToggle checked={false} label="Toggle item" readOnlyStateLabel="Not completed" onToggle={onToggle} />);

    const toggle = screen.getByRole("button", { name: "Toggle item" });
    await user.click(toggle);
    toggle.focus();
    await user.keyboard("{Enter}");
    await user.keyboard(" ");

    expect(onToggle).toHaveBeenCalledTimes(3);
  });

  it("is busy and disabled while pending", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    render(
      <CheckToggle checked={false} label="Toggle item" readOnlyStateLabel="Not completed" pending onToggle={onToggle} />,
    );

    const toggle = screen.getByRole("button", { name: "Toggle item" });
    expect(toggle).toBeDisabled();
    expect(toggle).toHaveAttribute("aria-busy", "true");
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("announces the state as text instead of a control when read-only", () => {
    render(
      <CheckToggle
        checked
        label="Toggle item"
        readOnly
        readOnlyStateLabel="Completed"
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    const stateText = screen.getByText("Completed");
    expect(stateText.closest('[aria-hidden="true"]')).toBeNull();
    expect(screen.queryByText("Toggle item")).not.toBeInTheDocument();
  });

  it("announces the unchecked state as text when read-only", () => {
    render(
      <CheckToggle
        checked={false}
        label="Toggle item"
        readOnly
        readOnlyStateLabel="Not completed"
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.getByText("Not completed").closest('[aria-hidden="true"]'),
    ).toBeNull();
    expect(screen.queryByText("Toggle item")).not.toBeInTheDocument();
  });

  it("ignores pending when read-only and exposes no busy state", () => {
    const { container } = render(
      <CheckToggle
        checked={false}
        label="Toggle item"
        pending
        readOnly
        readOnlyStateLabel="Not completed"
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("[aria-busy]")).toBeNull();
    expect(container.querySelector(".animate-spin, .motion-safe\\:animate-spin")).toBeNull();
    expect(screen.getByText("Not completed")).toBeInTheDocument();
  });

  it("keeps a 44×44 target for the toggle and the read-only state", () => {
    const { container, rerender } = render(
      <CheckToggle checked={false} label="Toggle item" readOnlyStateLabel="Not completed" onToggle={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Toggle item" })).toHaveClass("h-11", "w-11");

    rerender(<CheckToggle checked={false} label="Toggle item" readOnly readOnlyStateLabel="Not completed" />);

    expect(container.firstElementChild).toHaveClass("h-11", "w-11");
  });

  describe('size="large"', () => {
    it("keeps the label, pressed state and 44×44 target", async () => {
      const user = userEvent.setup();
      const onToggle = vi.fn();
      render(
        <CheckToggle
          checked
          label="Toggle item"
          readOnlyStateLabel="Completed"
          size="large"
          onToggle={onToggle}
        />,
      );

      const toggle = screen.getByRole("button", { name: "Toggle item" });
      expect(toggle).toHaveAttribute("aria-pressed", "true");
      expect(toggle).toHaveClass("h-11", "w-11");

      await user.click(toggle);
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("announces the state as text when read-only", () => {
      render(
        <CheckToggle
          checked={false}
          label="Toggle item"
          readOnly
          readOnlyStateLabel="Not completed"
          size="large"
        />,
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.getByText("Not completed").closest('[aria-hidden="true"]')).toBeNull();
    });
  });
});

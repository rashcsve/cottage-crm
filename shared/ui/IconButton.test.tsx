import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Trash2 } from "lucide-react";

import { IconButton } from "./IconButton";

describe("IconButton", () => {
  it("exposes its aria-label as the accessible name and hides the icon", () => {
    render(
      <IconButton type="button" aria-label="Delete note">
        <Trash2 aria-hidden="true" data-testid="icon" />
      </IconButton>,
    );

    expect(
      screen.getByRole("button", { name: "Delete note" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toHaveAttribute("aria-hidden", "true");
  });

  it.each(["default", "compact"] as const)(
    "renders a button for the %s size",
    (size) => {
      render(
        <IconButton size={size} aria-label="Close">
          <Trash2 aria-hidden="true" />
        </IconButton>,
      );

      expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    },
  );

  it("calls onClick when activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Delete note" onClick={onClick}>
        <Trash2 aria-hidden="true" />
      </IconButton>,
    );

    await user.click(screen.getByRole("button", { name: "Delete note" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <IconButton aria-label="Delete note" disabled onClick={onClick}>
        <Trash2 aria-hidden="true" />
      </IconButton>,
    );

    const button = screen.getByRole("button", { name: "Delete note" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });
});

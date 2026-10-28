import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button, buttonVariants } from "./Button";

describe("Button", () => {
  it("renders a button exposing its children as the accessible name", () => {
    render(<Button type="button">Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "button",
    );
  });

  it("calls onClick when activated", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it("forwards aria attributes and an explicit aria-label", () => {
    render(
      <Button aria-label="Add item" aria-controls="composer" aria-expanded>
        +
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toHaveAttribute("aria-controls", "composer");
    expect(button).toHaveAttribute("aria-expanded", "true");
  });

  it("renders the secondary variant as a regular button", () => {
    render(<Button variant="secondary">Cancel</Button>);

    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
  });

  it("renders a block button that keeps its name, className and disabled state", () => {
    render(
      <Button block disabled className="extra">
        Continue
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Continue" });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("extra", "w-full");
  });
});

describe("buttonVariants", () => {
  it("returns a class string for links styled as buttons", () => {
    expect(typeof buttonVariants()).toBe("string");
    expect(typeof buttonVariants("secondary", "extra")).toBe("string");
  });
});

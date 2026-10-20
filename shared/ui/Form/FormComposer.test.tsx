import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";

import { FormComposer, FormSubmitBar } from "./FormComposer";

type ComposerProps = ComponentProps<typeof FormComposer>;

function renderComposer(overrides: Partial<ComposerProps> = {}) {
  const props: ComposerProps = {
    id: "new-note-composer",
    titleId: "new-note-title",
    title: "New note",
    closeLabel: "Close",
    onClose: vi.fn(),
    children: <input aria-label="Content" />,
    ...overrides,
  };

  render(<FormComposer {...props} />);

  return props;
}

describe("FormComposer", () => {
  it("renders a region labelled by its h2 title", () => {
    renderComposer();

    const region = screen.getByRole("region", { name: "New note" });
    expect(region).toHaveAttribute("id", "new-note-composer");
    expect(region).toHaveAttribute("aria-labelledby", "new-note-title");
    expect(
      screen.getByRole("heading", { level: 2, name: "New note" }),
    ).toHaveAttribute("id", "new-note-title");
  });

  it("renders children, eyebrow, description and header content", () => {
    renderComposer({
      eyebrow: "Notes",
      description: "Share something with the family.",
      headerContent: <p>Header extra</p>,
    });

    expect(screen.getByText("Notes")).toBeInTheDocument();
    expect(
      screen.getByText("Share something with the family."),
    ).toBeInTheDocument();
    expect(screen.getByText("Header extra")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Content" })).toBeInTheDocument();
  });

  it("is not busy by default", () => {
    renderComposer();

    expect(screen.getByRole("region", { name: "New note" })).toHaveAttribute(
      "aria-busy",
      "false",
    );
  });

  it("renders a close button with a visible label and aria wiring", async () => {
    const user = userEvent.setup();
    const props = renderComposer({
      closeAriaControls: "new-note-composer",
      closeAriaExpanded: true,
    });

    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toHaveAttribute("type", "button");
    expect(close).toHaveAttribute("aria-controls", "new-note-composer");
    expect(close).toHaveAttribute("aria-expanded", "true");

    await user.click(close);
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("marks the region busy and disables close while busy", async () => {
    const user = userEvent.setup();
    const props = renderComposer({ isBusy: true });

    expect(screen.getByRole("region", { name: "New note" })).toHaveAttribute(
      "aria-busy",
      "true",
    );

    const close = screen.getByRole("button", { name: "Close" });
    expect(close).toBeDisabled();

    await user.click(close);
    expect(props.onClose).not.toHaveBeenCalled();
  });
});

describe("FormSubmitBar", () => {
  it("renders the hint and its children", () => {
    render(
      <FormSubmitBar hint="Everyone in the family will see it.">
        <button type="submit">Save</button>
      </FormSubmitBar>,
    );

    expect(
      screen.getByText("Everyone in the family will see it."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute(
      "type",
      "submit",
    );
  });
});

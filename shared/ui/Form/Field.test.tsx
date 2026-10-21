import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { TextAreaField, TextField } from "./Field";

function getDecorativeIcon(element: HTMLElement) {
  return element.querySelector('svg[aria-hidden="true"]');
}

describe("TextField", () => {
  it("labels the input and hides the required marker from assistive tech", () => {
    render(<TextField id="title" label="Title" required />);

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveAttribute("id", "title");
    expect(input).toBeRequired();
    expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
  });

  it("is valid and has no alert or description without error or hint", () => {
    render(<TextField id="title" label="Title" />);

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveAttribute("aria-invalid", "false");
    expect(input).not.toHaveAttribute("aria-describedby");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("describes the input with its hint", () => {
    render(<TextField id="title" label="Title" hint="Keep it short." />);

    expect(screen.getByRole("textbox", { name: "Title" })).toHaveAccessibleDescription(
      "Keep it short.",
    );
  });

  it("marks the input invalid and announces the error with an icon and text", () => {
    render(
      <TextField
        id="title"
        label="Title"
        error="Title is required"
        hint="Keep it short."
        aria-describedby="external"
      />,
    );

    const input = screen.getByRole("textbox", { name: "Title" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute(
      "aria-describedby",
      "external title-error title-hint",
    );

    const alert = screen.getByRole("alert");
    expect(alert).toHaveAttribute("id", "title-error");
    expect(alert).toHaveTextContent("Title is required");
    expect(getDecorativeIcon(alert)).not.toBeNull();
  });

  it("renders footer content next to the messages", () => {
    render(<TextField id="title" label="Title" footer={<span>0/100</span>} />);

    expect(screen.getByText("0/100")).toBeInTheDocument();
  });
});

describe("TextAreaField", () => {
  it("labels the textarea and announces the error with an icon and text", () => {
    render(
      <TextAreaField id="content" label="Content" required error="Too long" />,
    );

    const textarea = screen.getByRole("textbox", { name: "Content" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toBeRequired();
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(textarea).toHaveAccessibleDescription("Too long");

    const alert = screen.getByRole("alert");
    expect(within(alert).getByText("Too long")).toBeInTheDocument();
    expect(getDecorativeIcon(alert)).not.toBeNull();
  });
});

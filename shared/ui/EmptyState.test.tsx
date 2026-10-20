import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the title as an h3 by default with the description", () => {
    render(<EmptyState title="No notes" description="Write the first one." />);

    expect(
      screen.getByRole("heading", { level: 3, name: "No notes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Write the first one.")).toBeInTheDocument();
  });

  it.each([
    ["h2", 2],
    ["h4", 4],
  ] as const)("renders the title as %s when titleTag is set", (titleTag, level) => {
    render(
      <EmptyState
        title="No notes"
        description="Write the first one."
        titleTag={titleTag}
      />,
    );

    expect(screen.getByRole("heading", { level, name: "No notes" })).toBeInTheDocument();
  });

  it("renders the action when provided", () => {
    render(
      <EmptyState
        title="No notes"
        description="Write the first one."
        action={<button type="button">Add note</button>}
      />,
    );

    expect(screen.getByRole("button", { name: "Add note" })).toBeInTheDocument();
  });

  it("renders no action when none is provided", () => {
    render(<EmptyState title="No notes" description="Write the first one." />);

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

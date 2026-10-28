import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PendingSubmitButton } from "./PendingSubmitButton";

describe("PendingSubmitButton", () => {
  it("is an enabled submit button named by its label when idle", () => {
    render(
      <PendingSubmitButton
        isPending={false}
        label="Add"
        pendingLabel="Saving…"
        className="col-start-2"
      />,
    );

    const button = screen.getByRole("button", { name: "Add" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toBeEnabled();
    expect(button).toHaveClass("col-start-2");
  });

  it("is disabled and named by the pending label while pending", () => {
    render(
      <PendingSubmitButton isPending label="Add" pendingLabel="Saving…" />,
    );

    const button = screen.getByRole("button", { name: "Saving…" });
    expect(button).toBeDisabled();
  });

  it("keeps both labels rendered so the width does not change", () => {
    const { rerender } = render(
      <PendingSubmitButton
        isPending={false}
        label="Add"
        pendingLabel="Saving…"
      />,
    );

    expect(screen.getByText("Saving…")).toHaveClass("invisible");
    expect(screen.getByText("Add")).not.toHaveClass("invisible");

    rerender(
      <PendingSubmitButton isPending label="Add" pendingLabel="Saving…" />,
    );

    expect(screen.getByText("Add")).toHaveClass("invisible");
    expect(screen.getByText("Saving…")).not.toHaveClass("invisible");
  });
});

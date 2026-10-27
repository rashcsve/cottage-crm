import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickAddPlaceholder } from "./QuickAddPlaceholder";

describe("QuickAddPlaceholder", () => {
  it("is hidden from assistive tech and exposes the given test id", () => {
    render(<QuickAddPlaceholder testId="shopping-quick-add-placeholder" />);

    expect(
      screen.getByTestId("shopping-quick-add-placeholder"),
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("renders only the input row by default", () => {
    render(<QuickAddPlaceholder testId="placeholder" />);

    expect(screen.getByTestId("placeholder").childElementCount).toBe(1);
  });

  it("adds a details row when requested", () => {
    render(<QuickAddPlaceholder testId="placeholder" withDetailsRow />);

    expect(screen.getByTestId("placeholder").childElementCount).toBe(2);
  });

  it("applies an extra class name", () => {
    render(<QuickAddPlaceholder testId="placeholder" className="py-3" />);

    expect(screen.getByTestId("placeholder")).toHaveClass("py-3");
  });
});

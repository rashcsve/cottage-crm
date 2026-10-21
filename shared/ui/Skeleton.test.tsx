import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("renders a placeholder hidden from assistive tech", () => {
    render(<Skeleton data-testid="skeleton" />);

    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toHaveAttribute("aria-hidden", "true");
    expect(skeleton).toBeEmptyDOMElement();
  });

  it("keeps caller sizing classes", () => {
    render(<Skeleton data-testid="skeleton" className="h-4 w-24" />);

    expect(screen.getByTestId("skeleton")).toHaveClass("h-4", "w-24");
  });
});

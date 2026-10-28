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
});

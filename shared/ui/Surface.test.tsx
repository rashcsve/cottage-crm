import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { Surface } from "./Surface";

describe("Surface", () => {
  it("renders its children", () => {
    render(
      <Surface>
        <p>Sheet content</p>
      </Surface>,
    );

    expect(screen.getByText("Sheet content")).toBeInTheDocument();
  });

  it("forwards id, role and aria attributes to the container", () => {
    render(
      <Surface id="presence" role="region" aria-label="Presence">
        <p>Sheet content</p>
      </Surface>,
    );

    const region = screen.getByRole("region", { name: "Presence" });
    expect(region).toHaveAttribute("id", "presence");
    expect(region).toContainElement(screen.getByText("Sheet content"));
  });
});

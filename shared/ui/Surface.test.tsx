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

  it("renders a div by default", () => {
    render(<Surface data-testid="sheet">Sheet content</Surface>);

    expect(screen.getByTestId("sheet").tagName).toBe("DIV");
  });

  it("renders as a labelled section landmark", () => {
    render(
      <Surface as="section" aria-labelledby="weather-title">
        <h2 id="weather-title">Weather</h2>
      </Surface>,
    );

    expect(
      screen.getByRole("region", { name: "Weather" }).tagName,
    ).toBe("SECTION");
  });

  it("renders as an article", () => {
    render(
      <Surface as="article" padding="none">
        <p>Note body</p>
      </Surface>,
    );

    expect(screen.getByRole("article")).toContainElement(
      screen.getByText("Note body"),
    );
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { TextLink } from "./TextLink";

describe("TextLink", () => {
  it("renders a link whose accessible name is its children", () => {
    render(<TextLink href="/notes">All notes</TextLink>);

    expect(screen.getByRole("link", { name: "All notes" })).toHaveAttribute(
      "href",
      "/notes",
    );
  });

  it("renders a trailing decorative icon hidden from assistive tech", () => {
    render(<TextLink href="/tasks">All to-dos</TextLink>);

    const link = screen.getByRole("link", { name: "All to-dos" });
    const icon = link.querySelector("svg");
    expect(icon).not.toBeNull();
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(link.lastElementChild).toBe(icon);
  });

  it("forwards aria attributes to the link", () => {
    render(
      <TextLink href="/shopping" aria-describedby="supplies-count">
        All supplies
      </TextLink>,
    );

    expect(screen.getByRole("link", { name: "All supplies" })).toHaveAttribute(
      "aria-describedby",
      "supplies-count",
    );
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { WordmarkLink } from "./WordmarkLink";

describe("WordmarkLink", () => {
  it("links to the given route and is named by the label, not the wordmark text", () => {
    render(<WordmarkLink href="/overview" label="Chata CRM" />);

    const link = screen.getByRole("link", { name: "Chata CRM" });
    expect(link).toHaveAttribute("href", "/overview");
    expect(link).toHaveTextContent("chata.");
  });

  it("hides the decorative accent dot from assistive technology", () => {
    render(<WordmarkLink href="/" label="Chata CRM" />);

    const dot = screen.getByText(".");
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });
});

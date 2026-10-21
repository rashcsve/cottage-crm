import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SectionHeader } from "./SectionHeader";
import { TextLink } from "./TextLink";

describe("SectionHeader", () => {
  it("renders the title as an h2 by default", () => {
    render(<SectionHeader title="Latest notes" />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Latest notes" }),
    ).toBeInTheDocument();
  });

  it("renders the title with the requested heading level and id", () => {
    render(<SectionHeader title="Open" titleTag="h3" titleId="open-title" />);

    expect(
      screen.getByRole("heading", { level: 3, name: "Open" }),
    ).toHaveAttribute("id", "open-title");
  });

  it("renders the eyebrow, description, badge and actions", () => {
    render(
      <SectionHeader
        title="Latest notes"
        eyebrow="At the cottage now"
        description="What the family wrote recently."
        badge={<span>3</span>}
        actions={<TextLink href="/notes">All notes</TextLink>}
      />,
    );

    expect(screen.getByText("At the cottage now")).toBeInTheDocument();
    expect(
      screen.getByText("What the family wrote recently."),
    ).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All notes" })).toHaveAttribute(
      "href",
      "/notes",
    );
  });

  it("omits the eyebrow and description when not given", () => {
    const { container } = render(<SectionHeader title="Latest notes" />);

    expect(container.querySelectorAll("p")).toHaveLength(0);
  });
});

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { PageHeader } from "./PageHeader";
import { PageLayout } from "./PageLayout";

describe("PageHeader", () => {
  it("renders the title as the page h1 inside a header", () => {
    render(<PageHeader title="Home" />);

    const heading = screen.getByRole("heading", { level: 1, name: "Home" });
    expect(screen.getByRole("banner")).toContainElement(heading);
  });

  it("renders the description, actions and extra content", () => {
    render(
      <PageHeader
        title="To-dos"
        description="Everything that needs doing at the cottage."
        actions={<button type="button">Add to-do</button>}
      >
        <nav aria-label="Filters" />
      </PageHeader>,
    );

    expect(
      screen.getByText("Everything that needs doing at the cottage."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Add to-do" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Filters" }),
    ).toBeInTheDocument();
  });

  it("omits the description when not given", () => {
    const { container } = render(<PageHeader title="Home" />);

    expect(container.querySelector("p")).toBeNull();
  });
});

describe("PageLayout", () => {
  it("renders the header before the page content", () => {
    render(
      <PageLayout
        title="Notes"
        description="Messages for the family."
        headerContent={<nav aria-label="Filters" />}
      >
        <p>Page body</p>
      </PageLayout>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Notes" });
    const body = screen.getByText("Page body");
    expect(
      heading.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByText("Messages for the family.")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Filters" }),
    ).toBeInTheDocument();
  });

  it("passes descriptionClassName through to the description", () => {
    render(
      <PageLayout
        title="Home"
        description="A quick read."
        descriptionClassName="lg:hidden"
      >
        <p>Page body</p>
      </PageLayout>,
    );

    expect(screen.getByText("A quick read.")).toHaveClass("lg:hidden");
  });
});

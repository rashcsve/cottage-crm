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
  it("renders the h1 before the page content", () => {
    render(
      <PageLayout title="Notes">
        <p>Page body</p>
      </PageLayout>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Notes" });
    const body = screen.getByText("Page body");
    expect(
      heading.compareDocumentPosition(body) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("keeps the header for screen readers only and renders no description", () => {
    const { container } = render(
      <PageLayout title="Home">
        <div>Page body</div>
      </PageLayout>,
    );

    const heading = screen.getByRole("heading", { level: 1, name: "Home" });
    const header = heading.closest("header");
    expect(header).toHaveClass("sr-only");
    expect(header?.querySelector("p")).toBeNull();
    expect(container.querySelector("p")).toBeNull();
  });
});

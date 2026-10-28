import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ComponentProps } from "react";

import { CollectionToolbar } from "./CollectionToolbar";

type Filter = "pending" | "purchased";
type ToolbarProps = ComponentProps<typeof CollectionToolbar<Filter>>;

function renderToolbar(overrides: Partial<ToolbarProps> = {}) {
  const props: ToolbarProps = {
    activeFilter: "pending",
    eyebrow: "Cottage",
    title: "Supplies",
    description: "What to bring next time.",
    totalCount: 5,
    filterItems: [
      { label: "To buy", value: 3, filter: "pending" },
      { label: "Bought", value: 2, filter: "purchased" },
    ],
    filterAriaLabel: "Supply filters",
    filterPathname: "/shopping",
    ...overrides,
  };

  return render(<CollectionToolbar<Filter> {...props} />);
}

describe("CollectionToolbar", () => {
  it("renders the eyebrow, h2 title, description and total count", () => {
    renderToolbar();

    expect(screen.getByText("Cottage")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Supplies" }),
    ).toBeInTheDocument();
    expect(screen.getByText("What to bring next time.")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders the filter navigation with the active filter marked", () => {
    renderToolbar();

    const nav = screen.getByRole("navigation", { name: "Supply filters" });
    expect(within(nav).getByRole("link", { name: "To buy (3)" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(
      within(nav).getByRole("link", { name: "Bought (2)" }),
    ).not.toHaveAttribute("aria-current");
  });

  it("exposes the total count through a stable test id for every tone", () => {
    const { rerender } = renderToolbar();

    expect(screen.getByTestId("collection-toolbar-total")).toHaveTextContent(
      /^5$/,
    );

    rerender(
      <CollectionToolbar<Filter>
        activeFilter="pending"
        title="Supplies"
        description="What to bring next time."
        totalCount={7}
        filterItems={[]}
        filterAriaLabel="Supply filters"
        filterPathname="/shopping"
        countTone="warning"
      />,
    );

    expect(screen.getByTestId("collection-toolbar-total")).toHaveTextContent(
      /^7$/,
    );
  });

  it("renders a neutral total count without an icon by default", () => {
    renderToolbar();

    const count = screen.getByText("5");
    expect(count).toHaveClass("text-ink-muted");
    expect(count.querySelector("svg")).toBeNull();
  });

  it("renders a success total count with the success tone and a decorative icon", () => {
    renderToolbar({ countTone: "success" });

    const label = screen.getByText("5").parentElement;
    expect(label).toHaveClass("text-success");
    expect(label?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders a danger total count with the danger tone and a decorative icon", () => {
    renderToolbar({ countTone: "danger" });

    const label = screen.getByText("5").parentElement;
    expect(label).toHaveClass("text-danger");
    expect(label?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("renders without an eyebrow", () => {
    renderToolbar({ eyebrow: undefined });

    expect(screen.queryByText("Cottage")).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Supplies" }),
    ).toBeInTheDocument();
  });

  it("renders without a description", () => {
    renderToolbar({ description: undefined });

    expect(
      screen.queryByText("What to bring next time."),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Supplies" }),
    ).toBeInTheDocument();
  });

  it("puts the given title id on the h2 so other regions can be labelled by it", () => {
    renderToolbar({ titleId: "supplies-heading" });

    expect(
      screen.getByRole("heading", { level: 2, name: "Supplies" }),
    ).toHaveAttribute("id", "supplies-heading");
  });

  it("renders no primary action button when none is provided", () => {
    renderToolbar();

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("keeps side and bottom padding but no top padding so it sits flush with the page top", () => {
    const { container } = renderToolbar();

    const header = container.querySelector("header");
    expect(header).toHaveClass("px-3.5", "pb-3.5", "sm:px-4", "sm:pb-4");
    expect(header).not.toHaveClass("p-3.5");
    expect(header).not.toHaveClass("sm:p-4");
  });
});

import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import { ShoppingGroup } from "./ShoppingGroup";

vi.mock("@/features/shopping/components/ShoppingList", () => ({
  ShoppingList: ({
    items,
    leadingRow,
  }: {
    items: ShoppingItem[];
    leadingRow?: React.ReactNode;
  }) => (
    <>
      {leadingRow}
      <ul data-testid="shopping-list">
        {items.map((item) => (
          <li key={item.id}>{item.title}</li>
        ))}
      </ul>
    </>
  ),
}));

function createShoppingItems(count: number): ShoppingItem[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    title: `Item ${index + 1}`,
    isChecked: false,
    author: "Alice Johnson",
    authorId: "admin-user-id",
    broughtBy: null,
    broughtById: null,
    createdAt: "2026-04-01T10:00:00.000Z",
  }));
}

const HEADING_ID = "shopping-group-heading";

const baseProps = {
  headingId: HEADING_ID,
  onDelete: vi.fn(),
  canManageItems: true,
};

function PageHeading() {
  return <h2 id={HEADING_ID}>To buy</h2>;
}

describe("ShoppingGroup", () => {
  it("renders a section named by the page heading with the items inside", () => {
    render(
      <>
        <PageHeading />
        <ShoppingGroup {...baseProps} view="pending" items={createShoppingItems(2)} />
      </>,
    );

    const section = screen.getByRole("region", { name: "To buy" });

    expect(within(section).getByTestId("shopping-list").children).toHaveLength(2);
  });

  it("passes the leading row into the list inside the section", () => {
    render(
      <>
        <PageHeading />
        <ShoppingGroup
          {...baseProps}
          view="pending"
          items={createShoppingItems(1)}
          leadingRow={<div data-testid="leading-row" />}
        />
      </>,
    );

    const section = screen.getByRole("region", { name: "To buy" });

    expect(within(section).getByTestId("leading-row")).toBeInTheDocument();
  });

  it("does not repeat the toolbar heading, eyebrow or count", () => {
    render(
      <ShoppingGroup {...baseProps} view="purchased" items={createShoppingItems(3)} />,
    );

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByText("3")).not.toBeInTheDocument();
  });
});

import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import { ShoppingList } from "./ShoppingList";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { ShoppingItem } from "@/features/shopping/types/shopping";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/shopping/components/ShoppingItem", () => ({
  ShoppingItem: ({
    item,
    onDelete,
  }: {
    item: ShoppingItem;
    view: "pending" | "purchased";
    canManageItems: boolean;
    onDelete: (item: ShoppingItem) => void;
  }) => (
    <li data-testid={`shopping-item-${item.id}`}>
      <span>{item.title}</span>
      <button type="button" onClick={() => onDelete(item)}>
        Delete
      </button>
    </li>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

function createShoppingItem(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: 1,
    title: "Milk",
    isChecked: false,
    author: "Alice Johnson",
    authorId: "admin-user-id",
    broughtBy: null,
    broughtById: null,
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function renderShoppingList(
  props: Partial<React.ComponentProps<typeof ShoppingList>> = {}
) {
  return render(
    <ShoppingList
      items={[]}
      onDelete={vi.fn()}
      canManageItems
      emptyTitle={undefined}
      view="pending"
      {...props}
    />
  );
}

describe("ShoppingList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders default translated empty state", () => {
    renderShoppingList({ items: [] });

    expect(
      screen.getByRole("heading", { name: "shopping.empty.pending.title" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("shopping.empty.pending.description")
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "shopping.empty.pending.title"
    );
  });

  it("renders the bought empty state when requested", () => {
    renderShoppingList({ items: [], view: "purchased" });

    expect(
      screen.getByRole("heading", { name: "shopping.empty.purchased.title" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("shopping.empty.purchased.description")
    ).toBeInTheDocument();
  });

  it("renders the leading row above the empty state", () => {
    renderShoppingList({
      items: [],
      leadingRow: <div data-testid="leading-row" />,
    });

    const leadingRow = screen.getByTestId("leading-row");
    const emptyHeading = screen.getByRole("heading", {
      name: "shopping.empty.pending.title",
    });

    expect(
      leadingRow.compareDocumentPosition(emptyHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("renders the leading row as the first row above the items", () => {
    renderShoppingList({
      items: [createShoppingItem({ id: 1, title: "Milk" })],
      leadingRow: <div data-testid="leading-row" />,
    });

    const leadingRow = screen.getByTestId("leading-row");

    expect(
      leadingRow.compareDocumentPosition(screen.getByTestId("shopping-item-1")) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("passes the clicked item to onDelete and keeps rendering the given items", () => {
    const onDelete = vi.fn();
    const item = createShoppingItem({ id: 1, title: "Milk" });

    renderShoppingList({ items: [item], onDelete });

    fireEvent.click(
      within(screen.getByTestId("shopping-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(onDelete).toHaveBeenCalledWith(item);
    expect(screen.getByTestId("shopping-item-1")).toBeInTheDocument();
  });

  it("renders updated items when props change", () => {
    const { rerender } = renderShoppingList({
      items: [createShoppingItem({ id: 1, title: "Milk" })],
    });

    expect(screen.getByText("Milk")).toBeInTheDocument();

    rerender(
      <ShoppingList
        items={[
          createShoppingItem({ id: 2, title: "Bread" }),
          createShoppingItem({ id: 3, title: "Butter" }),
        ]}
        onDelete={vi.fn()}
        canManageItems
        view="pending"
      />
    );

    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Butter")).toBeInTheDocument();
  });
});

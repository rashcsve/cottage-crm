import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { ShoppingItem } from "./ShoppingItem";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { ShoppingItem as ShoppingItemType } from "@/features/shopping/types/shopping";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  toggleShoppingItemAction: vi.fn(),
}));

vi.mock("@/features/shopping/shared/formatShoppingDate", () => ({
  formatShoppingTimestamp: (timestamp: string) => `formatted:${timestamp}`,
  formatShoppingShortDate: (timestamp: string) => `short:${timestamp}`,
}));

vi.mock("@/shared/ui/StatusLabel", () => ({
  StatusLabel: ({
    children,
    icon,
  }: {
    children: ReactNode;
    icon?: { displayName?: string };
  }) => (
    <span data-testid="shopping-brought-status" data-icon={icon?.displayName}>
      {children}
    </span>
  ),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);

function createShoppingItem(
  overrides: Partial<ShoppingItemType> = {},
): ShoppingItemType {
  return {
    id: 1,
    title: "Milk",
    isChecked: true,
    author: "Alice Johnson",
    authorId: "admin-user-id",
    broughtBy: "Alice Johnson",
    broughtById: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("ShoppingItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
    mockUseRouter.mockReturnValue({
      refresh: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    mockUseToast.mockReturnValue({
      error: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);
  });

  it("announces the brought state as text instead of a check toggle in the purchased view", () => {
    render(
      <ShoppingItem
        item={createShoppingItem()}
        view="purchased"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "shopping.aria.unmarkAsResolved" }),
    ).not.toBeInTheDocument();

    const stateText = screen.getByText("shopping.item.stateBrought");
    expect(stateText.closest('[aria-hidden="true"]')).toBeNull();

    expect(
      screen.getByRole("button", { name: "shopping.aria.returnItemToList" }),
    ).toBeInTheDocument();
  });

  it("renders a check toggle in the pending view when the user can manage items", () => {
    render(
      <ShoppingItem
        item={createShoppingItem({ isChecked: false, broughtBy: null, broughtById: null })}
        view="pending"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "shopping.aria.markAsResolved" }),
    ).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByText("shopping.item.stateMissing")).not.toBeInTheDocument();
  });

  it("titles the row as a level-3 heading under the toolbar heading", () => {
    render(
      <ShoppingItem
        item={createShoppingItem({ isChecked: false, broughtBy: null, broughtById: null })}
        view="pending"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Milk" }),
    ).toBeInTheDocument();
  });

  it("shows who added a pending item and when", () => {
    render(
      <ShoppingItem
        item={createShoppingItem({ isChecked: false, broughtBy: null, broughtById: null })}
        view="pending"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("shopping.item.addedBy")).toBeInTheDocument();
    const date = screen.getByText("short:2026-04-01T10:00:00.000Z");
    expect(date).toHaveAttribute("dateTime", "2026-04-01T10:00:00.000Z");
    expect(date).toHaveAttribute("title", "formatted:2026-04-01T10:00:00.000Z");
    expect(screen.queryByTestId("shopping-brought-status")).not.toBeInTheDocument();
  });

  it("shows the author's name visibly and keeps the full added-by text for screen readers", () => {
    render(
      <ShoppingItem
        item={createShoppingItem({ isChecked: false, broughtBy: null, broughtById: null })}
        view="pending"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("shopping.item.addedBy")).toHaveClass("sr-only");
    expect(screen.getByText("Alice Johnson")).toHaveAttribute("aria-hidden", "true");
  });

  it("marks a bought item with a check and who brought it", () => {
    render(
      <ShoppingItem
        item={createShoppingItem()}
        view="purchased"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    const brought = screen.getByTestId("shopping-brought-status");
    expect(brought).toHaveTextContent("shopping.item.broughtBy");
    expect(brought).toHaveAttribute("data-icon", "Check");
    expect(screen.queryByText("shopping.item.addedBy")).not.toBeInTheDocument();
  });

  it("falls back to a plain brought label when the buyer is unknown", () => {
    render(
      <ShoppingItem
        item={createShoppingItem({ broughtBy: null, broughtById: null })}
        view="purchased"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    const brought = screen.getByTestId("shopping-brought-status");
    expect(brought).toHaveTextContent("shopping.item.stateBrought");
    expect(brought).toHaveAttribute("data-icon", "Check");
    expect(screen.queryByText("shopping.item.broughtBy")).not.toBeInTheDocument();
  });

  it("keeps the delete action keyboard-reachable and reveals it on focus", async () => {
    const user = userEvent.setup();

    render(
      <ShoppingItem
        item={createShoppingItem({ isChecked: false, broughtBy: null, broughtById: null })}
        view="pending"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    await user.tab();
    await user.tab();

    const deleteButton = screen.getByRole("button", {
      name: "shopping.aria.deleteItem",
    });
    expect(deleteButton).toHaveFocus();
    expect(deleteButton.parentElement).toHaveClass("group-focus-within:opacity-100");
  });

  it("keeps the return and delete actions keyboard-reachable in the purchased view", async () => {
    const user = userEvent.setup();

    render(
      <ShoppingItem
        item={createShoppingItem()}
        view="purchased"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    await user.tab();
    expect(
      screen.getByRole("button", { name: "shopping.aria.returnItemToList" }),
    ).toHaveFocus();

    await user.tab();
    expect(
      screen.getByRole("button", { name: "shopping.aria.deleteItem" }),
    ).toHaveFocus();
  });

  it("only hides the actions on hover-capable devices", () => {
    render(
      <ShoppingItem
        item={createShoppingItem()}
        view="purchased"
        canManageItems
        onDelete={vi.fn()}
      />,
    );

    const actions = screen.getByRole("button", {
      name: "shopping.aria.deleteItem",
    }).parentElement;
    expect(actions).not.toHaveClass("opacity-0");
    expect(actions).toHaveClass("[@media(hover:hover)]:opacity-0");
  });

  it("renders no actions for a viewer", () => {
    render(
      <ShoppingItem
        item={createShoppingItem()}
        view="purchased"
        canManageItems={false}
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

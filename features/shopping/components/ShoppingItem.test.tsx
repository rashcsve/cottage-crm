import { render, screen } from "@testing-library/react";
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
});

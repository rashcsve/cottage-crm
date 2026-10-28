import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import type { ShoppingPageData } from "@/features/shopping/types/shopping";
import { dynamicLoads } from "@/tests/utils/spied-dynamic";
import { ShoppingPageBody } from "./ShoppingPageBody";

vi.mock("next/dynamic", async () => {
  const { createSpiedDynamic } = await import("@/tests/utils/spied-dynamic");

  return createSpiedDynamic();
});

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string) => `${prefix}${key}`;
  }),
}));

vi.mock("@/features/shopping/components/forms/ShoppingQuickAdd", () => ({
  ShoppingQuickAdd: () => <div data-testid="shopping-quick-add" />,
}));

vi.mock("@/features/shopping/components/ShoppingGroup", () => ({
  ShoppingGroup: ({ leadingRow }: { leadingRow?: React.ReactNode }) => (
    <>{leadingRow}</>
  ),
}));

vi.mock("@/features/shopping/components/ShoppingToolbar", () => ({
  ShoppingToolbar: () => null,
}));

vi.mock("@/features/shopping/server/actions", () => ({
  deleteShoppingItemAction: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/shared/Toast/useToast", () => {
  const toastApi = {
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };

  return { useToast: () => toastApi };
});

function createData(canManage: boolean): ShoppingPageData {
  return {
    pendingItems: [],
    purchasedItems: [],
    pendingCount: 0,
    purchasedCount: 0,
    totalCount: 0,
    canManage,
  };
}

describe("ShoppingPageBody quick-add loading", () => {
  it("never requests the quick-add chunk for viewers", () => {
    render(<ShoppingPageBody activeFilter="pending" data={createData(false)} />);

    expect(dynamicLoads.loader).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("shopping-quick-add-placeholder")
    ).not.toBeInTheDocument();
  });

  it("shows an input-shaped placeholder for admins until the chunk arrives", async () => {
    dynamicLoads.hold();

    render(<ShoppingPageBody activeFilter="pending" data={createData(true)} />);

    const placeholder = screen.getByTestId("shopping-quick-add-placeholder");

    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByTestId("shopping-quick-add")).not.toBeInTheDocument();
    expect(dynamicLoads.loader).toHaveBeenCalledTimes(1);

    await act(async () => {
      dynamicLoads.release();
    });

    expect(await screen.findByTestId("shopping-quick-add")).toBeInTheDocument();
    expect(
      screen.queryByTestId("shopping-quick-add-placeholder")
    ).not.toBeInTheDocument();
  });
});

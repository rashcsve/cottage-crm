import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "@/i18n/navigation";
import { toggleShoppingItemAction } from "@/features/shopping/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { ShoppingToggleButton } from "./ShoppingToggleButton";
import type { ShoppingItem } from "@/features/shopping/types/shopping";

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  toggleShoppingItemAction: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockToggleShoppingItemAction = vi.mocked(toggleShoppingItemAction);

function createShoppingItem(
  overrides: Partial<ShoppingItem> = {},
): ShoppingItem {
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

describe("ShoppingToggleButton", () => {
  const refresh = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh,
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    mockUseToast.mockReturnValue({
      toasts: [],
      showToast: vi.fn(),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: showError,
    } as unknown as ReturnType<typeof useToast>);

    mockToggleShoppingItemAction.mockResolvedValue({
      ok: true,
      data: undefined,
      message: "shopping.toggle.success",
    });
  });

  it("refreshes the route after a successful toggle", async () => {
    const user = userEvent.setup();

    render(
      <ShoppingToggleButton
        item={createShoppingItem()}
        ariaLabel="Toggle item"
        errorMessage="Toggle failed"
        canManageItems
      />,
    );

    await user.click(screen.getByRole("button", { name: "Toggle item" }));

    await waitFor(() => {
      expect(mockToggleShoppingItemAction).toHaveBeenCalledWith({
        itemId: 1,
        isChecked: false,
      });
    });

    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("shows an error toast and skips refresh when the toggle fails", async () => {
    const user = userEvent.setup();

    mockToggleShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.toggle.error",
    });

    render(
      <ShoppingToggleButton
        item={createShoppingItem()}
        ariaLabel="Toggle item"
        errorMessage="Toggle failed"
        canManageItems
      />,
    );

    await user.click(screen.getByRole("button", { name: "Toggle item" }));

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith("shopping.toggle.error");
    });

    expect(refresh).not.toHaveBeenCalled();
  });

  it("renders a visible return action in action mode and refreshes when clicked", async () => {
    const user = userEvent.setup();

    render(
      <ShoppingToggleButton
        item={createShoppingItem({ isChecked: true, broughtBy: "Alice Johnson" })}
        ariaLabel="Return item to list"
        errorMessage="Toggle failed"
        canManageItems
        variant="action"
        label="Return to list"
      />
    );

    await user.click(screen.getByRole("button", { name: "Return item to list" }));

    await waitFor(() => {
      expect(mockToggleShoppingItemAction).toHaveBeenCalledWith({
        itemId: 1,
        isChecked: true,
      });
    });

    expect(screen.getByRole("button", { name: "Return item to list" })).toHaveTextContent(
      "Return to list"
    );
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});

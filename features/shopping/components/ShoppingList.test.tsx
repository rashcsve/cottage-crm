import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteShoppingItemAction } from "@/features/shopping/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useToast } from "@/shared/Toast/useToast";
import { ShoppingList } from "./ShoppingList";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { ShoppingItem } from "@/features/shopping/types/shopping";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  deleteShoppingItemAction: vi.fn(),
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
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteShoppingItemAction = vi.mocked(deleteShoppingItemAction);

type MockRouter = {
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

type MockToastApi = {
  toasts: [];
  showToast: ReturnType<typeof vi.fn>;
  dismissToast: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

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
      canManageItems
      emptyTitle={undefined}
      view="pending"
      {...props}
    />
  );
}

function getUndoHandler(toastApi: MockToastApi): () => void {
  const lastCall = toastApi.showToast.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("Expected showToast to be called.");
  }

  const [, options] = lastCall;
  const action = options?.action;

  if (!action || typeof action.onClick !== "function") {
    throw new Error("Expected undo action in toast options.");
  }

  return action.onClick;
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

async function advanceUndoWindow() {
  await act(async () => {
    vi.advanceTimersByTime(TOAST_UNDO_WINDOW_MS);
    await flushAsyncWork();
  });
}

describe("ShoppingList", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    mockRouter = {
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    mockToastApi = {
      toasts: [],
      showToast: vi.fn(() => "toast-1"),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    mockUseRouter.mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>
    );

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>
    );

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });

    mockDeleteShoppingItemAction.mockResolvedValue({
      ok: true,
      data: undefined,
      message: "shopping.delete.success",
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders default translated empty state", () => {
    renderShoppingList({ items: [] });

    expect(screen.getByText("shopping.empty.pending.title")).toBeInTheDocument();
    expect(
      screen.getByText("shopping.empty.pending.description")
    ).toBeInTheDocument();
  });

  it("renders the bought empty state when requested", () => {
    renderShoppingList({ items: [], view: "purchased" });

    expect(screen.getByText("shopping.empty.purchased.title")).toBeInTheDocument();
    expect(
      screen.getByText("shopping.empty.purchased.description")
    ).toBeInTheDocument();
  });

  it("removes an item immediately and shows undo toast", () => {
    vi.useFakeTimers();
    const items = [createShoppingItem({ id: 1, title: "Milk" })];

    renderShoppingList({ items });

    fireEvent.click(
      within(screen.getByTestId("shopping-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(screen.queryByTestId("shopping-item-1")).not.toBeInTheDocument();
    expect(mockToastApi.showToast).toHaveBeenCalledWith(
      "shopping.delete.success",
      expect.objectContaining({
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: expect.objectContaining({
          label: "shopping.delete.undo",
          onClick: expect.any(Function),
        }),
      })
    );
  });

  it("restores an item when undo is clicked before timeout", () => {
    vi.useFakeTimers();
    const items = [
      createShoppingItem({ id: 1, title: "Milk" }),
      createShoppingItem({ id: 2, title: "Bread" }),
    ];

    renderShoppingList({ items });

    fireEvent.click(
      within(screen.getByTestId("shopping-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    const undo = getUndoHandler(mockToastApi);

    act(() => {
      undo();
    });

    expect(screen.getByTestId("shopping-item-1")).toBeInTheDocument();
    expect(mockDeleteShoppingItemAction).not.toHaveBeenCalled();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.info).toHaveBeenCalledWith("shopping.delete.restored");
  });

  it("commits delete after the undo window expires", async () => {
    vi.useFakeTimers();
    const item = createShoppingItem({ id: 1, title: "Milk" });

    renderShoppingList({ items: [item] });

    fireEvent.click(
      within(screen.getByTestId("shopping-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(mockDeleteShoppingItemAction).toHaveBeenCalledWith({ itemId: 1 });
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("restores item and shows error toast when delete fails", async () => {
    vi.useFakeTimers();
    const item = createShoppingItem({ id: 1, title: "Milk" });

    mockDeleteShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.delete.error",
    });

    renderShoppingList({ items: [item] });

    fireEvent.click(
      within(screen.getByTestId("shopping-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(screen.getByTestId("shopping-item-1")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("shopping.delete.error");
    expect(mockRouter.refresh).not.toHaveBeenCalled();
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
        canManageItems
        view="pending"
      />
    );

    expect(screen.queryByText("Milk")).not.toBeInTheDocument();
    expect(screen.getByText("Bread")).toBeInTheDocument();
    expect(screen.getByText("Butter")).toBeInTheDocument();
  });
});

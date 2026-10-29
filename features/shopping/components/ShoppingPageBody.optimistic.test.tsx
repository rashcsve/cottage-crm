import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { deleteShoppingItemAction } from "@/features/shopping/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import type {
  ShoppingFilter,
  ShoppingItem,
  ShoppingPageData,
} from "@/features/shopping/types/shopping";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { ShoppingPageBody } from "./ShoppingPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
  Link: ({
    href: _href,
    children,
    ...props
  }: {
    href: unknown;
    children: React.ReactNode;
  }) => (
    <a href="#" {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  deleteShoppingItemAction: vi.fn(),
  toggleShoppingItemAction: vi.fn(),
}));

vi.mock("@/features/shopping/components/forms/ShoppingQuickAdd", () => ({
  ShoppingQuickAdd: () => <div data-testid="shopping-quick-add" />,
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteShoppingItemAction = vi.mocked(deleteShoppingItemAction);

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

const TODAY_ISO = "2026-04-01";

const milk = createShoppingItem({ id: 1, title: "Milk" });
const bread = createShoppingItem({
  id: 2,
  title: "Bread",
  createdAt: "2026-03-30T10:00:00.000Z",
});
const butter = createShoppingItem({ id: 4, title: "Butter" });
const eggs = createShoppingItem({
  id: 3,
  title: "Eggs",
  isChecked: true,
  broughtBy: "Bob",
  broughtById: "bob-id",
});

function createData(overrides: Partial<ShoppingPageData> = {}): ShoppingPageData {
  const pendingItems = overrides.pendingItems ?? [milk, bread];
  const purchasedItems = overrides.purchasedItems ?? [eggs];

  return {
    pendingItems,
    purchasedItems,
    pendingCount: pendingItems.length,
    purchasedCount: purchasedItems.length,
    totalCount: pendingItems.length + purchasedItems.length,
    canManage: true,
    todayIso: TODAY_ISO,
    ...overrides,
  };
}

function renderBody(
  activeFilter: ShoppingFilter = "pending",
  data: ShoppingPageData = createData(),
) {
  return render(<ShoppingPageBody activeFilter={activeFilter} data={data} />);
}

function clickDelete(title: string) {
  const row = screen
    .getByRole("heading", { level: 3, name: title })
    .closest("li");

  if (!row) {
    throw new Error(`Expected a row for "${title}".`);
  }

  fireEvent.click(
    within(row).getByRole("button", { name: "shopping.aria.deleteItem" }),
  );
}

function switchLink(filter: ShoppingFilter, value: number) {
  return screen.queryByRole("link", {
    name: `shopping.switch.${filter} ${value} shopping.switch.countUnit:${value}`,
  });
}

function summaryText() {
  return screen.getByText(/^shopping\.summary\./).textContent;
}

const SUMMARY_TWO_PENDING = "shopping.summary.toBuy:2 · shopping.summary.addedToday:1";
const SUMMARY_ONE_PENDING_NOT_TODAY = "shopping.summary.toBuy:1";

function rowTitles(filter: ShoppingFilter) {
  const region = screen.getByRole("region", {
    name: `shopping.sections.${filter}.title`,
  });

  return within(region)
    .queryAllByRole("listitem")
    .map(
      (row) => within(row).getByRole("heading", { level: 3 }).textContent,
    );
}

function getUndoHandler(toastApi: MockToastApi, callIndex = -1): () => void {
  const lastCall = toastApi.showToast.mock.calls.at(callIndex);

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

describe("ShoppingPageBody optimistic delete", () => {
  let mockRefresh: ReturnType<typeof vi.fn>;
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRefresh = vi.fn();

    mockToastApi = {
      toasts: [],
      showToast: vi.fn(() => "toast-1"),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    mockUseRouter.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      refresh: mockRefresh,
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>,
    );

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) => {
        const text = translator(`${prefix}${key}`, values);

        return values && "count" in values ? `${text}:${String(values.count)}` : text;
      }) as unknown as ReturnType<typeof useTranslations>;
    });

    mockDeleteShoppingItemAction.mockResolvedValue({
      ok: true,
      data: undefined,
      message: "shopping.delete.success",
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("characterization", () => {
    it("renders the pending rows, both switch counts and the to-buy summary", () => {
      renderBody("pending");

      expect(rowTitles("pending")).toEqual(["Milk", "Bread"]);
      expect(switchLink("pending", 2)).toHaveAttribute("aria-current", "page");
      expect(switchLink("purchased", 1)).not.toHaveAttribute("aria-current");
      expect(summaryText()).toBe(SUMMARY_TWO_PENDING);
    });

    it("renders the purchased rows, both switch counts and still summarises what is left to buy", () => {
      renderBody("purchased");

      expect(rowTitles("purchased")).toEqual(["Eggs"]);
      expect(switchLink("pending", 2)).not.toHaveAttribute("aria-current");
      expect(switchLink("purchased", 1)).toHaveAttribute("aria-current", "page");
      expect(summaryText()).toBe(SUMMARY_TWO_PENDING);
    });

    it("renders the empty state and announcement when the active filter has no items", () => {
      renderBody("purchased", createData({ purchasedItems: [] }));

      expect(rowTitles("purchased")).toEqual([]);
      expect(switchLink("purchased", 0)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_TWO_PENDING);
      expect(screen.getByRole("status")).toHaveTextContent(
        "shopping.sections.purchased.emptyTitle",
      );
    });
  });

  describe("counts", () => {
    it("lowers the pending switch count and the summary immediately on a pending delete", () => {
      renderBody("pending");

      clickDelete("Milk");

      expect(rowTitles("pending")).toEqual(["Bread"]);
      expect(switchLink("pending", 1)).toBeInTheDocument();
      expect(switchLink("purchased", 1)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_ONE_PENDING_NOT_TODAY);
      expect(mockDeleteShoppingItemAction).not.toHaveBeenCalled();
    });

    it("lowers the purchased switch count immediately on a purchased delete and leaves the summary alone", () => {
      renderBody("purchased");

      clickDelete("Eggs");

      expect(rowTitles("purchased")).toEqual([]);
      expect(switchLink("purchased", 0)).toBeInTheDocument();
      expect(switchLink("pending", 2)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_TWO_PENDING);
      expect(screen.getByRole("status")).toHaveTextContent(
        "shopping.sections.purchased.emptyTitle",
      );
    });

    it("restores the counts together with the row on undo", () => {
      renderBody("pending");

      clickDelete("Milk");
      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(rowTitles("pending")).toEqual(["Milk", "Bread"]);
      expect(switchLink("pending", 2)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_TWO_PENDING);
    });

    it("restores the counts together with the row and shows an error toast when the commit fails", async () => {
      mockDeleteShoppingItemAction.mockResolvedValueOnce({
        ok: false,
        error: "shopping.delete.error",
      });
      renderBody("purchased");

      clickDelete("Eggs");
      await advanceUndoWindow();

      expect(rowTitles("purchased")).toEqual(["Eggs"]);
      expect(switchLink("purchased", 1)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_TWO_PENDING);
      expect(mockToastApi.error).toHaveBeenCalledWith("shopping.delete.error", {
        action: {
          label: "shopping.delete.retry",
          onClick: expect.any(Function),
        },
      });
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("keeps the lowered counts after a successful commit and refreshes once", async () => {
      const { rerender } = renderBody("pending");

      clickDelete("Milk");
      await advanceUndoWindow();

      expect(mockDeleteShoppingItemAction).toHaveBeenCalledWith({ itemId: 1 });
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(summaryText()).toBe(SUMMARY_ONE_PENDING_NOT_TODAY);

      rerender(
        <ShoppingPageBody
          activeFilter="pending"
          data={createData({ pendingItems: [bread] })}
        />,
      );

      expect(rowTitles("pending")).toEqual(["Bread"]);
      expect(switchLink("pending", 1)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_ONE_PENDING_NOT_TODAY);
    });

    it("keeps a pending delete hidden when the filter changes and back", async () => {
      const { rerender } = renderBody("pending");

      clickDelete("Milk");

      rerender(<ShoppingPageBody activeFilter="purchased" data={createData()} />);
      expect(switchLink("pending", 1)).toBeInTheDocument();

      rerender(<ShoppingPageBody activeFilter="pending" data={createData()} />);
      expect(rowTitles("pending")).toEqual(["Bread"]);
      expect(summaryText()).toBe(SUMMARY_ONE_PENDING_NOT_TODAY);

      await advanceUndoWindow();

      expect(mockDeleteShoppingItemAction).toHaveBeenCalledTimes(1);
      expect(mockDeleteShoppingItemAction).toHaveBeenCalledWith({ itemId: 1 });
    });

    it("keeps a pending delete hidden and out of both counts when a refresh moves it to the other group", () => {
      const { rerender } = renderBody("pending");

      clickDelete("Milk");

      const purchasedMilk = { ...milk, isChecked: true, broughtBy: "Bob", broughtById: "bob-id" };
      const movedData = createData({
        pendingItems: [bread],
        purchasedItems: [eggs, purchasedMilk],
      });

      rerender(<ShoppingPageBody activeFilter="pending" data={movedData} />);
      expect(rowTitles("pending")).toEqual(["Bread"]);
      expect(switchLink("pending", 1)).toBeInTheDocument();
      expect(switchLink("purchased", 1)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_ONE_PENDING_NOT_TODAY);

      rerender(<ShoppingPageBody activeFilter="purchased" data={movedData} />);
      expect(rowTitles("purchased")).toEqual(["Eggs"]);
      expect(switchLink("purchased", 1)).toBeInTheDocument();

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(rowTitles("purchased")).toEqual(["Eggs", "Milk"]);
      expect(switchLink("pending", 1)).toBeInTheDocument();
      expect(switchLink("purchased", 2)).toBeInTheDocument();
      expect(summaryText()).toBe(SUMMARY_ONE_PENDING_NOT_TODAY);
    });

    it("lowers the counts for each of two deletes in a row and keeps the other hidden when one is undone", () => {
      mockToastApi.showToast
        .mockReturnValueOnce("toast-milk")
        .mockReturnValueOnce("toast-bread");
      renderBody("pending");

      clickDelete("Milk");
      clickDelete("Bread");

      expect(rowTitles("pending")).toEqual([]);
      expect(switchLink("pending", 0)).toBeInTheDocument();
      expect(summaryText()).toBe("shopping.summary.nothingToBuy");

      act(() => {
        getUndoHandler(mockToastApi, 0)();
      });

      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-milk");
      expect(mockToastApi.dismissToast).not.toHaveBeenCalledWith("toast-bread");
      expect(rowTitles("pending")).toEqual(["Milk"]);
      expect(switchLink("pending", 1)).toBeInTheDocument();
      expect(switchLink("purchased", 1)).toBeInTheDocument();
      expect(summaryText()).toBe("shopping.summary.toBuy:1 · shopping.summary.addedToday:1");
    });
  });

  describe("undo flow (moved from ShoppingList)", () => {
    it("removes an item immediately and shows undo toast", () => {
      renderBody("pending");

      clickDelete("Milk");

      expect(screen.queryByText("Milk")).not.toBeInTheDocument();
      expect(mockToastApi.showToast).toHaveBeenCalledWith(
        "shopping.delete.success",
        expect.objectContaining({
          type: "info",
          duration: TOAST_UNDO_WINDOW_MS,
          action: expect.objectContaining({
            label: "shopping.delete.undo",
            onClick: expect.any(Function),
          }),
        }),
      );
    });

    it("restores an item when undo is clicked before timeout", () => {
      renderBody("pending");

      clickDelete("Milk");

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(screen.getByText("Milk")).toBeInTheDocument();
      expect(mockDeleteShoppingItemAction).not.toHaveBeenCalled();
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockToastApi.info).toHaveBeenCalledWith("shopping.delete.restored");
    });

    it("restores an item to its original position on undo", () => {
      renderBody("pending", createData({ pendingItems: [milk, bread, butter] }));

      clickDelete("Bread");

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(rowTitles("pending")).toEqual(["Milk", "Bread", "Butter"]);
    });

    it("commits delete after the undo window expires", async () => {
      renderBody("pending");

      clickDelete("Milk");
      await advanceUndoWindow();

      expect(mockDeleteShoppingItemAction).toHaveBeenCalledWith({ itemId: 1 });
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("restores item and shows error toast when delete fails", async () => {
      mockDeleteShoppingItemAction.mockResolvedValueOnce({
        ok: false,
        error: "shopping.delete.error",
      });
      renderBody("pending");

      clickDelete("Milk");
      await advanceUndoWindow();

      expect(screen.getByText("Milk")).toBeInTheDocument();
      expect(mockToastApi.error).toHaveBeenCalledWith("shopping.delete.error", {
        action: {
          label: "shopping.delete.retry",
          onClick: expect.any(Function),
        },
      });
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});

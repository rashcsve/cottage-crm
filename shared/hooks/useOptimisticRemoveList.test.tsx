import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useToast } from "@/shared/Toast/useToast";
import { useOptimisticRemoveList } from "./useOptimisticRemoveList";

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

type TestItem = {
  id: number;
  label: string;
};

type MockToastApi = {
  toasts: [];
  showToast: ReturnType<typeof vi.fn>;
  dismissToast: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

const mockUseToast = vi.mocked(useToast);

function createItem(overrides: Partial<TestItem> = {}): TestItem {
  return {
    id: 1,
    label: "Item 1",
    ...overrides,
  };
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

function OptimisticRemoveListHarness({
  items,
  commitRemove,
  onCommitSuccess,
}: {
  items: TestItem[];
  commitRemove: (item: TestItem) => Promise<{ ok: boolean; error?: string }>;
  onCommitSuccess?: (item: TestItem) => void | Promise<void>;
}) {
  const { items: visibleItems, removeItem } = useOptimisticRemoveList({
    items,
    commitRemove,
    onCommitSuccess,
    messages: {
      success: "delete.success",
      restored: "delete.restored",
      undo: "delete.undo",
      fallbackError: "common.error",
    },
  });

  if (visibleItems.length === 0) {
    return <p>No items</p>;
  }

  return (
    <ul>
      {visibleItems.map((item) => (
        <li key={item.id} data-testid={`item-${item.id}`}>
          <span>{item.label}</span>
          <button type="button" onClick={() => removeItem(item)}>
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}

describe("useOptimisticRemoveList", () => {
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    mockToastApi = {
      toasts: [],
      showToast: vi.fn(() => "toast-1"),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>
    );
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("removes an item immediately and shows undo toast", () => {
    vi.useFakeTimers();
    const commitRemove = vi.fn().mockResolvedValue({ ok: true });

    render(
      <OptimisticRemoveListHarness
        items={[createItem()]}
        commitRemove={commitRemove}
      />
    );

    fireEvent.click(
      within(screen.getByTestId("item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(screen.queryByTestId("item-1")).not.toBeInTheDocument();
    expect(mockToastApi.showToast).toHaveBeenCalledWith(
      "delete.success",
      expect.objectContaining({
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: expect.objectContaining({
          label: "delete.undo",
          onClick: expect.any(Function),
        }),
      })
    );
    expect(commitRemove).not.toHaveBeenCalled();
  });

  it("restores an item when undo is clicked before timeout", () => {
    vi.useFakeTimers();
    const commitRemove = vi.fn().mockResolvedValue({ ok: true });

    render(
      <OptimisticRemoveListHarness
        items={[createItem()]}
        commitRemove={commitRemove}
      />
    );

    fireEvent.click(
      within(screen.getByTestId("item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    const undo = getUndoHandler(mockToastApi);

    act(() => {
      undo();
    });

    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(commitRemove).not.toHaveBeenCalled();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.info).toHaveBeenCalledWith("delete.restored");
  });

  it("commits removal after the undo window expires", async () => {
    vi.useFakeTimers();
    const commitRemove = vi.fn().mockResolvedValue({ ok: true });
    const onCommitSuccess = vi.fn();

    render(
      <OptimisticRemoveListHarness
        items={[createItem()]}
        commitRemove={commitRemove}
        onCommitSuccess={onCommitSuccess}
      />
    );

    fireEvent.click(
      within(screen.getByTestId("item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(commitRemove).toHaveBeenCalledWith(createItem());
    expect(onCommitSuccess).toHaveBeenCalledWith(createItem());
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
  });

  it("restores an item and shows error toast when commit fails", async () => {
    vi.useFakeTimers();
    const commitRemove = vi.fn().mockResolvedValue({
      ok: false,
      error: "delete.error",
    });

    render(
      <OptimisticRemoveListHarness
        items={[createItem()]}
        commitRemove={commitRemove}
      />
    );

    fireEvent.click(
      within(screen.getByTestId("item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(screen.getByTestId("item-1")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("delete.error");
  });

  it("renders updated items when props change", () => {
    const commitRemove = vi.fn().mockResolvedValue({ ok: true });
    const { rerender } = render(
      <OptimisticRemoveListHarness
        items={[createItem({ id: 1, label: "Item 1" })]}
        commitRemove={commitRemove}
      />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();

    rerender(
      <OptimisticRemoveListHarness
        items={[
          createItem({ id: 2, label: "Item 2" }),
          createItem({ id: 3, label: "Item 3" }),
        ]}
        commitRemove={commitRemove}
      />
    );

    expect(screen.queryByText("Item 1")).not.toBeInTheDocument();
    expect(screen.getByText("Item 2")).toBeInTheDocument();
    expect(screen.getByText("Item 3")).toBeInTheDocument();
  });

  it("cleans up pending timers on unmount", () => {
    vi.useFakeTimers();
    const commitRemove = vi.fn().mockResolvedValue({ ok: true });
    const { unmount } = render(
      <OptimisticRemoveListHarness
        items={[createItem()]}
        commitRemove={commitRemove}
      />
    );

    fireEvent.click(
      within(screen.getByTestId("item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    unmount();

    act(() => {
      vi.advanceTimersByTime(TOAST_UNDO_WINDOW_MS);
    });

    expect(commitRemove).not.toHaveBeenCalled();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
  });
});

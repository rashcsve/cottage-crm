import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteVisitAction } from "@/features/visits/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useToast } from "@/shared/Toast/useToast";
import { VisitsList } from "./VisitsList";
import type { Visit } from "@/features/visits/types/visits";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/visits/server/actions", () => ({
  deleteVisitAction: vi.fn(),
}));

vi.mock("@/features/visits/components/VisitRow", () => ({
  VisitRow: ({
    visit,
    onDelete,
  }: {
    visit: Visit;
    canManageVisits: boolean;
    today: string;
    onDelete?: (visit: Visit) => void;
  }) => (
    <li data-testid={`visit-item-${visit.id}`}>
      <span>{visit.visitorName}</span>
      <button type="button" onClick={() => onDelete?.(visit)}>
        Delete
      </button>
    </li>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteVisitAction = vi.mocked(deleteVisitAction);

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

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Svetlana",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    note: null,
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function renderVisitsList(
  props: Partial<React.ComponentProps<typeof VisitsList>> = {}
) {
  return render(
    <VisitsList
      visits={[]}
      canManageVisits
      today="2026-04-09"
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

describe("VisitsList", () => {
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
      const prefix = namespace ? `${namespace}.` : "";
      return ((key: string) => `${prefix}${key}`) as ReturnType<
        typeof useTranslations
      >;
    });

    mockDeleteVisitAction.mockResolvedValue({
      ok: true,
      data: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders translated empty state", () => {
    renderVisitsList({ visits: [] });

    expect(screen.getByText("visits.empty.title")).toBeInTheDocument();
    expect(screen.getByText("visits.empty.description")).toBeInTheDocument();
  });

  it("removes a visit immediately and shows undo toast", () => {
    vi.useFakeTimers();
    const visits = [createVisit({ id: 1, visitorName: "Visit 1" })];

    renderVisitsList({ visits });

    fireEvent.click(
      within(screen.getByTestId("visit-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(screen.queryByTestId("visit-item-1")).not.toBeInTheDocument();
    expect(mockToastApi.showToast).toHaveBeenCalledWith(
      "visits.delete.success",
      expect.objectContaining({
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: expect.objectContaining({
          label: "visits.delete.undo",
          onClick: expect.any(Function),
        }),
      })
    );
  });

  it("restores the visit when undo is clicked before timeout", () => {
    vi.useFakeTimers();
    const visits = [
      createVisit({ id: 1, visitorName: "Visit 1" }),
      createVisit({ id: 2, visitorName: "Visit 2" }),
    ];

    renderVisitsList({ visits });

    fireEvent.click(
      within(screen.getByTestId("visit-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    const undo = getUndoHandler(mockToastApi);

    act(() => {
      undo();
    });

    expect(screen.getByTestId("visit-item-1")).toBeInTheDocument();
    expect(mockDeleteVisitAction).not.toHaveBeenCalled();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.info).toHaveBeenCalledWith("visits.delete.restored");
  });

  it("commits delete after the undo window expires", async () => {
    vi.useFakeTimers();
    const visit = createVisit({ id: 1, visitorName: "Visit 1" });

    renderVisitsList({ visits: [visit] });

    fireEvent.click(
      within(screen.getByTestId("visit-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(mockDeleteVisitAction).toHaveBeenCalledWith({ visitId: 1 });
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("restores visit and shows error toast when delete fails", async () => {
    vi.useFakeTimers();
    const visit = createVisit({ id: 1, visitorName: "Visit 1" });

    mockDeleteVisitAction.mockResolvedValueOnce({
      ok: false,
      error: "visits.delete.errors.databaseError",
    });

    renderVisitsList({ visits: [visit] });

    fireEvent.click(
      within(screen.getByTestId("visit-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(screen.getByTestId("visit-item-1")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith(
      "visits.delete.errors.databaseError"
    );
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import type { TaskFilter, TasksPageData } from "@/features/tasks/types/tasks";
import {
  createCompletedTask,
  createFutureTask,
  createOverdueTask,
} from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksPageBody } from "./TasksPageBody";

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

vi.mock("@/features/tasks/server/actions", () => ({
  deleteTaskAction: vi.fn(),
  toggleTaskAction: vi.fn(),
}));

vi.mock("@/features/tasks/components/forms/TaskQuickAdd", () => ({
  TaskQuickAdd: () => <div data-testid="task-quick-add" />,
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteTaskAction = vi.mocked(deleteTaskAction);

type MockToastApi = {
  toasts: [];
  showToast: ReturnType<typeof vi.fn>;
  dismissToast: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

const overdueA = createOverdueTask({ id: 11, title: "Overdue A" });
const overdueB = createOverdueTask({ id: 12, title: "Overdue B" });
const overdueC = createOverdueTask({ id: 13, title: "Overdue C" });
const onTrack = createFutureTask({ id: 21, title: "On track" });
const done = createCompletedTask({ id: 31, title: "Done" });

function createData(overrides: Partial<TasksPageData> = {}): TasksPageData {
  const overdueTasks = overrides.overdueTasks ?? [overdueA, overdueB];
  const onTrackTasks = overrides.onTrackTasks ?? [onTrack];
  const openTasks = overrides.openTasks ?? [...overdueTasks, ...onTrackTasks];
  const doneTasks = overrides.doneTasks ?? [done];

  return {
    openTasks,
    openCount: openTasks.length,
    overdueTasks,
    overdueCount: overdueTasks.length,
    onTrackTasks,
    onTrackCount: onTrackTasks.length,
    doneTasks,
    doneCount: doneTasks.length,
    canManage: true,
    currentUserId: "user-1",
    todayIso: "2026-10-29",
    ...overrides,
  };
}

function renderBody(
  activeFilter: TaskFilter = "open",
  data: TasksPageData = createData(),
) {
  return render(<TasksPageBody activeFilter={activeFilter} activeDue="all" data={data} />);
}

function clickDelete(title: string) {
  const row = screen
    .getByRole("heading", { level: 4, name: title })
    .closest("li");

  if (!row) {
    throw new Error(`Expected a row for "${title}".`);
  }

  fireEvent.click(
    within(row).getByRole("button", { name: "tasks.aria.deleteTask" }),
  );
}

function filterLink(filter: TaskFilter, value: number) {
  return screen.queryByRole("link", {
    name: `tasks.switch.${filter} ${value}`,
  });
}

function headerSummary() {
  return screen.getByText(/^tasks\.summary\./).textContent;
}

function groupBadge(group: "needsAttention" | "later") {
  const name = `tasks.groups.${group}`;
  const region = screen.getByRole("region", { name });

  return within(region).getByRole("heading", { level: 3, name })
    .nextElementSibling?.textContent;
}

function groupRowTitles(group: "needsAttention" | "later") {
  const region = screen.getByRole("region", {
    name: `tasks.groups.${group}`,
  });

  return within(region)
    .queryAllByRole("heading", { level: 4 })
    .map((heading) => heading.textContent);
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

describe("TasksPageBody optimistic delete", () => {
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
        const message = translator(`${prefix}${key}`, values);

        return values?.count === undefined
          ? message
          : `${message}:${String(values.count)}`;
      }) as unknown as ReturnType<typeof useTranslations>;
    });

    mockDeleteTaskAction.mockResolvedValue({ ok: true, data: undefined });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("shows each group with only its title and count, without an eyebrow or description", () => {
    renderBody();

    expect(groupBadge("needsAttention")).toBe("2");
    expect(groupBadge("later")).toBe("1");
    expect(screen.queryByText(/tasks\.sections\.\w+\.(eyebrow|description)/)).not.toBeInTheDocument();
  });

  it.each([
    ["done" as const, createData(), "done", []],
    [
      "empty open" as const,
      createData({ overdueTasks: [], onTrackTasks: [] }),
      "open",
      ["tasks.sections.open.emptyTitle"],
    ],
  ])(
    "labels the single %s group with the view heading instead of repeating it",
    (label, data, section, expectedLevel3Headings) => {
      renderBody(label === "done" ? "done" : "open", data);

      const region = screen.getByRole("region", {
        name: `tasks.sections.${section}.title`,
      });
      expect(
        within(region)
          .queryAllByRole("heading", { level: 3 })
          .map((heading) => heading.textContent),
      ).toEqual(expectedLevel3Headings);
      expect(
        screen.getAllByRole("heading", { name: `tasks.sections.${section}.title` }),
      ).toHaveLength(1);
    },
  );

  describe("counts", () => {
    it("renders server counts when nothing is pending", () => {
      renderBody();

      expect(filterLink("open", 3)).toBeInTheDocument();
      expect(filterLink("done", 1)).toBeInTheDocument();
      expect(headerSummary()).toBe("tasks.summary.open:3 · tasks.summary.overdue:2");
      expect(groupBadge("needsAttention")).toBe("2");
      expect(groupBadge("later")).toBe("1");
    });

    it("lowers every count that includes a deleted overdue task immediately", () => {
      renderBody();

      clickDelete("Overdue A");

      expect(groupRowTitles("needsAttention")).toEqual(["Overdue B"]);
      expect(filterLink("open", 2)).toBeInTheDocument();
      expect(filterLink("done", 1)).toBeInTheDocument();
      expect(headerSummary()).toBe("tasks.summary.open:2 · tasks.summary.overdue:1");
      expect(groupBadge("needsAttention")).toBe("1");
      expect(groupBadge("later")).toBe("1");
      expect(mockDeleteTaskAction).not.toHaveBeenCalled();
    });

    it("lowers the open counts and the on-track badge for a deleted on-track task", () => {
      renderBody();

      clickDelete("On track");

      expect(headerSummary()).toBe("tasks.summary.open:2 · tasks.summary.overdue:2");
      expect(groupBadge("needsAttention")).toBe("2");
      expect(
        screen.queryByRole("region", { name: "tasks.groups.later" }),
      ).not.toBeInTheDocument();
    });

    it("hides the on-track group when its last task is deleted while overdue tasks remain", () => {
      renderBody(
        "open",
        createData({ overdueTasks: [overdueA, overdueB], onTrackTasks: [onTrack] }),
      );

      clickDelete("On track");

      expect(
        screen.queryByRole("region", { name: "tasks.groups.later" }),
      ).not.toBeInTheDocument();
      expect(groupRowTitles("needsAttention")).toEqual(["Overdue A", "Overdue B"]);
      expect(groupBadge("needsAttention")).toBe("2");
    });

    it("hides the needs-attention group as soon as its last task is deleted and keeps later", () => {
      renderBody(
        "open",
        createData({ overdueTasks: [overdueA], onTrackTasks: [onTrack] }),
      );

      clickDelete("Overdue A");

      expect(
        screen.queryByRole("region", { name: "tasks.groups.needsAttention" }),
      ).not.toBeInTheDocument();
      expect(groupRowTitles("later")).toEqual(["On track"]);
      expect(groupBadge("later")).toBe("1");
      expect(headerSummary()).toBe("tasks.summary.open:1");
    });

    it("shows the open-tasks empty state as soon as the last open task is deleted", () => {
      renderBody(
        "open",
        createData({ overdueTasks: [], onTrackTasks: [onTrack] }),
      );

      clickDelete("On track");

      expect(
        screen.queryByRole("region", { name: "tasks.groups.later" }),
      ).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toHaveTextContent(
        "tasks.sections.open.emptyTitle",
      );
      expect(headerSummary()).toBe("tasks.summary.nothingOpen");
    });

    it("lowers the done counts and keeps the open summary for a deleted done task in the done view", () => {
      renderBody("done");

      clickDelete("Done");

      expect(filterLink("done", 0)).toBeInTheDocument();
      expect(headerSummary()).toBe("tasks.summary.open:3 · tasks.summary.overdue:2");
      expect(screen.getByRole("status")).toHaveTextContent(
        "tasks.sections.done.emptyTitle",
      );
    });

    it("restores every count together with the row on undo", () => {
      renderBody();

      clickDelete("Overdue A");
      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(groupRowTitles("needsAttention")).toEqual(["Overdue A", "Overdue B"]);
      expect(filterLink("open", 3)).toBeInTheDocument();
      expect(headerSummary()).toBe("tasks.summary.open:3 · tasks.summary.overdue:2");
      expect(groupBadge("needsAttention")).toBe("2");
    });

    it("restores every count together with the row and shows an error toast when the commit fails", async () => {
      mockDeleteTaskAction.mockResolvedValueOnce({
        ok: false,
        error: "tasks.delete.errors.databaseError",
      });
      renderBody();

      clickDelete("Overdue A");
      await advanceUndoWindow();

      expect(groupRowTitles("needsAttention")).toEqual(["Overdue A", "Overdue B"]);
      expect(filterLink("open", 3)).toBeInTheDocument();
      expect(headerSummary()).toBe("tasks.summary.open:3 · tasks.summary.overdue:2");
      expect(groupBadge("needsAttention")).toBe("2");
      expect(mockToastApi.error).toHaveBeenCalledWith(
        "tasks.delete.errors.databaseError",
        {
          action: {
            label: "tasks.delete.retry",
            onClick: expect.any(Function),
          },
        },
      );
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("keeps the lowered counts after a successful commit and refreshes once", async () => {
      const { rerender } = renderBody();

      clickDelete("Overdue A");
      await advanceUndoWindow();

      expect(mockDeleteTaskAction).toHaveBeenCalledWith({ taskId: 11 });
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(headerSummary()).toBe("tasks.summary.open:2 · tasks.summary.overdue:1");

      rerender(
        <TasksPageBody
          activeFilter="open"
          activeDue="all"
          data={createData({ overdueTasks: [overdueB] })}
        />,
      );

      expect(groupRowTitles("needsAttention")).toEqual(["Overdue B"]);
      expect(headerSummary()).toBe("tasks.summary.open:2 · tasks.summary.overdue:1");
      expect(groupBadge("needsAttention")).toBe("1");
    });

    it("keeps a pending delete hidden when the filter changes and back", async () => {
      const { rerender } = renderBody();

      clickDelete("Overdue A");

      rerender(<TasksPageBody activeFilter="done" activeDue="all" data={createData()} />);
      expect(headerSummary()).toBe("tasks.summary.open:2 · tasks.summary.overdue:1");
      expect(filterLink("open", 2)).toBeInTheDocument();

      rerender(<TasksPageBody activeFilter="open" activeDue="all" data={createData()} />);
      expect(groupRowTitles("needsAttention")).toEqual(["Overdue B"]);
      expect(headerSummary()).toBe("tasks.summary.open:2 · tasks.summary.overdue:1");

      await advanceUndoWindow();

      expect(mockDeleteTaskAction).toHaveBeenCalledTimes(1);
      expect(mockDeleteTaskAction).toHaveBeenCalledWith({ taskId: 11 });
    });
  });

  describe("undo flow (moved from TaskList)", () => {
    it("removes a task immediately and shows undo toast", () => {
      renderBody();

      clickDelete("Overdue A");

      expect(screen.queryByText("Overdue A")).not.toBeInTheDocument();
      expect(mockToastApi.showToast).toHaveBeenCalledWith(
        "tasks.delete.success",
        expect.objectContaining({
          type: "info",
          duration: TOAST_UNDO_WINDOW_MS,
          action: expect.objectContaining({
            label: "tasks.delete.undo",
            onClick: expect.any(Function),
          }),
        }),
      );
    });

    it("restores the task when undo is clicked before timeout", () => {
      renderBody();

      clickDelete("Overdue A");

      expect(screen.queryByText("Overdue A")).not.toBeInTheDocument();

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(screen.getByText("Overdue A")).toBeInTheDocument();
      expect(mockDeleteTaskAction).not.toHaveBeenCalled();
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockToastApi.info).toHaveBeenCalledWith("tasks.delete.restored");
    });

    it("restores the task to its original position on undo", () => {
      renderBody(
        "open",
        createData({ overdueTasks: [overdueA, overdueB, overdueC] }),
      );

      clickDelete("Overdue B");

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(groupRowTitles("needsAttention")).toEqual([
        "Overdue A",
        "Overdue B",
        "Overdue C",
      ]);
    });

    it("commits delete after undo window expires", async () => {
      renderBody();

      clickDelete("Overdue A");
      await advanceUndoWindow();

      expect(mockDeleteTaskAction).toHaveBeenCalledWith({ taskId: 11 });
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("restores task and shows error toast when delete action returns failure", async () => {
      mockDeleteTaskAction.mockResolvedValueOnce({
        ok: false,
        error: "tasks.delete.errors.databaseError",
      });
      renderBody();

      clickDelete("Overdue A");
      await advanceUndoWindow();

      expect(screen.getByText("Overdue A")).toBeInTheDocument();
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockToastApi.error).toHaveBeenCalledWith(
        "tasks.delete.errors.databaseError",
        {
          action: {
            label: "tasks.delete.retry",
            onClick: expect.any(Function),
          },
        },
      );
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("restores task and shows thrown error message when delete action throws", async () => {
      mockDeleteTaskAction.mockRejectedValueOnce(new Error("Delete failed"));
      renderBody();

      clickDelete("Overdue A");
      await advanceUndoWindow();

      expect(screen.getByText("Overdue A")).toBeInTheDocument();
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockToastApi.error).toHaveBeenCalledWith("Delete failed", {
        action: {
          label: "tasks.delete.retry",
          onClick: expect.any(Function),
        },
      });
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("commits a pending delete when the undo window expires after unmount", () => {
      const { unmount } = renderBody();

      clickDelete("Overdue A");

      unmount();

      expect(mockDeleteTaskAction).not.toHaveBeenCalled();
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");

      act(() => {
        vi.advanceTimersByTime(TOAST_UNDO_WINDOW_MS);
      });

      expect(mockDeleteTaskAction).toHaveBeenCalledTimes(1);
      expect(mockDeleteTaskAction).toHaveBeenCalledWith({ taskId: 11 });
    });
  });
});

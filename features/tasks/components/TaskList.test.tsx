import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { TaskList } from "./TaskList";
import { createTask, createTaskList } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { Task } from "@/features/tasks/types/task.types";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/tasks/server/actions", () => ({
  deleteTaskAction: vi.fn(),
}));

vi.mock("@/features/tasks/components/TaskItem", () => ({
  TaskItem: ({
    task,
    onDelete,
  }: {
    task: Task;
    canManageTasks: boolean;
    onDelete: (task: Task) => void;
    currentUserId: string;
    today: string;
  }) => (
    <li data-testid={`task-item-${task.id}`}>
      <span>{task.title}</span>
      <button type="button" onClick={() => onDelete(task)}>
        Delete
      </button>
    </li>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteTaskAction = vi.mocked(deleteTaskAction);

const CURRENT_USER_ID = "user-1";
const TODAY = "2026-04-07";

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

function renderTaskList(
  props: Partial<React.ComponentProps<typeof TaskList>> = {}
) {
  return render(
    <TaskList
      initialTasks={[]}
      canManageTasks
      currentUserId={CURRENT_USER_ID}
      today={TODAY}
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

describe("TaskList", () => {
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

    mockDeleteTaskAction.mockResolvedValue({
      ok: true,
      data: undefined,
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders all tasks", () => {
    const tasks = createTaskList(3);

    renderTaskList({ initialTasks: tasks });

    tasks.forEach((task) => {
      expect(screen.getByTestId(`task-item-${task.id}`)).toBeInTheDocument();
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });

  it("renders custom empty state", () => {
    renderTaskList({
      initialTasks: [],
      emptyTitle: "No tasks",
      emptyDescription: "Create one to get started",
    });

    expect(screen.getByText("No tasks")).toBeInTheDocument();
    expect(screen.getByText("Create one to get started")).toBeInTheDocument();
  });

  it("renders default translated empty state", () => {
    renderTaskList({ initialTasks: [] });

    expect(screen.getByText("tasks.empty.noTasks")).toBeInTheDocument();
    expect(
      screen.getByText("tasks.empty.noTasksDescription")
    ).toBeInTheDocument();
  });

  it("removes a task immediately and shows undo toast", () => {
    vi.useFakeTimers();
    const tasks = [createTask({ id: 1, title: "Task 1" })];

    renderTaskList({ initialTasks: tasks });

    fireEvent.click(
      within(screen.getByTestId("task-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(screen.queryByTestId("task-item-1")).not.toBeInTheDocument();
    expect(mockToastApi.showToast).toHaveBeenCalledWith(
      "tasks.delete.success",
      expect.objectContaining({
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: expect.objectContaining({
          label: "tasks.delete.undo",
          onClick: expect.any(Function),
        }),
      })
    );
  });

  it("restores the task when undo is clicked before timeout", () => {
    vi.useFakeTimers();
    const tasks = [
      createTask({ id: 1, title: "Task 1" }),
      createTask({ id: 2, title: "Task 2" }),
    ];

    renderTaskList({ initialTasks: tasks });

    fireEvent.click(
      within(screen.getByTestId("task-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(screen.queryByTestId("task-item-1")).not.toBeInTheDocument();

    const undo = getUndoHandler(mockToastApi);

    act(() => {
      undo();
    });

    expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
    expect(mockDeleteTaskAction).not.toHaveBeenCalled();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.info).toHaveBeenCalledWith("tasks.delete.restored");
  });

  it("restores the task to its original position on undo", () => {
    vi.useFakeTimers();
    const tasks = [
      createTask({ id: 1, title: "Task 1" }),
      createTask({ id: 2, title: "Task 2" }),
      createTask({ id: 3, title: "Task 3" }),
    ];

    renderTaskList({ initialTasks: tasks });

    fireEvent.click(
      within(screen.getByTestId("task-item-2")).getByRole("button", {
        name: "Delete",
      })
    );

    const undo = getUndoHandler(mockToastApi);

    act(() => {
      undo();
    });

    const taskItems = screen.getAllByRole("listitem");

    expect(taskItems.map((item) => item.textContent)).toEqual([
      "Task 1Delete",
      "Task 2Delete",
      "Task 3Delete",
    ]);
  });

  it("commits delete after undo window expires", async () => {
    vi.useFakeTimers();
    const task = createTask({ id: 1, title: "Task 1" });

    renderTaskList({ initialTasks: [task] });

    fireEvent.click(
      within(screen.getByTestId("task-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(mockDeleteTaskAction).toHaveBeenCalledWith({ taskId: 1 });
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("restores task and shows error toast when delete action returns failure", async () => {
    vi.useFakeTimers();
    const task = createTask({ id: 1, title: "Task 1" });

    mockDeleteTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.delete.errors.databaseError",
    });

    renderTaskList({ initialTasks: [task] });

    fireEvent.click(
      within(screen.getByTestId("task-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.error).toHaveBeenCalledWith(
      "tasks.delete.errors.databaseError"
    );
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("restores task and shows thrown error message when delete action throws", async () => {
    vi.useFakeTimers();
    const task = createTask({ id: 1, title: "Task 1" });

    mockDeleteTaskAction.mockRejectedValueOnce(new Error("Delete failed"));

    renderTaskList({ initialTasks: [task] });

    fireEvent.click(
      within(screen.getByTestId("task-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.error).toHaveBeenCalledWith("Delete failed");
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("syncs internal state when initialTasks prop changes", () => {
    const { rerender } = renderTaskList({
      initialTasks: [createTask({ id: 1, title: "Task 1" })],
    });

    expect(screen.getByText("Task 1")).toBeInTheDocument();

    rerender(
      <TaskList
        initialTasks={[
          createTask({ id: 2, title: "Task 2" }),
          createTask({ id: 3, title: "Task 3" }),
        ]}
        canManageTasks
        currentUserId={CURRENT_USER_ID}
        today={TODAY}
      />
    );

    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });
});

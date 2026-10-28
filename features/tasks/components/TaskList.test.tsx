import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { TaskList } from "./TaskList";
import { createTask, createTaskList } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { Task } from "@/features/tasks/types/tasks";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
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

const CURRENT_USER_ID = "user-1";

function renderTaskList(
  props: Partial<React.ComponentProps<typeof TaskList>> = {}
) {
  return render(
    <TaskList
      tasks={[]}
      onDelete={vi.fn()}
      canManageTasks
      currentUserId={CURRENT_USER_ID}
      {...props}
    />
  );
}

describe("TaskList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders all tasks", () => {
    const tasks = createTaskList(3);

    renderTaskList({ tasks });

    tasks.forEach((task) => {
      expect(screen.getByTestId(`task-item-${task.id}`)).toBeInTheDocument();
      expect(screen.getByText(task.title)).toBeInTheDocument();
    });
  });

  it("renders custom empty state", () => {
    renderTaskList({
      tasks: [],
      emptyTitle: "No tasks",
      emptyDescription: "Create one to get started",
    });

    expect(
      screen.getByRole("heading", { name: "No tasks" })
    ).toBeInTheDocument();
    expect(screen.getByText("Create one to get started")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("No tasks");
  });

  it("renders default translated empty state", () => {
    renderTaskList({ tasks: [] });

    expect(
      screen.getByRole("heading", { name: "tasks.empty.noTasks" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("tasks.empty.noTasksDescription")
    ).toBeInTheDocument();
  });

  it("calls onDelete with the task when its delete button is clicked", () => {
    const onDelete = vi.fn();
    const task = createTask({ id: 1, title: "Task 1" });

    renderTaskList({ tasks: [task], onDelete });

    fireEvent.click(
      within(screen.getByTestId("task-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(task);
    expect(screen.getByTestId("task-item-1")).toBeInTheDocument();
  });

  it("renders updated tasks when the tasks prop changes", () => {
    const { rerender } = renderTaskList({
      tasks: [createTask({ id: 1, title: "Task 1" })],
    });

    expect(screen.getByText("Task 1")).toBeInTheDocument();

    rerender(
      <TaskList
        tasks={[
          createTask({ id: 2, title: "Task 2" }),
          createTask({ id: 3, title: "Task 3" }),
        ]}
        onDelete={vi.fn()}
        canManageTasks
        currentUserId={CURRENT_USER_ID}
      />
    );

    expect(screen.queryByText("Task 1")).not.toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.getByText("Task 3")).toBeInTheDocument();
  });
});

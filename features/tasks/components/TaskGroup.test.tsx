import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { createTaskList } from "@/tests/fixtures/task-fixtures";
import type { Task } from "@/features/tasks/types/tasks";
import { TaskGroup } from "./TaskGroup";

vi.mock("@/features/tasks/components/TaskList", () => ({
  TaskList: ({
    tasks,
    onDelete,
  }: {
    tasks: Task[];
    onDelete: (task: Task) => void;
  }) => (
    <ul data-testid="task-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <button type="button" onClick={() => onDelete(task)}>
            {task.title}
          </button>
        </li>
      ))}
    </ul>
  ),
}));

vi.mock("@/shared/ui/StatusLabel", () => ({
  StatusLabel: ({
    children,
    tone,
    icon,
  }: {
    children: number;
    tone: string;
    icon?: { displayName?: string };
  }) => (
    <span data-testid="group-count" data-tone={tone} data-icon={icon?.displayName}>
      {children}
    </span>
  ),
}));

const baseProps = {
  title: "Needs attention first",
  headingId: "tasks-group-overdue",
  canManageTasks: true,
  currentUserId: "user-1",
  onDelete: vi.fn(),
};

describe("TaskGroup", () => {
  it("renders a section named by its heading with the tasks inside", () => {
    render(<TaskGroup {...baseProps} tasks={createTaskList(2)} />);

    const section = screen.getByRole("region", {
      name: "Needs attention first",
    });

    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Needs attention first",
      }),
    ).toBeInTheDocument();
    expect(within(section).getByTestId("task-list").children).toHaveLength(2);
  });

  it("marks the overdue group with a danger triangle next to the count", () => {
    render(
      <TaskGroup {...baseProps} tone="danger" tasks={createTaskList(3)} />,
    );

    const count = screen.getByTestId("group-count");
    expect(count).toHaveTextContent("3");
    expect(count).toHaveAttribute("data-tone", "danger");
    expect(count).toHaveAttribute("data-icon", "TriangleAlert");
  });

  it("shows a neutral count without an icon by default", () => {
    render(<TaskGroup {...baseProps} tasks={createTaskList(2)} />);

    const count = screen.getByTestId("group-count");
    expect(count).toHaveTextContent("2");
    expect(count).toHaveAttribute("data-tone", "neutral");
    expect(count).not.toHaveAttribute("data-icon");
  });

  it("drops its own heading and count when showHeader is false but stays labelled by headingId", () => {
    render(
      <>
        <h2 id="tasks-group-overdue">Page heading</h2>
        <TaskGroup {...baseProps} showHeader={false} tasks={createTaskList(2)} />
      </>,
    );

    const section = screen.getByRole("region", { name: "Page heading" });

    expect(within(section).queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("group-count")).not.toBeInTheDocument();
    expect(within(section).getByTestId("task-list").children).toHaveLength(2);
  });

  it("passes onDelete through to the list", () => {
    const onDelete = vi.fn();
    const tasks = createTaskList(2);

    render(<TaskGroup {...baseProps} tasks={tasks} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Task 2" }));

    expect(onDelete).toHaveBeenCalledWith(tasks[1]);
  });
});

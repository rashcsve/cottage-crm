import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { createTaskList } from "@/tests/fixtures/task-fixtures";
import type { Task } from "@/features/tasks/types/tasks";
import { TaskGroup } from "./TaskGroup";

vi.mock("@/features/tasks/components/TaskList", () => ({
  TaskList: ({ initialTasks }: { initialTasks: Task[] }) => (
    <ul data-testid="task-list">
      {initialTasks.map((task) => (
        <li key={task.id}>{task.title}</li>
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
  eyebrow: "Needs attention",
  title: "Needs attention first",
  description: "Past due tasks",
  headingId: "tasks-group-overdue",
  canManageTasks: true,
  currentUserId: "user-1",
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
});

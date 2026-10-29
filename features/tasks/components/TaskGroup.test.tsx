import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { Calendar, Clock, TriangleAlert } from "lucide-react";
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
    children: React.ReactNode;
    tone: string;
    icon?: { displayName?: string };
  }) => (
    <span data-testid="group-label" data-tone={tone} data-icon={icon?.displayName}>
      {children}
    </span>
  ),
}));

const baseProps = {
  title: "Needs attention",
  headingId: "tasks-group-needs-attention",
  canManageTasks: true,
  currentUserId: "user-1",
  onDelete: vi.fn(),
};

describe("TaskGroup", () => {
  it("renders a section named by its heading with the tasks inside", () => {
    render(
      <TaskGroup
        {...baseProps}
        tone="danger"
        icon={TriangleAlert}
        tasks={createTaskList(2)}
      />,
    );

    const section = screen.getByRole("region", { name: "Needs attention" });

    expect(
      within(section).getByRole("heading", {
        level: 3,
        name: "Needs attention",
      }),
    ).toBeInTheDocument();
    expect(within(section).getByTestId("task-list").children).toHaveLength(2);
  });

  it.each([
    ["danger", TriangleAlert, "TriangleAlert"],
    ["warning", Clock, "Clock"],
    ["neutral", Calendar, "Calendar"],
  ] as const)(
    "shows the %s title with its icon inside the heading and the count next to it",
    (tone, icon, iconName) => {
      render(
        <TaskGroup {...baseProps} tone={tone} icon={icon} tasks={createTaskList(3)} />,
      );

      const heading = screen.getByRole("heading", {
        level: 3,
        name: "Needs attention",
      });
      const label = within(heading).getByTestId("group-label");

      expect(label).toHaveTextContent("Needs attention");
      expect(label).toHaveAttribute("data-tone", tone);
      expect(label).toHaveAttribute("data-icon", iconName);
      expect(heading.nextElementSibling).toHaveTextContent(/^3$/);
    },
  );

  it("drops its own heading and count when showHeader is false but stays labelled by headingId", () => {
    render(
      <>
        <h2 id="tasks-group-needs-attention">Page heading</h2>
        <TaskGroup {...baseProps} showHeader={false} tasks={createTaskList(2)} />
      </>,
    );

    const section = screen.getByRole("region", { name: "Page heading" });

    expect(within(section).queryByRole("heading")).not.toBeInTheDocument();
    expect(screen.queryByTestId("group-label")).not.toBeInTheDocument();
    expect(within(section).queryByText("2")).not.toBeInTheDocument();
    expect(within(section).getByTestId("task-list").children).toHaveLength(2);
  });

  it.each([
    [undefined, true],
    [false, false],
  ] as const)(
    "with framed=%s renders the list inside its own card: %s",
    (framed, hasCard) => {
      render(<TaskGroup {...baseProps} framed={framed} tasks={createTaskList(1)} />);

      const section = screen.getByRole("region", { name: "Needs attention" });
      const list = within(section).getByTestId("task-list");

      expect(list.parentElement === section).toBe(!hasCard);
      expect(section).toContainElement(list);
    },
  );

  it("passes onDelete through to the list", () => {
    const onDelete = vi.fn();
    const tasks = createTaskList(2);

    render(<TaskGroup {...baseProps} tasks={tasks} onDelete={onDelete} />);

    fireEvent.click(screen.getByRole("button", { name: "Task 2" }));

    expect(onDelete).toHaveBeenCalledWith(tasks[1]);
  });
});

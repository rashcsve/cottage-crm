import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale, useTranslations } from "next-intl";
import { createCompletedTask, createTask } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TaskItem } from "./TaskItem";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/components/TaskToggleButton", () => ({
  TaskToggleButton: () => <div data-testid="task-toggle-button" />,
}));

vi.mock("@/features/tasks/components/TaskActions", () => ({
  TaskActions: () => <button type="button">Delete task</button>,
}));

vi.mock("@/features/tasks/components/TaskDueDate", () => ({
  TaskDueDate: () => <div data-testid="task-due-date">Due badge</div>,
}));

vi.mock("@/shared/ui/StatusLabel", () => ({
  StatusLabel: ({
    children,
    icon,
  }: {
    children: ReactNode;
    icon?: { displayName?: string };
  }) => (
    <span data-testid="task-completed-status" data-icon={icon?.displayName}>
      {children}
    </span>
  ),
}));

vi.mock("@/lib/utils/formatRelativeTimestamp", () => ({
  formatFullTimestamp: (timestamp: string) => `full:${timestamp}`,
  formatRelativeTimestamp: (timestamp: string) => `formatted:${timestamp}`,
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

describe("TaskItem", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders pending-task metadata with due date and assignee context", () => {
    const task = createTask({
      title: "Replace kitchen light bulb",
      description: "Use the spare bulbs from the hall closet.",
    });

    render(
      <TaskItem
        task={task}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 4,
        name: "Replace kitchen light bulb",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("task-due-date")).toBeInTheDocument();
    expect(
      screen.getByText("tasks.meta.assignedTo"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("tasks.meta.addedBy"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("formatted:2026-01-01T00:00:00Z").parentElement,
    ).toHaveTextContent("tasks.meta.addedBy");
  });

  it("shows the author's name and relative time, keeping the added-by text for screen readers", () => {
    render(
      <TaskItem
        task={createTask()}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByText("tasks.meta.addedBy")).toHaveClass("sr-only");
    expect(screen.getByText("Alice Johnson")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    const time = screen.getByText("formatted:2026-01-01T00:00:00Z");
    expect(time).toHaveAttribute("dateTime", "2026-01-01T00:00:00Z");
    expect(time).toHaveAttribute("title", "full:2026-01-01T00:00:00Z");
  });

  it("labels the creation time even when the author is unknown", () => {
    render(
      <TaskItem
        task={createTask({ author: null })}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByText("formatted:2026-01-01T00:00:00Z").parentElement,
    ).toHaveTextContent("tasks.meta.added");
    expect(screen.queryByText("tasks.meta.addedBy")).not.toBeInTheDocument();
  });

  it("marks completed tasks with a check and hides the priority", () => {
    const task = createCompletedTask({ priority: "high" });

    render(
      <TaskItem
        task={task}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    const completedBy = screen.getByTestId("task-completed-status");
    expect(completedBy).toHaveTextContent("tasks.meta.completedBy");
    expect(completedBy).toHaveAttribute("data-icon", "Check");
    expect(
      screen.queryByText("tasks.priorityLabel.high"),
    ).not.toBeInTheDocument();
  });

  it("shows completion metadata without assignee chip for completed tasks", () => {
    const task = createCompletedTask({
      title: "Stack firewood",
    });

    render(
      <TaskItem
        task={task}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByTestId("task-due-date")).not.toBeInTheDocument();
    expect(
      screen.getByText("tasks.meta.completedBy"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("tasks.meta.assignedTo"),
    ).not.toBeInTheDocument();
  });

  it("labels the completion time inside the completed status", () => {
    render(
      <TaskItem
        task={createCompletedTask()}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(screen.getByTestId("task-completed-status")).toContainElement(
      screen.getByText("formatted:2026-04-07T12:00:00.000Z"),
    );
  });

  it("falls back to a plain completed label when the completer is unknown", () => {
    const task = createCompletedTask({ assignee: null });

    render(
      <TaskItem
        task={task}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    const completed = screen.getByTestId("task-completed-status");
    expect(completed).toHaveTextContent("tasks.meta.completed");
    expect(completed).toHaveAttribute("data-icon", "Check");
    expect(screen.queryByText("tasks.meta.completedBy")).not.toBeInTheDocument();
    expect(screen.queryByText("tasks.meta.addedBy")).not.toBeInTheDocument();
  });

  it("keeps the delete action keyboard-reachable and reveals it on focus", async () => {
    const user = userEvent.setup();

    render(
      <TaskItem
        task={createTask()}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    await user.tab();

    const deleteButton = screen.getByRole("button", { name: "Delete task" });
    expect(deleteButton).toHaveFocus();
    expect(deleteButton.parentElement).toHaveClass("group-focus-within:opacity-100");
  });
});

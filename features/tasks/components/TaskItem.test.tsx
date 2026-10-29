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
  });

  it("does not show who added an open task or when", () => {
    render(
      <TaskItem
        task={createTask()}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(screen.queryByText("tasks.meta.addedBy")).not.toBeInTheDocument();
    expect(screen.queryByText("tasks.meta.added")).not.toBeInTheDocument();
    expect(screen.queryByText("Alice Johnson")).not.toBeInTheDocument();
    expect(
      screen.queryByText("formatted:2026-01-01T00:00:00Z"),
    ).not.toBeInTheDocument();
  });

  it("hides the description behind a Note disclosure until it is expanded", async () => {
    const user = userEvent.setup();

    render(
      <TaskItem
        task={createTask({ description: "Use the spare bulbs." })}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    const note = screen.getByRole("button", { name: "tasks.item.noteAria" });
    expect(note).toHaveTextContent("tasks.item.note");
    expect(note).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Use the spare bulbs.")).not.toBeVisible();

    const controlledId = note.getAttribute("aria-controls");
    expect(controlledId).toBeTruthy();
    expect(document.getElementById(controlledId ?? "")).toHaveTextContent(
      "Use the spare bulbs.",
    );

    await user.click(note);
    expect(note).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Use the spare bulbs.")).toBeVisible();

    note.focus();
    await user.keyboard("{Enter}");
    expect(note).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText("Use the spare bulbs.")).not.toBeVisible();
  });

  it("shows no Note disclosure when the task has no description", () => {
    render(
      <TaskItem
        task={createTask({ description: null })}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "tasks.item.noteAria" }),
    ).not.toBeInTheDocument();
  });

  it("lets viewers expand the Note disclosure without offering delete", async () => {
    const user = userEvent.setup();

    render(
      <TaskItem
        task={createTask({ description: "Use the spare bulbs." })}
        canManageTasks={false}
        currentUserId="user-2"
        onDelete={vi.fn()}
      />,
    );

    const note = screen.getByRole("button", { name: "tasks.item.noteAria" });
    await user.click(note);

    expect(note).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Use the spare bulbs.")).toBeVisible();
    expect(
      screen.queryByRole("button", { name: "Delete task" }),
    ).not.toBeInTheDocument();
  });

  it("offers the Note disclosure on completed tasks too", () => {
    render(
      <TaskItem
        task={createCompletedTask({ description: "Stacked by the shed." })}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "tasks.item.noteAria" }),
    ).toHaveAttribute("aria-expanded", "false");
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

  it("shows only the completer's name visibly and keeps 'completed by' for screen readers", () => {
    const task = createCompletedTask();
    const name = task.assignee?.displayName ?? "";

    render(
      <TaskItem
        task={task}
        canManageTasks
        currentUserId="user-1"
        onDelete={vi.fn()}
      />,
    );

    const status = screen.getByTestId("task-completed-status");

    expect(name).not.toBe("");
    expect(status).toHaveTextContent(`tasks.meta.completedBy ${name}`);
    expect(screen.getByText("tasks.meta.completedBy")).toHaveClass("sr-only");
    expect(screen.getByText(name)).not.toHaveClass("sr-only");
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

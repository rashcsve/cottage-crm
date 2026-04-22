import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

vi.mock("@/features/tasks/shared/formatTaskDate", () => ({
  formatTaskTimestamp: (timestamp: string) => `formatted:${timestamp}`,
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
      screen.getByRole("heading", { name: "Replace kitchen light bulb" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("task-due-date")).toBeInTheDocument();
    expect(
      screen.getByText("tasks.meta.assignedTo"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("tasks.meta.addedBy"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("formatted:2026-01-01T00:00:00Z"),
    ).toBeInTheDocument();
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
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { createTask, createTaskList } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksPageBody } from "./TasksPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/components/forms/NewTaskForm", () => ({
  NewTaskForm: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="new-task-form">
      <button type="button" onClick={onClose}>
        Close form
      </button>
    </div>
  ),
}));

vi.mock("@/features/tasks/components/TaskGroup", () => ({
  TaskGroup: ({ title }: { title: string }) => (
    <section data-testid="task-group">{title}</section>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

describe("TasksPageBody", () => {
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

  it("opens and closes the composer from the toolbar in the open view", async () => {
    const user = userEvent.setup();

    render(
      <TasksPageBody
        activeFilter="open"
        data={{
          openTasks: createTaskList(2),
          openCount: 2,
          overdueTasks: [createTask({ id: 11, dueKind: "overdue" })],
          overdueCount: 1,
          onTrackTasks: [createTask({ id: 12, dueKind: "dueOn" })],
          onTrackCount: 1,
          doneTasks: [],
          doneCount: 0,
          canManage: true,
          currentUserId: "user-1",
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: "tasks.form.openComposer" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "tasks.form.openComposer" }),
    );

    expect(screen.getByTestId("new-task-form")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close form" }));

    expect(screen.queryByTestId("new-task-form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tasks.form.openComposer" }),
    ).toBeInTheDocument();
  });

  it("does not render the primary add action in the completed view", () => {
    render(
      <TasksPageBody
        activeFilter="done"
        data={{
          openTasks: [],
          openCount: 0,
          overdueTasks: [],
          overdueCount: 0,
          onTrackTasks: [],
          onTrackCount: 0,
          doneTasks: createTaskList(2),
          doneCount: 2,
          canManage: true,
          currentUserId: "user-1",
        }}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "tasks.form.openComposer" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("task-group")).toHaveTextContent(
      "tasks.sections.done.title",
    );
  });
});

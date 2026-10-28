import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { createTask, createTaskList } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksPageBody } from "./TasksPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/components/forms/TaskQuickAdd", () => ({
  TaskQuickAdd: () => <div data-testid="task-quick-add" />,
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

  it("shows the quick-add above the task groups for admins in the open view instead of an Add button", async () => {
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

    const quickAdd = await screen.findByTestId("task-quick-add");
    const [firstGroup] = screen.getAllByTestId("task-group");

    expect(
      quickAdd.compareDocumentPosition(firstGroup) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(firstGroup).not.toContainElement(quickAdd);
    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
  });

  it("does not render the quick-add for viewers", () => {
    render(
      <TasksPageBody
        activeFilter="open"
        data={{
          openTasks: createTaskList(2),
          openCount: 2,
          overdueTasks: [],
          overdueCount: 0,
          onTrackTasks: [],
          onTrackCount: 0,
          doneTasks: [],
          doneCount: 0,
          canManage: false,
          currentUserId: "user-1",
        }}
      />,
    );

    expect(screen.queryByTestId("task-quick-add")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("task-quick-add-placeholder"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
  });

  it("drops the toolbar eyebrow", () => {
    render(
      <TasksPageBody
        activeFilter="open"
        data={{
          openTasks: createTaskList(2),
          openCount: 2,
          overdueTasks: [],
          overdueCount: 0,
          onTrackTasks: [],
          onTrackCount: 0,
          doneTasks: [],
          doneCount: 0,
          canManage: true,
          currentUserId: "user-1",
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "tasks.sections.open.title" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("tasks.sections.open.eyebrow"),
    ).not.toBeInTheDocument();
  });

  it("does not render the quick-add or an add action in the completed view", () => {
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
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("task-quick-add")).not.toBeInTheDocument();
    expect(screen.getByTestId("task-group")).toHaveTextContent(
      "tasks.sections.done.title",
    );
  });
});

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

vi.mock("@/features/tasks/server/actions", () => ({
  deleteTaskAction: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  Link: ({
    href: _href,
    children,
    ...props
  }: {
    href: unknown;
    children: React.ReactNode;
  }) => (
    <a href="#" {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/shared/Toast/useToast", () => {
  const toastApi = {
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };

  return { useToast: () => toastApi };
});

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

  it("shows a title with the count and the filter tabs in the toolbar, without a description or summary", () => {
    render(
      <TasksPageBody
        activeFilter="open"
        data={{
          openTasks: [
            createTask({ id: 11, dueKind: "overdue" }),
            createTask({ id: 12, dueKind: "dueOn" }),
          ],
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
      screen.getByRole("link", { name: "tasks.toolbar.filters.open (2)" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "tasks.sections.open.title" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("collection-toolbar-total")).toHaveTextContent(/^2$/);
    expect(
      screen.getByTestId("collection-toolbar-total").querySelector("svg"),
    ).toBeNull();
    expect(
      screen.queryByText("tasks.sections.open.description"),
    ).not.toBeInTheDocument();
    expect(screen.queryByText(/tasks\.toolbar\.summary/)).not.toBeInTheDocument();
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
    expect(
      screen.getByRole("heading", { level: 2, name: "tasks.sections.done.title" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("collection-toolbar-total")).toHaveTextContent(/^2$/);
    expect(
      screen.getByTestId("collection-toolbar-total").querySelector(".text-success svg"),
    ).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByTestId("task-quick-add")).not.toBeInTheDocument();
    expect(screen.getByTestId("task-group")).toHaveTextContent(
      "tasks.sections.done.title",
    );
  });
});

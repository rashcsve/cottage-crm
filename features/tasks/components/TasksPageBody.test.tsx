import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import type { Task, TasksPageData } from "@/features/tasks/types/tasks";
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
  TaskGroup: ({
    title,
    tone,
    tasks,
    emptyTitle,
    showHeader,
  }: {
    title: string;
    tone?: string;
    tasks: Task[];
    emptyTitle?: string;
    showHeader?: boolean;
  }) => (
    <section
      data-testid="task-group"
      data-tone={tone}
      data-show-header={String(showHeader ?? true)}
      data-task-ids={tasks.map((task) => task.id).join(",")}
    >
      {title}
      {tasks.length === 0 ? <p>{emptyTitle}</p> : null}
    </section>
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

  describe("urgency groups", () => {
    function openData(openTasks: Task[]): TasksPageData {
      return {
        openTasks,
        openCount: openTasks.length,
        overdueTasks: [],
        overdueCount: 0,
        onTrackTasks: [],
        onTrackCount: 0,
        doneTasks: [],
        doneCount: 0,
        canManage: false,
        currentUserId: "user-1",
      };
    }

    function renderedGroups() {
      return screen.getAllByTestId("task-group").map((group) => ({
        title: group.firstChild?.textContent,
        tone: group.getAttribute("data-tone"),
        taskIds: group.getAttribute("data-task-ids"),
      }));
    }

    it("renders Needs attention, Today and Later in that order with their tones and tasks", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          data={openData([
            createTask({ id: 4, dueDate: null, dueKind: null }),
            createTask({ id: 3, dueDate: "2026-04-20", dueKind: "dueOn" }),
            createTask({ id: 2, dueDate: "2026-04-07", dueKind: "dueToday" }),
            createTask({ id: 1, dueDate: "2026-04-01", dueKind: "overdue" }),
          ])}
        />,
      );

      expect(renderedGroups()).toEqual([
        { title: "tasks.groups.needsAttention", tone: "danger", taskIds: "1" },
        { title: "tasks.groups.today", tone: "warning", taskIds: "2" },
        { title: "tasks.groups.later", tone: "neutral", taskIds: "3,4" },
      ]);
    });

    it("lists dated tasks in Later by due date before undated tasks newest created first", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          data={openData([
            createTask({ id: 1, dueDate: null, dueKind: null, createdAt: "2026-04-01T08:00:00Z" }),
            createTask({ id: 2, dueDate: "2026-05-10", dueKind: "dueOn" }),
            createTask({ id: 3, dueDate: null, dueKind: null, createdAt: "2026-04-05T08:00:00Z" }),
            createTask({ id: 4, dueDate: "2026-04-10", dueKind: "dueOn" }),
          ])}
        />,
      );

      expect(renderedGroups()).toEqual([
        { title: "tasks.groups.later", tone: "neutral", taskIds: "4,2,3,1" },
      ]);
    });

    it("hides groups that have no tasks", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          data={openData([
            createTask({ id: 2, dueDate: "2026-04-07", dueKind: "dueToday" }),
          ])}
        />,
      );

      expect(renderedGroups()).toEqual([
        { title: "tasks.groups.today", tone: "warning", taskIds: "2" },
      ]);
    });

    it("shows the open-tasks empty state when there are no open tasks", () => {
      render(<TasksPageBody activeFilter="open" data={openData([])} />);

      const [group] = screen.getAllByTestId("task-group");

      expect(screen.getAllByTestId("task-group")).toHaveLength(1);
      expect(group).toHaveAttribute("data-show-header", "false");
      expect(group).toHaveTextContent("tasks.sections.open.emptyTitle");
      expect(screen.queryByText(/tasks\.groups\./)).not.toBeInTheDocument();
    });
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

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import type { Task, TasksPageData } from "@/features/tasks/types/tasks";
import { createTask, createTaskList } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksPageBody } from "./TasksPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/components/TaskQuickAddBar", () => ({
  TaskQuickAddBar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="task-quick-add-bar">{children}</div>
  ),
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
    href,
    children,
    ...props
  }: {
    href: { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
  }) => (
    <a
      href={`${href.pathname}?${new URLSearchParams(href.query).toString()}`}
      {...props}
    >
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

  it("wraps the task groups in the quick-add for admins in the open view instead of an Add button", async () => {
    render(
      <TasksPageBody
        activeFilter="open"
        activeDue="all"
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
          todayIso: "2026-10-29",
        }}
      />,
    );

    const quickAdd = await screen.findByTestId("task-quick-add-bar");
    const groups = screen.getAllByTestId("task-group");

    expect(groups.length).toBeGreaterThan(0);
    for (const group of groups) {
      expect(quickAdd).toContainElement(group);
      expect(group).not.toContainElement(quickAdd);
    }
    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
  });

  it("does not render the quick-add for viewers", () => {
    render(
      <TasksPageBody
        activeFilter="open"
        activeDue="all"
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
          todayIso: "2026-10-29",
        }}
      />,
    );

    expect(screen.queryByTestId("task-quick-add-bar")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("task-group").length).toBeGreaterThan(0);
    expect(
      screen.queryByTestId("task-quick-add-placeholder"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
  });

  it("shows the open summary and the Open/Completed switch instead of a toolbar", () => {
    render(
      <TasksPageBody
        activeFilter="open"
        activeDue="all"
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
          todayIso: "2026-10-29",
        }}
      />,
    );

    expect(screen.getByText(/^tasks\.summary\.open/)).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "tasks.switch.ariaLabel" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "tasks.switch.open 2" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "tasks.switch.done 0" }),
    ).not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("heading", { level: 2, name: "tasks.sections.open.title" }),
    ).toBeInTheDocument();
    expect(screen.queryByTestId("collection-toolbar-total")).not.toBeInTheDocument();
    expect(screen.queryByText(/tasks\.toolbar\./)).not.toBeInTheDocument();
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
        todayIso: "2026-10-29",
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
          activeDue="all"
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
          activeDue="all"
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
          activeDue="all"
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
      render(<TasksPageBody activeFilter="open" activeDue="all" data={openData([])} />);

      const [group] = screen.getAllByTestId("task-group");

      expect(screen.getAllByTestId("task-group")).toHaveLength(1);
      expect(group).toHaveAttribute("data-show-header", "false");
      expect(group).toHaveTextContent("tasks.sections.open.emptyTitle");
      expect(screen.queryByText(/tasks\.groups\./)).not.toBeInTheDocument();
    });
  });

  describe("due chips", () => {
    const overdue = createTask({ id: 1, dueDate: "2026-10-20", dueKind: "overdue" });
    const dueThisWeek = createTask({ id: 2, dueDate: "2026-11-01", dueKind: "dueOn" });
    const dueNextWeek = createTask({ id: 3, dueDate: "2026-11-02", dueKind: "dueOn" });
    const undated = createTask({ id: 4, dueDate: null, dueKind: null });

    function dueData(openTasks: Task[], doneTasks: Task[] = []): TasksPageData {
      return {
        openTasks,
        openCount: openTasks.length,
        overdueTasks: [],
        overdueCount: 0,
        onTrackTasks: [],
        onTrackCount: 0,
        doneTasks,
        doneCount: doneTasks.length,
        canManage: false,
        currentUserId: "user-1",
        todayIso: "2026-10-29",
      };
    }

    function renderedTaskIds() {
      return screen
        .getAllByTestId("task-group")
        .map((group) => group.getAttribute("data-task-ids"));
    }

    it("shows the due chips in the open view with the active chip current", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          activeDue="week"
          data={dueData([overdue, dueThisWeek])}
        />,
      );

      const nav = screen.getByRole("navigation", {
        name: "tasks.dueFilter.ariaLabel",
      });

      expect(
        within(nav).getByRole("link", { name: "tasks.dueFilter.week" }),
      ).toHaveAttribute("aria-current", "page");
    });

    it("does not show the due chips in the completed view", () => {
      render(
        <TasksPageBody
          activeFilter="done"
          activeDue="all"
          data={dueData([], createTaskList(2))}
        />,
      );

      expect(
        screen.queryByRole("navigation", { name: "tasks.dueFilter.ariaLabel" }),
      ).not.toBeInTheDocument();
    });

    it("groups only the tasks due this week, including overdue, for the week chip", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          activeDue="week"
          data={dueData([overdue, dueThisWeek, dueNextWeek, undated])}
        />,
      );

      expect(renderedTaskIds()).toEqual(["1", "2"]);
    });

    it("groups only undated tasks for the no-date chip", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          activeDue="none"
          data={dueData([overdue, dueThisWeek, undated])}
        />,
      );

      expect(renderedTaskIds()).toEqual(["4"]);
    });

    it("keeps the summary and switch counts unfiltered by the due chip", () => {
      mockUseTranslations.mockImplementation((namespace?: string) => {
        const translator = createTranslatorMock();
        const prefix = namespace ? `${namespace}.` : "";

        return ((key: string, values?: Record<string, unknown>) => {
          const message = translator(`${prefix}${key}`, values);

          return values?.count === undefined
            ? message
            : `${message}:${String(values.count)}`;
        }) as unknown as ReturnType<typeof useTranslations>;
      });

      render(
        <TasksPageBody
          activeFilter="open"
          activeDue="none"
          data={dueData([overdue, dueThisWeek, dueNextWeek, undated])}
        />,
      );

      expect(screen.getByText(/^tasks\.summary\./).textContent).toBe(
        "tasks.summary.open:4 · tasks.summary.overdue:1",
      );
      expect(
        screen.getByRole("link", { name: "tasks.switch.open 4" }),
      ).toBeInTheDocument();
    });

    it.each([
      { label: "no task matches the chip", openTasks: [overdue, dueThisWeek] },
      { label: "there are no open tasks at all", openTasks: [] },
    ])(
      "shows the filtered empty state with a Show all link when $label",
      ({ openTasks }) => {
        render(
          <TasksPageBody
            activeFilter="open"
            activeDue="none"
            data={dueData(openTasks)}
          />,
        );

        expect(screen.getByText("tasks.empty.filteredTitle")).toBeInTheDocument();
        expect(
          screen.getByRole("link", { name: "tasks.empty.showAll" }),
        ).toHaveAttribute("href", "/tasks?filter=open");
        expect(
          screen.queryByText("tasks.sections.open.emptyTitle"),
        ).not.toBeInTheDocument();
        expect(screen.queryByText(/tasks\.groups\./)).not.toBeInTheDocument();
      },
    );

    it("keeps the quick-add for admins when no task matches the chip", async () => {
      render(
        <TasksPageBody
          activeFilter="open"
          activeDue="none"
          data={{ ...dueData([overdue, dueThisWeek]), canManage: true }}
        />,
      );

      expect(await screen.findByTestId("task-quick-add-bar")).toBeInTheDocument();
      expect(screen.getByText("tasks.empty.filteredTitle")).toBeInTheDocument();
    });

    it("keeps the open-tasks empty state without a Show all link when no chip is active", () => {
      render(
        <TasksPageBody activeFilter="open" activeDue="all" data={dueData([])} />,
      );

      expect(
        screen.getByText("tasks.sections.open.emptyTitle"),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: "tasks.empty.showAll" }),
      ).not.toBeInTheDocument();
    });
  });

  it("does not render the quick-add or an add action in the completed view", () => {
    render(
      <TasksPageBody
        activeFilter="done"
        activeDue="all"
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
          todayIso: "2026-10-29",
        }}
      />,
    );

    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "tasks.sections.done.title" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "tasks.switch.done 2" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/^tasks\.summary\.nothingOpen$/)).toBeInTheDocument();
    expect(screen.queryByTestId("task-quick-add-bar")).not.toBeInTheDocument();
    expect(screen.getByTestId("task-group")).toHaveTextContent(
      "tasks.sections.done.title",
    );
  });
});

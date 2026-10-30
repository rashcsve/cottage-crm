import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import type { Task, TasksPageData } from "@/features/tasks/types/tasks";
import { createTask, createTaskList } from "@/tests/fixtures/task-fixtures";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksPageBody } from "./TasksPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/components/TaskQuickAddBar", () => ({
  TaskQuickAddBar: ({
    showControls,
    children,
  }: {
    showControls?: boolean;
    children: (headerTrigger: React.ReactNode) => React.ReactNode;
  }) => (
    <div data-testid="task-quick-add-bar" data-show-controls={String(showControls)}>
      {children(<span data-testid="header-trigger" />)}
    </div>
  ),
}));

vi.mock("@/features/tasks/components/TaskGroup", () => ({
  TaskGroup: ({
    title,
    tone,
    tasks,
    emptyTitle,
    showHeader,
    framed,
  }: {
    title: string;
    tone?: string;
    tasks: Task[];
    emptyTitle?: string;
    showHeader?: boolean;
    framed?: boolean;
  }) => (
    <section
      data-testid="task-group"
      data-tone={tone}
      data-show-header={String(showHeader ?? true)}
      data-framed={String(framed ?? true)}
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

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push }),
  Link: ({
    href,
    children,
    scroll: _scroll,
    onNavigate,
    ...props
  }: {
    href: { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
    scroll?: boolean;
    onNavigate?: (event: { preventDefault: () => void }) => void;
  }) => (
    <a
      href={`${href.pathname}?${new URLSearchParams(href.query).toString()}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.({ preventDefault: () => {} });
      }}
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

  it("wraps the page in the quick-add for admins in the open view and puts its header trigger before the switch", async () => {
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
    expect(quickAdd).toHaveAttribute("data-show-controls", "true");
    const groups = screen.getAllByTestId("task-group");
    const headerTrigger = screen.getByTestId("header-trigger");
    const statusSwitch = screen.getByRole("navigation", {
      name: "tasks.switch.ariaLabel",
    });

    expect(
      headerTrigger.compareDocumentPosition(statusSwitch) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const group of groups) {
      expect(
        headerTrigger.compareDocumentPosition(group) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }

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
      screen.getByRole("link", { name: "tasks.switch.open 2 tasks.switch.countUnit" }),
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "tasks.switch.done 0 tasks.switch.countUnit" }),
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

    it("puts all visible groups in one shared card instead of a card per group", () => {
      render(
        <TasksPageBody
          activeFilter="open"
          activeDue="all"
          data={openData([
            createTask({ id: 3, dueDate: "2026-04-20", dueKind: "dueOn" }),
            createTask({ id: 2, dueDate: "2026-04-07", dueKind: "dueToday" }),
            createTask({ id: 1, dueDate: "2026-04-01", dueKind: "overdue" }),
          ])}
        />,
      );

      const groups = screen.getAllByTestId("task-group");

      expect(groups).toHaveLength(3);
      for (const group of groups) {
        expect(group).toHaveAttribute("data-framed", "false");
        expect(group.parentElement).toBe(groups[0].parentElement);
      }
    });

    it("keeps its own card for the open-tasks empty state and the completed list", () => {
      const { unmount } = render(
        <TasksPageBody activeFilter="open" activeDue="all" data={openData([])} />,
      );

      expect(screen.getByTestId("task-group")).toHaveAttribute("data-framed", "true");
      unmount();

      render(
        <TasksPageBody
          activeFilter="done"
          activeDue="all"
          data={{ ...openData([]), doneTasks: createTaskList(2), doneCount: 2 }}
        />,
      );

      expect(screen.getByTestId("task-group")).toHaveAttribute("data-framed", "true");
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
        screen.getByRole("link", { name: "tasks.switch.open 4 tasks.switch.countUnit:4" }),
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

  it("hides the quick-add controls and any add action in the completed view", () => {
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
      screen.getByRole("link", { name: "tasks.switch.done 2 tasks.switch.countUnit" }),
    ).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/^tasks\.summary\.nothingOpen$/)).toBeInTheDocument();
    expect(screen.getByTestId("task-quick-add-bar")).toHaveAttribute(
      "data-show-controls",
      "false",
    );
    expect(screen.getByTestId("task-group")).toHaveTextContent(
      "tasks.sections.done.title",
    );
  });

  it("keeps keyboard focus on the switch when an admin moves to the completed view", () => {
    const data: TasksPageData = {
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
      todayIso: "2026-10-29",
    };
    const { rerender } = render(
      <TasksPageBody activeFilter="open" activeDue="all" data={data} />,
    );

    const doneLink = screen.getByRole("link", { name: /^tasks\.switch\.done/ });
    doneLink.focus();

    rerender(<TasksPageBody activeFilter="done" activeDue="all" data={data} />);

    expect(screen.getByRole("link", { name: /^tasks\.switch\.done/ })).toHaveFocus();
  });

  describe("switching views", () => {
    const data: TasksPageData = {
      openTasks: createTaskList(2),
      openCount: 2,
      overdueTasks: [],
      overdueCount: 0,
      onTrackTasks: [],
      onTrackCount: 0,
      doneTasks: createTaskList(1),
      doneCount: 1,
      canManage: false,
      currentUserId: "user-1",
      todayIso: "2026-10-29",
    };

    it("navigates to the completed view without scrolling to the top", async () => {
      const user = userEvent.setup();
      render(<TasksPageBody activeFilter="open" activeDue="week" data={data} />);

      await user.click(screen.getByRole("link", { name: /^tasks\.switch\.done/ }));

      expect(push).toHaveBeenCalledWith(
        { pathname: "/tasks", query: { filter: "done" } },
        { scroll: false },
      );
    });

    it("navigates to the chosen due chip without scrolling to the top", async () => {
      const user = userEvent.setup();
      render(<TasksPageBody activeFilter="open" activeDue="all" data={data} />);

      await user.click(screen.getByRole("link", { name: "tasks.dueFilter.none" }));

      expect(push).toHaveBeenCalledWith(
        { pathname: "/tasks", query: { filter: "open", due: "none" } },
        { scroll: false },
      );
    });
  });
});

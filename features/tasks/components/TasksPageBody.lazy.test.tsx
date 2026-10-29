import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { TasksPageData } from "@/features/tasks/types/tasks";
import { dynamicLoads } from "@/tests/utils/spied-dynamic";
import { TasksPageBody } from "./TasksPageBody";

vi.mock("next/dynamic", async () => {
  const { createSpiedDynamic } = await import("@/tests/utils/spied-dynamic");

  return createSpiedDynamic();
});

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string) => `${prefix}${key}`;
  }),
}));

vi.mock("@/features/tasks/components/forms/TaskAddSheetForm", () => ({
  TaskAddSheetForm: () => <div data-testid="task-add-sheet-form" />,
}));

vi.mock("@/features/tasks/components/TaskGroup", () => ({
  TaskGroup: () => null,
}));

vi.mock("@/features/tasks/server/actions", () => ({
  deleteTaskAction: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  Link: ({ children }: { children: React.ReactNode }) => <a href="#">{children}</a>,
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

function createData(canManage: boolean): TasksPageData {
  return {
    openTasks: [],
    openCount: 0,
    overdueTasks: [],
    overdueCount: 0,
    onTrackTasks: [],
    onTrackCount: 0,
    doneTasks: [],
    doneCount: 0,
    canManage,
    currentUserId: "user-1",
    todayIso: "2026-10-29",
  };
}

function queryBars() {
  return screen.queryAllByRole("button", { name: /tasks\.quickAdd\.barLabel/ });
}

describe("TasksPageBody quick-add loading", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("never shows the bar or requests the sheet chunk for viewers", () => {
    render(<TasksPageBody activeFilter="open" activeDue="all" data={createData(false)} />);

    expect(queryBars()).toHaveLength(0);
    expect(dynamicLoads.loader).not.toHaveBeenCalled();
  });

  it("never shows the bar or requests the sheet chunk for admins in the completed view", () => {
    render(<TasksPageBody activeFilter="done" activeDue="all" data={createData(true)} />);

    expect(queryBars()).toHaveLength(0);
    expect(dynamicLoads.loader).not.toHaveBeenCalled();
  });

  it("shows the bar right away and requests the sheet chunk only when an admin opens it", async () => {
    const user = userEvent.setup();

    dynamicLoads.hold();

    render(<TasksPageBody activeFilter="open" activeDue="all" data={createData(true)} />);

    const bars = queryBars();

    expect(bars).toHaveLength(2);
    expect(dynamicLoads.loader).not.toHaveBeenCalled();

    await user.click(bars[1]);

    const dialog = screen.getByRole("dialog", {
      name: "tasks.quickAdd.sheetTitle",
    });

    expect(within(dialog).getByRole("status")).toHaveTextContent(
      "common.loading",
    );
    expect(within(dialog).queryByTestId("task-add-sheet-form")).not.toBeInTheDocument();
    expect(dynamicLoads.loader).toHaveBeenCalledTimes(1);

    await act(async () => {
      dynamicLoads.release();
    });

    expect(
      await within(dialog).findByTestId("task-add-sheet-form"),
    ).toBeInTheDocument();
  });
});

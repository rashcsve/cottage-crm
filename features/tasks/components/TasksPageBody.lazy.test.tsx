import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
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

vi.mock("@/features/tasks/components/forms/TaskQuickAdd", () => ({
  TaskQuickAdd: () => <div data-testid="task-quick-add" />,
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

describe("TasksPageBody quick-add loading", () => {
  it("never requests the quick-add chunk for viewers", () => {
    render(<TasksPageBody activeFilter="open" activeDue="all" data={createData(false)} />);

    expect(dynamicLoads.loader).not.toHaveBeenCalled();
    expect(
      screen.queryByTestId("task-quick-add-placeholder")
    ).not.toBeInTheDocument();
  });

  it("never requests the quick-add chunk for admins in the completed view", () => {
    render(<TasksPageBody activeFilter="done" activeDue="all" data={createData(true)} />);

    expect(dynamicLoads.loader).not.toHaveBeenCalled();
  });

  it("shows an input-shaped placeholder for admins until the chunk arrives", async () => {
    dynamicLoads.hold();

    render(<TasksPageBody activeFilter="open" activeDue="all" data={createData(true)} />);

    const placeholder = screen.getByTestId("task-quick-add-placeholder");

    expect(placeholder).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByTestId("task-quick-add")).not.toBeInTheDocument();
    expect(dynamicLoads.loader).toHaveBeenCalledTimes(1);

    await act(async () => {
      dynamicLoads.release();
    });

    expect(await screen.findByTestId("task-quick-add")).toBeInTheDocument();
    expect(
      screen.queryByTestId("task-quick-add-placeholder")
    ).not.toBeInTheDocument();
  });
});

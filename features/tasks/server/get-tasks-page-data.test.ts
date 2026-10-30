import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "@/features/tasks/types/tasks";

const { getAllTasksMock, getCurrentProfileMock } = vi.hoisted(() => ({
  getAllTasksMock: vi.fn(),
  getCurrentProfileMock: vi.fn(),
}));

vi.mock("@/features/tasks/server/queries", () => ({
  getAllTasks: getAllTasksMock,
}));

vi.mock("@/lib/auth/get-current-profile", () => ({
  getCurrentProfile: getCurrentProfileMock,
}));

import { getTasksPageData } from "./get-tasks-page-data";

function pendingTask(id: number, dueDate: string): Task {
  return {
    id,
    title: `Task ${id}`,
    description: null,
    status: "pending",
    priority: "medium",
    dueDate,
    dueKind: null,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    completedAt: null,
    author: null,
    assignee: null,
    authorId: "author-id",
  };
}

describe("getTasksPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getCurrentProfileMock.mockResolvedValue({ id: "user-1", role: "viewer" });
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-01-14T23:30:00.000Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("uses the Prague date as today just after midnight", async () => {
    getAllTasksMock.mockResolvedValue([]);

    const { todayIso } = await getTasksPageData();

    expect(todayIso).toBe("2026-01-15");
    expect(getAllTasksMock).toHaveBeenCalledWith("2026-01-15");
  });

  it("treats a task due yesterday in Prague as overdue just after midnight", async () => {
    getAllTasksMock.mockResolvedValue([
      pendingTask(1, "2026-01-14"),
      pendingTask(2, "2026-01-15"),
    ]);

    const { overdueTasks, onTrackTasks } = await getTasksPageData();

    expect(overdueTasks.map((task) => task.id)).toEqual([1]);
    expect(onTrackTasks.map((task) => task.id)).toEqual([2]);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseTableMock } from "@/tests/utils/create-supabase-table-mock";

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { getOpenTasks } from "./queries";

const TODAY = "2026-05-10";

function taskRow(id: number, status: "pending" | "done", dueDate: string | null) {
  return {
    id,
    title: `Task ${id}`,
    description: null,
    status,
    priority: "medium",
    author_id: "author-id",
    assignee_id: null,
    due_date: dueDate,
    created_at: `2026-04-0${id}T10:00:00.000Z`,
    updated_at: `2026-04-0${id}T10:00:00.000Z`,
    completed_at: null,
    author: { display_name: "Alice Johnson" },
    assignee: null,
  };
}

describe("getOpenTasks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("fetches only pending tasks, newest first, with due kinds relative to today", async () => {
    const { client, queries } = createSupabaseTableMock({
      tasks: [
        taskRow(1, "pending", "2026-05-01"),
        taskRow(2, "done", "2026-05-01"),
        taskRow(3, "pending", TODAY),
      ],
    });
    createClientMock.mockResolvedValue(client);

    const tasks = await getOpenTasks(TODAY);

    expect(queries).toHaveLength(1);
    expect(queries[0].table).toBe("tasks");
    expect(queries[0].calls).toContainEqual(["eq", "status", "pending"]);
    expect(queries[0].calls).toContainEqual([
      "order",
      "created_at",
      { ascending: false },
    ]);
    expect(tasks.map((task) => [task.id, task.dueKind])).toEqual([
      [3, "dueToday"],
      [1, "overdue"],
    ]);
  });

  it("throws when the query fails", async () => {
    const { client } = createSupabaseTableMock(
      { tasks: [] },
      { tasks: { message: "boom" } },
    );
    createClientMock.mockResolvedValue(client);

    await expect(getOpenTasks(TODAY)).rejects.toThrow("Failed to fetch tasks");
  });
});

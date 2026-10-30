import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSupabaseTableMock } from "@/tests/utils/create-supabase-table-mock";

const { createClientMock, isE2EMockModeEnabledMock, getE2EMockDashboardOverviewDataMock } =
  vi.hoisted(() => ({
    createClientMock: vi.fn(),
    isE2EMockModeEnabledMock: vi.fn(),
    getE2EMockDashboardOverviewDataMock: vi.fn(),
  }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

vi.mock("@/lib/e2e/mock-mode", () => ({
  isE2EMockModeEnabled: isE2EMockModeEnabledMock,
}));

vi.mock("@/lib/e2e/mock-data", () => ({
  getE2EMockDashboardOverviewData: getE2EMockDashboardOverviewDataMock,
}));

import { startDashboardStreaming } from "./get-dashboard-overview-data";

const TODAY = "2026-05-10";
const author = { display_name: "Alice Johnson" };

function visitRow(id: number, visitorName: string, dateFrom: string, dateTo: string) {
  return {
    id,
    visitor_name: visitorName,
    couple: "couple-1",
    date_from: dateFrom,
    date_to: dateTo,
    note: null,
    author_id: "author-id",
    created_at: `2026-04-0${id}T10:00:00.000Z`,
    author,
  };
}

function taskRow(
  id: number,
  overrides: { status?: "pending" | "done"; priority?: "low" | "medium" | "high"; due_date?: string | null },
) {
  return {
    id,
    title: `Task ${id}`,
    description: null,
    status: overrides.status ?? "pending",
    priority: overrides.priority ?? "medium",
    author_id: "author-id",
    assignee_id: null,
    due_date: overrides.due_date ?? null,
    created_at: `2026-04-${String(10 + id)}T10:00:00.000Z`,
    updated_at: `2026-04-${String(10 + id)}T10:00:00.000Z`,
    completed_at: overrides.status === "done" ? "2026-05-01T10:00:00.000Z" : null,
    author,
    assignee: null,
  };
}

function shoppingRow(id: number, isChecked: boolean, createdAt: string) {
  return {
    id,
    title: `Item ${id}`,
    is_checked: isChecked,
    author_id: "author-id",
    brought_by_id: null,
    created_at: createdAt,
    author,
    brought_by: null,
  };
}

function noteRow(id: number, createdAt: string) {
  return {
    id,
    content: `Note ${id}`,
    author_id: "author-id",
    created_at: createdAt,
    author,
  };
}

const TABLES = {
  visits: [
    visitRow(1, "Past", "2026-05-01", "2026-05-03"),
    visitRow(2, "Zuzana", "2026-05-08", "2026-05-12"),
    visitRow(3, "Adam", "2026-05-08", "2026-05-12"),
    visitRow(4, "Ending today", "2026-05-05", "2026-05-10"),
    visitRow(5, "Later", "2026-06-01", "2026-06-03"),
    visitRow(6, "Next", "2026-05-20", "2026-05-22"),
  ],
  tasks: [
    taskRow(1, { priority: "high", due_date: "2026-05-01" }),
    taskRow(2, { priority: "low", due_date: TODAY }),
    taskRow(3, { priority: "high", due_date: "2026-05-20" }),
    taskRow(4, { priority: "high" }),
    taskRow(5, { due_date: "2026-05-05" }),
    taskRow(6, { status: "done", due_date: "2026-05-01" }),
    taskRow(7, { status: "done" }),
  ],
  shopping_items: [
    shoppingRow(1, false, "2026-04-01T10:00:00.000Z"),
    shoppingRow(2, true, "2026-04-02T10:00:00.000Z"),
    shoppingRow(3, false, "2026-04-03T10:00:00.000Z"),
    shoppingRow(4, false, "2026-04-04T10:00:00.000Z"),
    shoppingRow(5, true, "2026-04-05T10:00:00.000Z"),
    shoppingRow(6, false, "2026-04-06T10:00:00.000Z"),
    shoppingRow(7, false, "2026-04-07T10:00:00.000Z"),
    shoppingRow(8, false, "2026-03-30T10:00:00.000Z"),
    shoppingRow(9, false, "2026-03-29T10:00:00.000Z"),
  ],
  notes: [
    noteRow(1, "2026-04-01T10:00:00.000Z"),
    noteRow(2, "2026-04-03T10:00:00.000Z"),
    noteRow(3, "2026-04-02T10:00:00.000Z"),
  ],
};

function useTables(errors: Record<string, { message: string }> = {}) {
  const { client } = createSupabaseTableMock(TABLES, errors);
  createClientMock.mockResolvedValue(client);
}

describe("startDashboardStreaming", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
    isE2EMockModeEnabledMock.mockReturnValue(false);
  });

  it("streams current visits sorted by start, end and name, and the next upcoming visit", async () => {
    useTables();

    const visits = await startDashboardStreaming(TODAY).visitsPromise;

    expect(visits.currentVisits.map((visit) => visit.id)).toEqual([4, 3, 2]);
    expect(visits.currentCount).toBe(3);
    expect(visits.upcomingCount).toBe(2);
    expect(visits.nextVisit).toEqual({
      id: 6,
      visitorName: "Next",
      couple: "couple-1",
      coupleLabel: null,
      dateFrom: "2026-05-20",
      dateTo: "2026-05-22",
      status: "upcoming",
      note: null,
      author: "Alice Johnson",
      authorId: "author-id",
      createdAt: "2026-04-06T10:00:00.000Z",
    });
  });

  it("returns no next visit when nothing is upcoming", async () => {
    const { client } = createSupabaseTableMock({
      ...TABLES,
      visits: [visitRow(1, "Past", "2026-05-01", "2026-05-03")],
    });
    createClientMock.mockResolvedValue(client);

    const visits = await startDashboardStreaming(TODAY).visitsPromise;

    expect(visits).toEqual({
      currentVisits: [],
      nextVisit: null,
      currentCount: 0,
      upcomingCount: 0,
    });
  });

  it("counts open, overdue and due-today tasks and previews the three most urgent open ones", async () => {
    useTables();

    const { tasks } = await startDashboardStreaming(TODAY).bulkPromise;

    expect(tasks.openCount).toBe(5);
    expect(tasks.overdueCount).toBe(2);
    expect(tasks.dueTodayCount).toBe(1);
    expect(tasks.priorityTasks.map((task) => task.id)).toEqual([1, 5, 2]);
    expect(tasks.priorityTasks.map((task) => task.dueKind)).toEqual([
      "overdue",
      "overdue",
      "dueToday",
    ]);
  });

  it("counts pending and purchased shopping items and previews the five newest pending ones", async () => {
    useTables();

    const { shopping } = await startDashboardStreaming(TODAY).bulkPromise;

    expect(shopping.pendingCount).toBe(7);
    expect(shopping.purchasedCount).toBe(2);
    expect(shopping.pendingItems.map((item) => item.id)).toEqual([7, 6, 4, 3, 1]);
    expect(shopping.pendingItems[0]).toEqual({
      id: 7,
      title: "Item 7",
      isChecked: false,
      author: "Alice Johnson",
      authorId: "author-id",
      broughtBy: null,
      broughtById: null,
      createdAt: "2026-04-07T10:00:00.000Z",
    });
  });

  it("previews the two newest notes", async () => {
    useTables();

    const { notes } = await startDashboardStreaming(TODAY).bulkPromise;

    expect(notes.recentNotes.map((note) => note.id)).toEqual([2, 3]);
  });

  it("rejects the visits section when the visits query fails", async () => {
    useTables({ visits: { message: "boom" } });

    const { visitsPromise, bulkPromise } = startDashboardStreaming(TODAY);

    await expect(visitsPromise).rejects.toThrow();
    await expect(bulkPromise).resolves.toBeDefined();
  });

  it.each(["tasks", "shopping_items", "notes"])(
    "rejects the bulk section when the %s query fails",
    async (table) => {
      useTables({ [table]: { message: "boom" } });

      const { visitsPromise, bulkPromise } = startDashboardStreaming(TODAY);

      await expect(bulkPromise).rejects.toThrow();
      await expect(visitsPromise).resolves.toBeDefined();
    },
  );

  it("uses the E2E mock data and never creates a Supabase client in mock mode", async () => {
    isE2EMockModeEnabledMock.mockReturnValue(true);
    getE2EMockDashboardOverviewDataMock.mockReturnValue({
      todayIso: TODAY,
      visits: { currentVisits: [], nextVisit: null, currentCount: 0, upcomingCount: 1 },
      tasks: { openCount: 2, overdueCount: 0, dueTodayCount: 0, priorityTasks: [] },
      shopping: { pendingCount: 3, purchasedCount: 0, pendingItems: [] },
      notes: { recentNotes: [] },
    });

    const { visitsPromise, bulkPromise } = startDashboardStreaming(TODAY);

    await expect(visitsPromise).resolves.toEqual({
      currentVisits: [],
      nextVisit: null,
      currentCount: 0,
      upcomingCount: 1,
    });
    await expect(bulkPromise).resolves.toEqual({
      tasks: { openCount: 2, overdueCount: 0, dueTodayCount: 0, priorityTasks: [] },
      shopping: { pendingCount: 3, purchasedCount: 0, pendingItems: [] },
      notes: { recentNotes: [] },
    });
    expect(createClientMock).not.toHaveBeenCalled();
  });
});

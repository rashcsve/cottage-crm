import { describe, expect, it } from "vitest";

import {
  deriveDashboardNotesOverview,
  deriveDashboardShoppingOverview,
  deriveDashboardTaskOverview,
  deriveDashboardVisitOverview,
} from "@/features/dashboard/domain/overview";
import type { Note } from "@/features/notes/types/notes";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import type { Visit } from "@/features/visits/types/visits";
import {
  createDueTodayTask,
  createFutureTask,
  createOverdueTask,
  createTaskWithoutDueDate,
  REFERENCE_DATE,
} from "@/tests/fixtures/task-fixtures";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";

function createVisit(overrides: Partial<Visit>): Visit {
  return {
    id: 1,
    visitorName: "Svetlana",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming",
    note: null,
    author: "Svetlana",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function createShoppingItem(overrides: Partial<ShoppingItem>): ShoppingItem {
  return {
    id: 1,
    title: "Coffee",
    isChecked: false,
    author: "Svetlana",
    authorId: "user-1",
    broughtBy: null,
    broughtById: null,
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function createNote(overrides: Partial<Note>): Note {
  return {
    id: 1,
    content: "Gate key moved to the kitchen shelf.",
    author: "Svetlana",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    photos: [],
    ...overrides,
  };
}

describe("dashboard overview derivation", () => {
  it("finds current visitors and the next upcoming visit", () => {
    const result = deriveDashboardVisitOverview([
      createVisit({
        id: 3,
        visitorName: "May stay",
        dateFrom: "2026-05-01",
        dateTo: "2026-05-03",
      }),
      createVisit({
        id: 1,
        visitorName: "Current stay",
        dateFrom: "2026-04-08",
        dateTo: "2026-04-12",
        status: "current",
      }),
      createVisit({
        id: 2,
        visitorName: "April stay",
        dateFrom: "2026-04-20",
        dateTo: "2026-04-21",
      }),
    ]);

    expect(result.currentCount).toBe(1);
    expect(result.currentVisits[0].visitorName).toBe("Current stay");
    expect(result.upcomingCount).toBe(2);
    expect(result.nextVisit?.visitorName).toBe("April stay");
  });

  it("prioritizes overdue and due-today tasks for the dashboard", () => {
    const tasks = [
      createFutureTask({ id: 3, priority: "high" }),
      createTaskWithoutDueDate({ id: 4, priority: "high" }),
      createDueTodayTask({ id: 2, priority: "low" }, REFERENCE_DATE),
      createOverdueTask({ id: 1, priority: "medium" }),
    ];
    const categorized = categorizeTasksForPage(tasks, REFERENCE_DATE);

    const result = deriveDashboardTaskOverview(categorized);

    expect(result.openCount).toBe(4);
    expect(result.overdueCount).toBe(1);
    expect(result.dueTodayCount).toBe(1);
    expect(result.priorityTasks.map((task) => task.id)).toEqual([1, 2, 3]);
  });

  it("keeps shopping and note previews short", () => {
    const shopping = deriveDashboardShoppingOverview(
      [
        createShoppingItem({ id: 1 }),
        createShoppingItem({ id: 2 }),
        createShoppingItem({ id: 3 }),
        createShoppingItem({ id: 4 }),
      ],
      [createShoppingItem({ id: 5, isChecked: true })],
    );
    const notes = deriveDashboardNotesOverview([
      createNote({ id: 1, createdAt: "2026-04-01T10:00:00.000Z" }),
      createNote({ id: 2, createdAt: "2026-04-03T10:00:00.000Z" }),
      createNote({ id: 3, createdAt: "2026-04-02T10:00:00.000Z" }),
    ]);

    expect(shopping.pendingCount).toBe(4);
    expect(shopping.purchasedCount).toBe(1);
    expect(shopping.pendingItems.map((item) => item.id)).toEqual([1, 2, 3]);
    expect(notes.recentNotes.map((note) => note.id)).toEqual([2, 3]);
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

vi.mock("next-intl/server", async () => {
  const { createNamespacedTranslatorMock } = await import(
    "@/tests/utils/create-server-translations-mock"
  );

  return {
    getTranslations: vi.fn(async (namespace: string) =>
      createNamespacedTranslatorMock(namespace),
    ),
  };
});

vi.mock("@/features/tasks/shared/formatTaskDate", () => ({
  formatTaskDueDate: (date: string) => `due:${date}`,
}));

vi.mock("@/features/shopping/shared/formatShoppingDate", () => ({
  formatShoppingTimestamp: (date: string) => `shopping:${date}`,
}));

vi.mock("@/features/notes/shared/formatNoteDate", () => ({
  formatNoteTimestamp: (date: string) => `note:${date}`,
}));

import type { DashboardBulkSectionData } from "@/features/dashboard/types/dashboard";
import type { Note } from "@/features/notes/types/notes";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import { createTask, mockAssignee, mockAuthor } from "@/tests/fixtures/task-fixtures";

import { DashboardPreviewCards } from "./DashboardPreviewCards";

const NS = "dashboard.overview";

function createShoppingItem(overrides: Partial<ShoppingItem> = {}): ShoppingItem {
  return {
    id: 1,
    title: "Firewood",
    isChecked: false,
    author: "Alice",
    authorId: "user-1",
    broughtBy: null,
    broughtById: null,
    createdAt: "2026-10-20T08:00:00Z",
    ...overrides,
  };
}

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 1,
    content: "Water heater fixed.",
    author: "Bob",
    authorId: "user-2",
    createdAt: "2026-10-19T18:00:00Z",
    photos: [],
    ...overrides,
  };
}

function createData(
  overrides: Partial<DashboardBulkSectionData> = {},
): DashboardBulkSectionData {
  return {
    tasks: { openCount: 0, overdueCount: 0, dueTodayCount: 0, priorityTasks: [] },
    shopping: { pendingCount: 0, purchasedCount: 0, pendingItems: [] },
    notes: { recentNotes: [] },
    ...overrides,
  };
}

async function renderPreviews(data: DashboardBulkSectionData) {
  render(await DashboardPreviewCards({ data, locale: "en" }));
}

function getCard(title: string) {
  return screen.getByRole("region", { name: title });
}

describe("DashboardPreviewCards", () => {
  it("renders a labelled section with notes first, then to-dos and supplies", async () => {
    await renderPreviews(createData());

    const section = screen.getByRole("region", { name: `${NS}.preview.ariaLabel` });
    expect(
      within(section)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([`${NS}.notes.title`, `${NS}.tasks.title`, `${NS}.shopping.title`]);

    for (const area of ["notes", "tasks", "shopping"]) {
      expect(within(section).getByRole("region", { name: `${NS}.${area}.title` }))
        .toBeInTheDocument();
    }
  });

  it("links each card's CTA to its page", async () => {
    await renderPreviews(createData());

    expect(screen.getByRole("link", { name: `${NS}.tasks.cta` })).toHaveAttribute(
      "href",
      "/tasks",
    );
    expect(
      screen.getByRole("link", { name: `${NS}.shopping.cta` }),
    ).toHaveAttribute("href", "/shopping");
    expect(screen.getByRole("link", { name: `${NS}.notes.cta` })).toHaveAttribute(
      "href",
      "/notes",
    );
  });

  it("shows the empty state in every card when there is no data", async () => {
    await renderPreviews(createData());

    for (const area of ["tasks", "shopping", "notes"]) {
      const card = getCard(`${NS}.${area}.title`);
      expect(within(card).getByText(`${NS}.${area}.emptyTitle`)).toBeInTheDocument();
      expect(
        within(card).getByText(`${NS}.${area}.emptyDescription`),
      ).toBeInTheDocument();
      expect(within(card).queryByRole("list")).not.toBeInTheDocument();
    }
  });

  it("lists priority tasks as rows linking to to-dos, with due status and priority words", async () => {
    await renderPreviews(
      createData({
        tasks: {
          openCount: 7,
          overdueCount: 1,
          dueTodayCount: 0,
          priorityTasks: [
            createTask({
              id: 1,
              title: "Fix the gate",
              priority: "high",
              assignee: mockAssignee,
              dueDate: "2026-10-20",
              dueKind: "overdue",
            }),
            createTask({
              id: 2,
              title: "Clean gutters",
              priority: "low",
              assignee: null,
              author: mockAuthor,
              dueDate: null,
              dueKind: null,
            }),
            createTask({
              id: 3,
              title: "Mow the lawn",
              priority: "medium",
              assignee: null,
              author: null,
              dueDate: null,
              dueKind: null,
            }),
          ],
        },
      }),
    );

    const card = getCard(`${NS}.tasks.title`);

    const items = within(card).getAllByRole("listitem");
    expect(items).toHaveLength(3);

    const rowLinks = items.map((item) => within(item).getByRole("link"));
    for (const link of rowLinks) {
      expect(link).toHaveAttribute("href", "/tasks");
    }

    expect(rowLinks[0]).toHaveTextContent("Fix the gate");
    expect(rowLinks[0]).toHaveTextContent("tasks.dueDate.overdue due:2026-10-20");
    expect(rowLinks[0]).toHaveTextContent("tasks.priorityLabel.high");
    expect(rowLinks[1]).toHaveTextContent("Clean gutters");
    expect(rowLinks[1]).toHaveTextContent("tasks.priorityLabel.low");
    expect(rowLinks[1]).not.toHaveTextContent("tasks.dueDate");
    expect(rowLinks[2]).toHaveTextContent("Mow the lawn");
    expect(rowLinks[2]).toHaveTextContent("tasks.priorityLabel.medium");
  });

  it("lists pending shopping items with their added date", async () => {
    await renderPreviews(
      createData({
        shopping: {
          pendingCount: 4,
          purchasedCount: 1,
          pendingItems: [createShoppingItem()],
        },
      }),
    );

    const card = getCard(`${NS}.shopping.title`);

    const [item] = within(card).getAllByRole("listitem");
    expect(item).toHaveTextContent("Firewood");
    const added = within(item).getByText("shopping:2026-10-20T08:00:00Z");
    expect(added.tagName).toBe("TIME");
    expect(added).toHaveAttribute("dateTime", "2026-10-20T08:00:00Z");
  });

  it("lists recent notes with author, timestamp and full content", async () => {
    const longContent = "a".repeat(150);

    await renderPreviews(
      createData({
        notes: {
          recentNotes: [createNote(), createNote({ id: 2, content: longContent })],
        },
      }),
    );

    const card = getCard(`${NS}.notes.title`);

    const items = within(card).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText("Bob")).toBeInTheDocument();
    expect(within(items[0]).getByText("Water heater fixed.")).toBeInTheDocument();
    const timestamp = within(items[0]).getByText("note:2026-10-19T18:00:00Z");
    expect(timestamp.tagName).toBe("TIME");
    expect(timestamp).toHaveAttribute("dateTime", "2026-10-19T18:00:00Z");

    expect(within(items[1]).getByText(longContent)).toBeInTheDocument();
  });

  it("puts all three previews in one grid so they can share a desktop row", async () => {
    await renderPreviews(createData());

    const [notes, tasks, shopping] = ["notes", "tasks", "shopping"].map((area) =>
      getCard(`${NS}.${area}.title`),
    );
    expect(tasks.parentElement).toBe(notes.parentElement);
    expect(shopping.parentElement).toBe(notes.parentElement);
  });

  // Desktop row limits are CSS-only (mobile keeps every row), so the
  // breakpoint class is the behaviour under test here.
  it("hides rows beyond 2 to-dos, 2 supplies and 1 note on desktop only", async () => {
    await renderPreviews(
      createData({
        tasks: {
          openCount: 3,
          overdueCount: 0,
          dueTodayCount: 0,
          priorityTasks: [
            createTask({ id: 1, title: "One" }),
            createTask({ id: 2, title: "Two" }),
            createTask({ id: 3, title: "Three" }),
          ],
        },
        shopping: {
          pendingCount: 3,
          purchasedCount: 0,
          pendingItems: [
            createShoppingItem({ id: 1, title: "Firewood" }),
            createShoppingItem({ id: 2, title: "Matches" }),
            createShoppingItem({ id: 3, title: "Coffee" }),
          ],
        },
        notes: { recentNotes: [createNote(), createNote({ id: 2 })] },
      }),
    );

    const desktopHidden = (area: string) =>
      within(getCard(`${NS}.${area}.title`))
        .getAllByRole("listitem")
        .map((item) => item.classList.contains("lg:hidden"));

    expect(desktopHidden("tasks")).toEqual([false, false, true]);
    expect(desktopHidden("shopping")).toEqual([false, false, true]);
    expect(desktopHidden("notes")).toEqual([false, true]);
  });
});

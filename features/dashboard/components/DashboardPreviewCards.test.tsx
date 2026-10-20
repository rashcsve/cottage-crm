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
  const heading = screen.getByRole("heading", { level: 2, name: title });
  const card = heading.closest("section > *");

  if (!(card instanceof HTMLElement)) {
    throw new Error(`Card for "${title}" not found`);
  }

  return card;
}

describe("DashboardPreviewCards", () => {
  it("renders a labelled section with three h2 preview cards", async () => {
    await renderPreviews(createData());

    const section = screen.getByRole("region", { name: `${NS}.preview.ariaLabel` });
    expect(
      within(section)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual([`${NS}.tasks.title`, `${NS}.shopping.title`, `${NS}.notes.title`]);

    for (const area of ["tasks", "shopping", "notes"]) {
      expect(within(section).getByText(`${NS}.${area}.eyebrow`)).toBeInTheDocument();
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

  it("shows the empty state and a zero count in every card when there is no data", async () => {
    await renderPreviews(createData());

    for (const area of ["tasks", "shopping", "notes"]) {
      const card = getCard(`${NS}.${area}.title`);
      expect(within(card).getByText("0")).toBeInTheDocument();
      expect(within(card).getByText(`${NS}.${area}.emptyTitle`)).toBeInTheDocument();
      expect(
        within(card).getByText(`${NS}.${area}.emptyDescription`),
      ).toBeInTheDocument();
      expect(within(card).queryByRole("list")).not.toBeInTheDocument();
    }
  });

  it("lists priority tasks with priority, owner and due date meta", async () => {
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
    expect(within(card).getByText("7")).toBeInTheDocument();

    const items = within(card).getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("Fix the gate");
    expect(items[0]).toHaveTextContent(
      "tasks.priority.high · Bob Smith · tasks.dueDate.overdue due:2026-10-20",
    );
    expect(items[1]).toHaveTextContent("Clean gutters");
    expect(items[1]).toHaveTextContent("tasks.priority.low · Alice Johnson");
    expect(items[2]).toHaveTextContent(
      `tasks.priority.medium · ${NS}.tasks.fallbackMeta`,
    );
  });

  it("lists pending shopping items with author and date byline", async () => {
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
    expect(within(card).getByText("4")).toBeInTheDocument();

    const [item] = within(card).getAllByRole("listitem");
    expect(item).toHaveTextContent("Firewood");
    expect(item).toHaveTextContent(
      `${NS}.shopping.byline {"author":"Alice","date":"shopping:2026-10-20T08:00:00Z"}`,
    );
  });

  it("lists recent notes, counting them and truncating long content", async () => {
    const longContent = "a".repeat(150);

    await renderPreviews(
      createData({
        notes: {
          recentNotes: [createNote(), createNote({ id: 2, content: longContent })],
        },
      }),
    );

    const card = getCard(`${NS}.notes.title`);
    expect(within(card).getByText("2")).toBeInTheDocument();

    const items = within(card).getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Water heater fixed.");
    expect(items[0]).toHaveTextContent(
      `${NS}.notes.byline {"author":"Bob","date":"note:2026-10-19T18:00:00Z"}`,
    );
    expect(within(items[1]).getByText(`${"a".repeat(109)}...`)).toBeInTheDocument();
  });
});

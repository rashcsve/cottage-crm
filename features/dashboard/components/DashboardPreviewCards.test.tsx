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

vi.mock("@/features/dashboard/domain/relative-time", () => ({
  formatRelativeTimestamp: (value: string, _now: Date, locale: string) =>
    `rel:${locale}:${value}`,
}));

import type { DashboardBulkSectionData } from "@/features/dashboard/types/dashboard";
import type { Note } from "@/features/notes/types/notes";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import { createTask, mockAssignee } from "@/tests/fixtures/task-fixtures";

import { DashboardPreviewCards } from "./DashboardPreviewCards";

const NS = "dashboard.overview";
const AREAS = ["tasks", "shopping", "notes"] as const;

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

function getGroup(area: string) {
  return screen.getByRole("region", { name: `${NS}.${area}.title` });
}

describe("DashboardPreviewCards", () => {
  it("groups to-dos, supplies and notes in that order inside one card", async () => {
    await renderPreviews(createData());

    const section = screen.getByRole("region", { name: `${NS}.preview.ariaLabel` });
    expect(
      within(section)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent),
    ).toEqual(AREAS.map((area) => `${NS}.${area}.title`));

    const [tasks, shopping, notes] = AREAS.map(getGroup);
    expect(shopping.parentElement).toBe(tasks.parentElement);
    expect(notes.parentElement).toBe(tasks.parentElement);
  });

  it("links every group to its page with a link naming the area", async () => {
    await renderPreviews(createData());

    const hrefs = { tasks: "/tasks", shopping: "/shopping", notes: "/notes" };
    for (const area of AREAS) {
      const link = within(getGroup(area)).getByRole("link", {
        name: `${NS}.${area}.allLabel`,
      });
      expect(link).toHaveAttribute("href", hrefs[area]);
      expect(link).toHaveTextContent(`${NS}.preview.all`);
    }
  });

  it("keeps the dot before a group count out of the spoken text", async () => {
    await renderPreviews(
      createData({
        tasks: { openCount: 6, overdueCount: 0, dueTodayCount: 0, priorityTasks: [] },
      }),
    );

    const count = within(getGroup("tasks")).getByTestId("preview-count");
    expect(within(count).getByText("·")).toHaveAttribute("aria-hidden", "true");
  });

  it("shows the open to-do and to-buy counts next to the group titles", async () => {
    await renderPreviews(
      createData({
        tasks: { openCount: 6, overdueCount: 2, dueTodayCount: 0, priorityTasks: [] },
        shopping: { pendingCount: 4, purchasedCount: 1, pendingItems: [] },
      }),
    );

    expect(within(getGroup("tasks")).getByTestId("preview-count")).toHaveTextContent(
      "6",
    );
    expect(
      within(getGroup("shopping")).getByTestId("preview-count"),
    ).toHaveTextContent("4");
    expect(
      within(getGroup("notes")).queryByTestId("preview-count"),
    ).not.toBeInTheDocument();
  });

  it("hides the counts when nothing is open", async () => {
    await renderPreviews(createData());

    expect(screen.queryByTestId("preview-count")).not.toBeInTheDocument();
  });

  it("shows an empty state in every group when there is no data", async () => {
    await renderPreviews(createData());

    for (const area of AREAS) {
      const group = getGroup(area);
      expect(within(group).getByText(`${NS}.${area}.emptyTitle`)).toBeInTheDocument();
      expect(
        within(group).getByText(`${NS}.${area}.emptyDescription`),
      ).toBeInTheDocument();
      expect(within(group).queryByRole("list")).not.toBeInTheDocument();
    }
  });

  it("lists priority to-dos as read-only title links without due dates", async () => {
    await renderPreviews(
      createData({
        tasks: {
          openCount: 7,
          overdueCount: 1,
          dueTodayCount: 1,
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
              dueDate: "2026-10-30",
              dueKind: "dueToday",
            }),
            createTask({ id: 3, title: "Mow the lawn", dueDate: null, dueKind: null }),
          ],
        },
      }),
    );

    const group = getGroup("tasks");
    const rowLinks = within(group)
      .getAllByRole("listitem")
      .map((item) => within(item).getByRole("link"));

    expect(rowLinks).toHaveLength(3);
    for (const link of rowLinks) {
      expect(link).toHaveAttribute("href", "/tasks");
    }
    expect(rowLinks[1]).toHaveAccessibleName("Clean gutters");
    expect(rowLinks[2]).toHaveAccessibleName("Mow the lawn");

    expect(within(group).queryByText(/due:/)).not.toBeInTheDocument();
    expect(within(group).queryByText(/dueDate\.dueToday/)).not.toBeInTheDocument();
    expect(within(group).queryByRole("checkbox")).not.toBeInTheDocument();
    expect(within(group).queryByRole("button")).not.toBeInTheDocument();
    expect(within(group).queryByText(/priorityLabel/)).not.toBeInTheDocument();
  });

  it("marks an overdue to-do with a warning icon before its title and a spoken label", async () => {
    await renderPreviews(
      createData({
        tasks: {
          openCount: 1,
          overdueCount: 1,
          dueTodayCount: 0,
          priorityTasks: [
            createTask({
              id: 1,
              title: "Fix the gate",
              dueDate: "2026-10-20",
              dueKind: "overdue",
            }),
          ],
        },
      }),
    );

    const link = within(getGroup("tasks")).getByRole("link", {
      name: "tasks.dueDate.overdue Fix the gate",
    });
    const icon = link.querySelector("svg");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(link.firstElementChild).toContainElement(icon);
  });

  it("shows up to five supply tags with the rest counted for phone and desktop", async () => {
    await renderPreviews(
      createData({
        shopping: {
          pendingCount: 8,
          purchasedCount: 1,
          pendingItems: ["Milk", "Matches", "Coffee", "Bread", "Eggs"].map(
            (title, index) => createShoppingItem({ id: index + 1, title }),
          ),
        },
      }),
    );

    const group = getGroup("shopping");
    const tags = within(group).getAllByRole("listitem");
    expect(tags.slice(0, 5).map((tag) => tag.textContent)).toEqual([
      "Milk",
      "Matches",
      "Coffee",
      "Bread",
      "Eggs",
    ]);
    expect(tags.slice(5).map((tag) => tag.textContent)).toEqual([
      `+5${NS}.shopping.moreItems {"count":5}`,
      `+3${NS}.shopping.moreItems {"count":3}`,
    ]);
    expect(within(group).getByText("+3")).toHaveAttribute("aria-hidden", "true");
    expect(within(group).queryByText("Alice")).not.toBeInTheDocument();
  });

  it("shows long supply titles instead of dropping them", async () => {
    const longTitle = "Extra long garden hose for the back yard";
    await renderPreviews(
      createData({
        shopping: {
          pendingCount: 2,
          purchasedCount: 0,
          pendingItems: [
            createShoppingItem({ id: 1, title: longTitle }),
            createShoppingItem({ id: 2, title: "Milk" }),
          ],
        },
      }),
    );

    const tags = within(getGroup("shopping")).getAllByRole("listitem");
    expect(tags.map((tag) => tag.textContent)).toEqual([longTitle, "Milk"]);
    expect(tags[0]).toHaveAttribute("title", longTitle);
  });

  it("keeps the to-buy count with an empty state when no pending supplies are loaded", async () => {
    await renderPreviews(
      createData({
        shopping: { pendingCount: 3, purchasedCount: 0, pendingItems: [] },
      }),
    );

    const group = getGroup("shopping");
    expect(within(group).getByTestId("preview-count")).toHaveTextContent("3");
    expect(within(group).getByText(`${NS}.shopping.emptyTitle`)).toBeInTheDocument();
    expect(within(group).queryByRole("list")).not.toBeInTheDocument();
  });

  it("has no rest tag when every pending supply is shown", async () => {
    await renderPreviews(
      createData({
        shopping: {
          pendingCount: 1,
          purchasedCount: 0,
          pendingItems: [createShoppingItem({ title: "Milk" })],
        },
      }),
    );

    const tags = within(getGroup("shopping")).getAllByRole("listitem");
    expect(tags.map((tag) => tag.textContent)).toEqual(["Milk"]);
  });

  it("lists recent notes with the author's initial, author, relative time and content", async () => {
    await renderPreviews(
      createData({
        notes: {
          recentNotes: [
            createNote(),
            createNote({ id: 2, author: "Šárka", content: "a".repeat(150) }),
          ],
        },
      }),
    );

    const items = within(getGroup("notes")).getAllByRole("listitem");
    expect(items).toHaveLength(2);

    expect(within(items[0]).getByText("B")).toHaveAttribute("aria-hidden", "true");
    expect(within(items[0]).getByText("Bob")).toBeInTheDocument();
    expect(within(items[0]).getByText("Water heater fixed.")).toBeInTheDocument();
    const timestamp = within(items[0]).getByText("rel:en:2026-10-19T18:00:00Z");
    expect(timestamp.tagName).toBe("TIME");
    expect(timestamp).toHaveAttribute("dateTime", "2026-10-19T18:00:00Z");

    expect(within(items[1]).getByText("Š")).toHaveAttribute("aria-hidden", "true");
    expect(within(items[1]).getByText("a".repeat(150))).toBeInTheDocument();
  });

  it("shows a question mark initial when a note author is only whitespace", async () => {
    await renderPreviews(
      createData({ notes: { recentNotes: [createNote({ author: "   " })] } }),
    );

    const [item] = within(getGroup("notes")).getAllByRole("listitem");
    expect(within(item).getByText("?")).toHaveAttribute("aria-hidden", "true");
  });
});

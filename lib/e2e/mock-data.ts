import "server-only";

import type { DashboardOverviewData, DashboardWeather } from "@/features/dashboard/types/dashboard";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import type { Task } from "@/features/tasks/types/tasks";
import type { Note } from "@/features/notes/types/notes";
import type {
  CreateShoppingItemInput,
  ShoppingItem,
} from "@/features/shopping/types/shopping";
import type { Visit } from "@/features/visits/types/visits";
import { addDaysUtc, parseDateOnlyUtc, toDateOnlyString } from "@/lib/utils/date";

import {
  E2E_MOCK_PROFILE,
  E2E_MOCK_USER,
} from "./mock-auth";

const SHOPPING_ITEM_CREATED_AT = "2026-05-04T09:30:00.000Z";

function addDaysIso(anchorIso: string, amount: number) {
  return toDateOnlyString(addDaysUtc(parseDateOnlyUtc(anchorIso), amount));
}

function createShoppingSeed(): ShoppingItem[] {
  return [
    {
      id: 1,
      title: "Firewood",
      isChecked: false,
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      broughtBy: null,
      broughtById: null,
      createdAt: SHOPPING_ITEM_CREATED_AT,
    },
    {
      id: 2,
      title: "Coffee beans",
      isChecked: true,
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      broughtBy: E2E_MOCK_PROFILE.display_name,
      broughtById: E2E_MOCK_USER.id,
      createdAt: "2026-05-03T08:15:00.000Z",
    },
  ];
}

let shoppingItems = createShoppingSeed();
let nextShoppingItemId = 3;

function createMockTasks(todayIso: string): Task[] {
  return [
    {
      id: 1,
      title: "Check boiler pressure",
      description: "Quick safety pass before the next arrival.",
      status: "pending",
      priority: "high",
      dueDate: addDaysIso(todayIso, -1),
      dueKind: "overdue",
      createdAt: "2026-05-01T08:00:00.000Z",
      updatedAt: "2026-05-01T08:00:00.000Z",
      completedAt: null,
      author: { displayName: E2E_MOCK_PROFILE.display_name },
      assignee: { displayName: "Tom" },
      authorId: E2E_MOCK_USER.id,
    },
    {
      id: 2,
      title: "Air out guest room",
      description: null,
      status: "pending",
      priority: "medium",
      dueDate: todayIso,
      dueKind: "dueToday",
      createdAt: "2026-05-02T09:00:00.000Z",
      updatedAt: "2026-05-02T09:00:00.000Z",
      completedAt: null,
      author: { displayName: E2E_MOCK_PROFILE.display_name },
      assignee: null,
      authorId: E2E_MOCK_USER.id,
    },
    {
      id: 3,
      title: "Refill outdoor lantern fuel",
      description: null,
      status: "done",
      priority: "low",
      dueDate: addDaysIso(todayIso, -3),
      dueKind: "completed",
      createdAt: "2026-04-28T09:00:00.000Z",
      updatedAt: "2026-05-01T11:00:00.000Z",
      completedAt: "2026-05-01T11:00:00.000Z",
      author: { displayName: E2E_MOCK_PROFILE.display_name },
      assignee: { displayName: "Anna" },
      authorId: E2E_MOCK_USER.id,
    },
  ];
}

function createMockNotes(): Note[] {
  return [
    {
      id: 1,
      content: "Left the extra key in the top kitchen drawer.",
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      createdAt: "2026-05-04T18:20:00.000Z",
      photos: [],
    },
    {
      id: 2,
      content: "Rain barrel is finally full after the storm.",
      author: "Tom",
      authorId: "e2e-family-user",
      createdAt: "2026-05-03T16:00:00.000Z",
      photos: [],
    },
  ];
}

export function createE2EMockWeather(): DashboardWeather {
  return {
    status: "available",
    apparentTemperatureC: 15,
    observedAt: "2026-05-05T09:00",
    precipitationMm: 0,
    temperatureC: 16,
    weatherCode: 1,
    windSpeedKmh: 10,
  };
}

export function createE2EMockVisits(todayIso: string): Visit[] {
  return [
    {
      id: 1,
      visitorName: "Anna and Tom",
      dateFrom: addDaysIso(todayIso, -1),
      dateTo: addDaysIso(todayIso, 2),
      status: "current",
      note: "Using the upstairs room.",
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      createdAt: "2026-05-01T10:00:00.000Z",
    },
    {
      id: 2,
      visitorName: "Parents weekend",
      dateFrom: addDaysIso(todayIso, 6),
      dateTo: addDaysIso(todayIso, 8),
      status: "upcoming",
      note: null,
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      createdAt: "2026-05-02T12:00:00.000Z",
    },
    {
      id: 3,
      visitorName: "Spring cleanup crew",
      dateFrom: addDaysIso(todayIso, -14),
      dateTo: addDaysIso(todayIso, -12),
      status: "past",
      note: null,
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      createdAt: "2026-04-15T10:00:00.000Z",
    },
  ];
}

let mockVisits: Visit[] = createE2EMockVisits(toDateOnlyString(new Date()));
let nextVisitId = 4;

export function resetE2EMockState() {
  shoppingItems = createShoppingSeed();
  nextShoppingItemId = 3;
  mockVisits = createE2EMockVisits(toDateOnlyString(new Date()));
  nextVisitId = 4;
}

export function getE2EMockVisits(): Visit[] {
  return mockVisits.slice();
}

export function addE2EMockVisit(data: {
  visitorName: string;
  dateFrom: string;
  dateTo: string;
  note: string | null;
  author: string;
}): Visit {
  const today = toDateOnlyString(new Date());
  const status =
    data.dateTo < today ? "past" : data.dateFrom > today ? "upcoming" : "current";

  const newVisit: Visit = {
    id: nextVisitId,
    visitorName: data.visitorName,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    status,
    note: data.note,
    author: data.author,
    authorId: E2E_MOCK_USER.id,
    createdAt: new Date().toISOString(),
  };

  nextVisitId++;
  mockVisits = [newVisit, ...mockVisits];

  return newVisit;
}

export function deleteE2EMockVisit(visitId: number): Visit | null {
  const existing = mockVisits.find((v) => v.id === visitId);

  if (!existing) {
    return null;
  }

  mockVisits = mockVisits.filter((v) => v.id !== visitId);

  return existing;
}

export function getE2EMockShoppingItems() {
  return shoppingItems
    .slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function addE2EMockShoppingItem(input: CreateShoppingItemInput) {
  const nextItem: ShoppingItem = {
    id: nextShoppingItemId,
    title: input.title,
    isChecked: false,
    author: E2E_MOCK_PROFILE.display_name,
    authorId: E2E_MOCK_USER.id,
    broughtBy: null,
    broughtById: null,
    createdAt: new Date().toISOString(),
  };

  nextShoppingItemId += 1;
  shoppingItems = [nextItem, ...shoppingItems];

  return nextItem;
}

export function toggleE2EMockShoppingItem(itemId: number) {
  const existing = shoppingItems.find((item) => item.id === itemId);

  if (!existing) {
    return null;
  }

  shoppingItems = shoppingItems.map((item) =>
    item.id !== itemId
      ? item
      : {
          ...item,
          isChecked: !item.isChecked,
          broughtBy: item.isChecked ? null : E2E_MOCK_PROFILE.display_name,
          broughtById: item.isChecked ? null : E2E_MOCK_USER.id,
        },
  );

  return existing;
}

export function deleteE2EMockShoppingItem(itemId: number) {
  const existing = shoppingItems.find((item) => item.id === itemId);

  if (!existing) {
    return null;
  }

  shoppingItems = shoppingItems.filter((item) => item.id !== itemId);

  return existing;
}

export function getE2EMockDashboardOverviewData(): DashboardOverviewData {
  const todayIso = toDateOnlyString(new Date());
  const visits = createE2EMockVisits(todayIso);
  const tasks = categorizeTasksForPage(createMockTasks(todayIso), todayIso);
  const pendingItems = getE2EMockShoppingItems().filter((item) => !item.isChecked);
  const purchasedItems = getE2EMockShoppingItems().filter((item) => item.isChecked);
  const currentVisits = visits.filter((visit) => visit.status === "current");
  const upcomingVisits = visits.filter((visit) => visit.status === "upcoming");

  return {
    todayIso,
    visits: {
      currentVisits,
      nextVisit: upcomingVisits[0] ?? null,
      currentCount: currentVisits.length,
      upcomingCount: upcomingVisits.length,
    },
    tasks: {
      openCount: tasks.openCount,
      overdueCount: tasks.overdueCount,
      dueTodayCount: tasks.openTasks.filter((task) => task.dueKind === "dueToday")
        .length,
      priorityTasks: tasks.openTasks.slice(0, 3),
    },
    shopping: {
      pendingCount: pendingItems.length,
      purchasedCount: purchasedItems.length,
      pendingItems: pendingItems.slice(0, 3),
    },
    notes: {
      recentNotes: createMockNotes(),
    },
    weather: createE2EMockWeather(),
  };
}

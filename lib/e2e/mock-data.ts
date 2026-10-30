import "server-only";

import {
  DASHBOARD_SHOPPING_TAG_LIMIT,
  deriveDashboardNotesOverview,
} from "@/features/dashboard/domain/overview";
import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { categorizeTasksForPage } from "@/features/tasks/domain/task-categorization";
import type { Task } from "@/features/tasks/types/tasks";
import type { Note } from "@/features/notes/types/notes";
import type {
  CreateShoppingItemInput,
  ShoppingItem,
} from "@/features/shopping/types/shopping";
import type { Visit } from "@/features/visits/types/visits";
import type { Couple, CoupleId } from "@/features/visits/domain/couples";
import { visitOverlapsRange } from "@/features/visits/domain/visits-calendar";
import type { MutationResult } from "@/lib/types/mutations.types";
import { addDaysUtc, parseDateOnlyUtc, toDateOnlyString } from "@/lib/utils/date";

import {
  E2E_MOCK_PROFILE,
  E2E_MOCK_USER,
} from "./mock-auth";

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
      createdAt: new Date().toISOString(),
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

const MOCK_NOTE_PHOTO_SVGS = {
  landscape: `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#C9D6D9"/><path d="M0 620 L320 380 L560 560 L820 300 L1200 640 L1200 900 L0 900 Z" fill="#5A676D"/><rect y="700" width="1200" height="200" fill="#3D4A50"/><text x="600" y="200" font-family="sans-serif" font-size="140" font-weight="700" fill="#1B2428" text-anchor="middle">1</text></svg>`,
  portrait: `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><rect width="900" height="1200" fill="#E6DCCF"/><path d="M120 760 L450 420 L780 760 Z" fill="#6B3F24"/><rect x="200" y="760" width="500" height="320" fill="#8A6A52"/><rect x="400" y="880" width="100" height="200" fill="#1B2428"/><text x="450" y="260" font-family="sans-serif" font-size="140" font-weight="700" fill="#1B2428" text-anchor="middle">2</text></svg>`,
};

function toSvgDataUri(svg: string) {
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function createMockNotePhoto(
  id: number,
  url: string | null,
): Note["photos"][number] {
  return {
    id,
    fileName: `note-photo-${id}.svg`,
    fileSize: 1024,
    mimeType: "image/svg+xml",
    storagePath: `e2e/note-photo-${id}.svg`,
    url,
    thumbnailUrl: url,
  };
}

function createMockNotes(): Note[] {
  return [
    {
      id: 3,
      content: "Porch steps are fixed. Photos of the new boards and the shed roof.",
      author: E2E_MOCK_PROFILE.display_name,
      authorId: E2E_MOCK_USER.id,
      createdAt: new Date().toISOString(),
      photos: [
        createMockNotePhoto(1, toSvgDataUri(MOCK_NOTE_PHOTO_SVGS.landscape)),
        createMockNotePhoto(2, toSvgDataUri(MOCK_NOTE_PHOTO_SVGS.portrait)),
        createMockNotePhoto(3, null),
      ],
    },
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

export function getE2EMockNotes(): Note[] {
  return createMockNotes();
}

export function createE2EMockVisits(todayIso: string): Visit[] {
  return [
    {
      id: 1,
      visitorName: "Anna and Tom",
      couple: "couple-2",
      coupleLabel: "Eva a Karel",
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
      couple: "couple-4",
      coupleLabel: "Babička s dědou",
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
      couple: "couple-3",
      coupleLabel: "Lucie a Jakub",
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

interface E2EMockState {
  shoppingItems: ShoppingItem[];
  nextShoppingItemId: number;
  mockVisits: Visit[];
  nextVisitId: number;
}

declare global {
  var __e2eMockState: E2EMockState | undefined;
}

function createInitialE2EMockState(): E2EMockState {
  return {
    shoppingItems: createShoppingSeed(),
    nextShoppingItemId: 3,
    mockVisits: createE2EMockVisits(toDateOnlyString(new Date())),
    nextVisitId: 4,
  };
}

// Dev-mode bundlers (Turbopack/webpack) can load this module into separate
// instances per route — e.g. the /api/e2e/reset route handler vs. the Server
// Actions/pages that read and mutate mock data — so module-level `let` state
// isn't reliably shared between them. globalThis is process-wide and survives
// that split, which resetE2EMockState() depends on to actually take effect.
function getE2EMockState(): E2EMockState {
  globalThis.__e2eMockState ??= createInitialE2EMockState();
  return globalThis.__e2eMockState;
}

export function resetE2EMockState() {
  globalThis.__e2eMockState = createInitialE2EMockState();
}

export function getE2EMockVisits(): Visit[] {
  return getE2EMockState().mockVisits.slice();
}

export const E2E_MOCK_COUPLES: Couple[] = [
  { id: "couple-1", label: "Jana a Tomáš" },
  { id: "couple-2", label: "Eva a Karel" },
  { id: "couple-3", label: "Lucie a Jakub" },
  { id: "couple-4", label: "Babička s dědou" },
  { id: "admin", label: "Admin" },
];

export const E2E_MOCK_USER_COUPLE: CoupleId = "couple-1";

export function addE2EMockVisit(data: {
  visitorName: string;
  couple: CoupleId;
  dateFrom: string;
  dateTo: string;
  note: string | null;
  author: string;
}): MutationResult<Visit> {
  const state = getE2EMockState();
  const hasOverlap = state.mockVisits.some(
    (visit) =>
      data.couple !== "admin" &&
      visit.couple === data.couple &&
      visitOverlapsRange(visit, data.dateFrom, data.dateTo),
  );

  if (hasOverlap) {
    return { ok: false, error: "conflict" };
  }

  const today = toDateOnlyString(new Date());
  const status =
    data.dateTo < today ? "past" : data.dateFrom > today ? "upcoming" : "current";

  const newVisit: Visit = {
    id: state.nextVisitId,
    visitorName: data.visitorName,
    couple: data.couple,
    coupleLabel:
      E2E_MOCK_COUPLES.find((couple) => couple.id === data.couple)?.label ?? null,
    dateFrom: data.dateFrom,
    dateTo: data.dateTo,
    status,
    note: data.note,
    author: data.author,
    authorId: E2E_MOCK_USER.id,
    createdAt: new Date().toISOString(),
  };

  state.nextVisitId++;
  state.mockVisits = [newVisit, ...state.mockVisits];

  return { ok: true, data: newVisit };
}

export function deleteE2EMockVisit(visitId: number): Visit | null {
  const state = getE2EMockState();
  const existing = state.mockVisits.find((v) => v.id === visitId);

  if (!existing) {
    return null;
  }

  state.mockVisits = state.mockVisits.filter((v) => v.id !== visitId);

  return existing;
}

export function getE2EMockShoppingItems() {
  return getE2EMockState()
    .shoppingItems.slice()
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export function addE2EMockShoppingItem(input: CreateShoppingItemInput) {
  const state = getE2EMockState();
  const nextItem: ShoppingItem = {
    id: state.nextShoppingItemId,
    title: input.title,
    isChecked: false,
    author: E2E_MOCK_PROFILE.display_name,
    authorId: E2E_MOCK_USER.id,
    broughtBy: null,
    broughtById: null,
    createdAt: new Date().toISOString(),
  };

  state.nextShoppingItemId += 1;
  state.shoppingItems = [nextItem, ...state.shoppingItems];

  return nextItem;
}

export function toggleE2EMockShoppingItem(itemId: number) {
  const state = getE2EMockState();
  const existing = state.shoppingItems.find((item) => item.id === itemId);

  if (!existing) {
    return null;
  }

  state.shoppingItems = state.shoppingItems.map((item) =>
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
  const state = getE2EMockState();
  const existing = state.shoppingItems.find((item) => item.id === itemId);

  if (!existing) {
    return null;
  }

  state.shoppingItems = state.shoppingItems.filter((item) => item.id !== itemId);

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
      pendingItems: pendingItems.slice(0, DASHBOARD_SHOPPING_TAG_LIMIT),
    },
    notes: deriveDashboardNotesOverview(createMockNotes()),
  };
}

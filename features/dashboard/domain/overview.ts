import type { Note } from "@/features/notes/types/notes";
import type { ShoppingItem } from "@/features/shopping/types/shopping";
import type {
  CategorizedTasks,
  Task,
  TaskDueKind,
  TaskPriority,
} from "@/features/tasks/types/tasks";
import type { Visit } from "@/features/visits/types/visits";
import type {
  DashboardNotesOverview,
  DashboardShoppingOverview,
  DashboardTaskOverview,
  DashboardVisitOverview,
} from "@/features/dashboard/types/dashboard";
import { compareDateOnly } from "@/lib/utils/date";

export const DASHBOARD_PREVIEW_ITEM_LIMIT = 3;
export const DASHBOARD_RECENT_NOTES_LIMIT = 2;

const DUE_KIND_RANK: Record<TaskDueKind, number> = {
  overdue: 0,
  dueToday: 1,
  dueOn: 2,
  completed: 3,
};

const PRIORITY_RANK: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function sortVisitsByStartDate(left: Visit, right: Visit): number {
  return (
    compareDateOnly(left.dateFrom, right.dateFrom) ||
    compareDateOnly(left.dateTo, right.dateTo) ||
    left.visitorName.localeCompare(right.visitorName)
  );
}

function sortTasksForDashboard(left: Task, right: Task): number {
  const leftDueRank = left.dueKind ? DUE_KIND_RANK[left.dueKind] : 4;
  const rightDueRank = right.dueKind ? DUE_KIND_RANK[right.dueKind] : 4;

  if (leftDueRank !== rightDueRank) {
    return leftDueRank - rightDueRank;
  }

  if (left.dueDate && right.dueDate && left.dueDate !== right.dueDate) {
    return compareDateOnly(left.dueDate, right.dueDate);
  }

  if (left.dueDate && !right.dueDate) {
    return -1;
  }

  if (!left.dueDate && right.dueDate) {
    return 1;
  }

  const priorityDelta =
    PRIORITY_RANK[left.priority] - PRIORITY_RANK[right.priority];

  if (priorityDelta !== 0) {
    return priorityDelta;
  }

  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

function sortNotesByCreatedAt(left: Note, right: Note): number {
  return (
    new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
  );
}

export function deriveDashboardVisitOverview(
  visits: Visit[],
): DashboardVisitOverview {
  const currentVisits = visits
    .filter((visit) => visit.status === "current")
    .sort(sortVisitsByStartDate);
  const upcomingVisits = visits
    .filter((visit) => visit.status === "upcoming")
    .sort(sortVisitsByStartDate);

  return {
    currentVisits,
    nextVisit: upcomingVisits[0] ?? null,
    currentCount: currentVisits.length,
    upcomingCount: upcomingVisits.length,
  };
}

export function deriveDashboardTaskOverview(
  tasks: CategorizedTasks,
): DashboardTaskOverview {
  return {
    openCount: tasks.openCount,
    overdueCount: tasks.overdueCount,
    dueTodayCount: tasks.openTasks.filter(
      (task) => task.dueKind === "dueToday",
    ).length,
    priorityTasks: [...tasks.openTasks]
      .sort(sortTasksForDashboard)
      .slice(0, DASHBOARD_PREVIEW_ITEM_LIMIT),
  };
}

export function deriveDashboardShoppingOverview(
  pendingItems: ShoppingItem[],
  purchasedItems: ShoppingItem[],
): DashboardShoppingOverview {
  return {
    pendingCount: pendingItems.length,
    purchasedCount: purchasedItems.length,
    pendingItems: pendingItems.slice(0, DASHBOARD_PREVIEW_ITEM_LIMIT),
  };
}

export function deriveDashboardNotesOverview(
  notes: Note[],
): DashboardNotesOverview {
  return {
    recentNotes: [...notes]
      .sort(sortNotesByCreatedAt)
      .slice(0, DASHBOARD_RECENT_NOTES_LIMIT),
  };
}

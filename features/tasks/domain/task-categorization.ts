import type {
  CategorizedTasks,
  Task,
  TaskFilter,
} from "@/features/tasks/types/tasks";
import {
  countTasksByCategory,
  getOnTrackTasks,
  getOverdueTasks,
  getTasksByFilter,
} from "@/features/tasks/domain/category-filters";

export function categorizeTasksForPage(
  tasks: Task[],
  today: string
): CategorizedTasks {
  const todayDate = new Date(`${today}T00:00:00Z`);

  const openTasks = getTasksByFilter(tasks, "open", todayDate);
  const overdueTasks = getOverdueTasks(tasks, todayDate);
  const onTrackTasks = getOnTrackTasks(tasks, todayDate);
  const doneTasks = getTasksByFilter(tasks, "done", todayDate);

  const counts = countTasksByCategory(tasks, todayDate);

  return {
    openTasks,
    openCount: counts.openCount,
    overdueTasks,
    overdueCount: counts.overdueCount,
    onTrackTasks,
    onTrackCount: counts.onTrackCount,
    doneTasks,
    doneCount: counts.doneCount,
  };
}

export function getFilteredTaskList(
  tasks: Task[],
  filter: TaskFilter,
  today: string
) {
  const todayDate = new Date(`${today}T00:00:00Z`);
  const filtered = getTasksByFilter(tasks, filter, todayDate);
  return {
    count: filtered.length,
    tasks: filtered,
  };
}

export function getFilteredListFromCategorized(
  data: CategorizedTasks,
  filter: TaskFilter
): { count: number; tasks: Task[] } {
  switch (filter) {
    case "open":
      return { count: data.openCount, tasks: data.openTasks };
    case "done":
      return { count: data.doneCount, tasks: data.doneTasks };
    default:
      const _exhaustive: never = filter;
      return _exhaustive;
  }
}

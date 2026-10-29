import type { Task, TaskDueFilter } from "@/features/tasks/types/tasks";
import {
  addDaysUtc,
  formatDateOnlyUtc,
  parseDateOnlyUtc,
} from "@/lib/utils/date";

const DAYS_IN_WEEK = 7;

export function getEndOfWeekIso(todayIso: string): string {
  const today = parseDateOnlyUtc(todayIso);
  const daysUntilSunday = (DAYS_IN_WEEK - today.getUTCDay()) % DAYS_IN_WEEK;

  return formatDateOnlyUtc(addDaysUtc(today, daysUntilSunday));
}

export function filterOpenTasksByDue(
  tasks: Task[],
  due: TaskDueFilter,
  todayIso: string,
): Task[] {
  switch (due) {
    case "all":
      return [...tasks];
    case "week": {
      const endOfWeekIso = getEndOfWeekIso(todayIso);

      return tasks.filter(
        (task) =>
          task.status === "pending" &&
          task.dueDate !== null &&
          task.dueDate <= endOfWeekIso,
      );
    }
    case "none":
      return tasks.filter(
        (task) => task.status === "pending" && task.dueDate === null,
      );
    default: {
      const exhaustive: never = due;
      return exhaustive;
    }
  }
}

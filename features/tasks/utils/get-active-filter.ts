/**
 * Extracts active filter from query parameter.
 * Minimal utility - only handles conversion.
 */
import type { TaskFilter } from "@/features/tasks/types/task.types";

export function getActiveFilter(
  filterParam: string | string[] | undefined
): TaskFilter {
  const value = Array.isArray(filterParam) ? filterParam[0] : filterParam;

  switch (value) {
    case "pending":
      return "pending";
    case "overdue":
      return "overdue";
    case "done":
      return "done";
    default:
      return "pending";
  }
}

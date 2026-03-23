import type { TaskFilter } from "@/features/tasks/types/task.types";

export function getActiveFilter(
  filterParam: string | string[] | undefined
): TaskFilter {
  const value = Array.isArray(filterParam) ? filterParam[0] : filterParam;
  if (value === "overdue") return "overdue";
  if (value === "done") return "done";

  return "pending";
}

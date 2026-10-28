import type { TaskFilter } from "@/features/tasks/types/tasks";
import {
  CollectionToolbar,
  type CollectionToolbarSummaryItem as SharedTasksToolbarSummaryItem,
} from "@/shared/ui/CollectionToolbar";
import type { FilterNavItem } from "@/shared/ui/FilterNav";

interface TasksToolbarProps {
  activeFilter: TaskFilter;
  title: string;
  description: string;
  totalCount: number;
  summaryItems: TasksToolbarSummaryItem[];
  filterItems: FilterNavItem<TaskFilter>[];
  filterAriaLabel: string;
}

export interface TasksToolbarSummaryItem
  extends SharedTasksToolbarSummaryItem {
  id: "open" | "overdue" | "done";
  label: string;
  value: number;
  tone: "neutral" | "danger" | "success";
}

export function TasksToolbar({
  activeFilter,
  title,
  description,
  totalCount,
  summaryItems,
  filterItems,
  filterAriaLabel,
}: TasksToolbarProps) {
  return (
    <CollectionToolbar
      activeFilter={activeFilter}
      title={title}
      description={description}
      totalCount={totalCount}
      countTone={activeFilter === "done" ? "success" : "neutral"}
      summaryItems={summaryItems}
      filterItems={filterItems}
      filterAriaLabel={filterAriaLabel}
      filterPathname="/tasks"
    />
  );
}

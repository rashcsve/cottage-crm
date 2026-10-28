import type { TaskFilter } from "@/features/tasks/types/tasks";
import { CollectionToolbar } from "@/shared/ui/CollectionToolbar";
import type { FilterNavItem } from "@/shared/ui/FilterNav";

interface TasksToolbarProps {
  activeFilter: TaskFilter;
  title: string;
  titleId?: string;
  totalCount: number;
  filterItems: FilterNavItem<TaskFilter>[];
  filterAriaLabel: string;
}

export function TasksToolbar({
  activeFilter,
  title,
  titleId,
  totalCount,
  filterItems,
  filterAriaLabel,
}: TasksToolbarProps) {
  return (
    <CollectionToolbar
      activeFilter={activeFilter}
      title={title}
      titleId={titleId}
      totalCount={totalCount}
      countTone={activeFilter === "done" ? "success" : "neutral"}
      filterItems={filterItems}
      filterAriaLabel={filterAriaLabel}
      filterPathname="/tasks"
    />
  );
}

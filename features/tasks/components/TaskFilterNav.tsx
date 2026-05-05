import type { TaskFilter } from "@/features/tasks/types/tasks";
import { FilterNav, type FilterNavItem as SharedFilterNavItem } from "@/shared/ui/FilterNav";

export type TaskFilterNavItem = SharedFilterNavItem<TaskFilter>;

interface TaskFilterNavProps {
  activeFilter: TaskFilter;
  items: TaskFilterNavItem[];
  ariaLabel: string;
}

export function TaskFilterNav({
  activeFilter,
  items,
  ariaLabel,
}: TaskFilterNavProps) {
  return (
    <FilterNav
      activeFilter={activeFilter}
      items={items}
      ariaLabel={ariaLabel}
      pathname="/tasks"
    />
  );
}

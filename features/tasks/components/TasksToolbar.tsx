"use client";

import type { TaskFilter } from "@/features/tasks/types/tasks";
import {
  CollectionToolbar,
  type CollectionToolbarAction as SharedTasksToolbarAction,
  type CollectionToolbarSummaryItem as SharedTasksToolbarSummaryItem,
} from "@/shared/ui/CollectionToolbar";
import type { FilterNavItem } from "@/shared/ui/FilterNav";

interface TasksToolbarProps {
  activeFilter: TaskFilter;
  eyebrow: string;
  title: string;
  description: string;
  totalCount: number;
  summaryItems: TasksToolbarSummaryItem[];
  filterItems: FilterNavItem<TaskFilter>[];
  filterAriaLabel: string;
  primaryAction?: TasksToolbarAction;
}

export interface TasksToolbarSummaryItem
  extends SharedTasksToolbarSummaryItem {
  id: "open" | "overdue" | "done";
  label: string;
  value: number;
  tone: "neutral" | "warning" | "success";
}

export type TasksToolbarAction = SharedTasksToolbarAction;

export function TasksToolbar({
  activeFilter,
  eyebrow,
  title,
  description,
  totalCount,
  summaryItems,
  filterItems,
  filterAriaLabel,
  primaryAction,
}: TasksToolbarProps) {
  return (
    <CollectionToolbar
      activeFilter={activeFilter}
      eyebrow={eyebrow}
      title={title}
      description={description}
      totalCount={totalCount}
      countTone={activeFilter === "done" ? "success" : "neutral"}
      summaryItems={summaryItems}
      filterItems={filterItems}
      filterAriaLabel={filterAriaLabel}
      filterPathname="/tasks"
      primaryAction={primaryAction}
    />
  );
}

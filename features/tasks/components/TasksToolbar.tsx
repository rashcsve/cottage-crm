"use client";

import type { LucideIcon } from "lucide-react";
import {
  TaskFilterNav,
  type TaskFilterNavItem,
} from "@/features/tasks/components/TaskFilterNav";
import type { TaskFilter } from "@/features/tasks/types/tasks";

interface TasksToolbarProps {
  activeFilter: TaskFilter;
  filterItems: TaskFilterNavItem[];
  filterAriaLabel: string;
  primaryAction?: TasksToolbarAction;
}

export interface TasksToolbarSummaryItem {
  id: "open" | "overdue" | "done";
  label: string;
  value: number;
  tone: "neutral" | "warning" | "success";
}

export interface TasksToolbarAction {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
  ariaLabel?: string;
}
export function TasksToolbar({
  activeFilter,
  filterItems,
  filterAriaLabel,
  primaryAction,
}: TasksToolbarProps) {
  const PrimaryActionIcon = primaryAction?.icon;

  return (
    <header className="flex flex-col gap-4 p-4 sm:gap-5 sm:p-5">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center xl:justify-between">
        <div className="min-w-0 flex-1 sm:flex-none">
          <TaskFilterNav
            activeFilter={activeFilter}
            items={filterItems}
            ariaLabel={filterAriaLabel}
          />
        </div>

        {primaryAction && (
          <div className="sm:flex-none">
            <button
              type="button"
              onClick={primaryAction.onClick}
              aria-label={primaryAction.ariaLabel}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-stone-900 px-5 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 sm:w-auto"
            >
              {PrimaryActionIcon && (
                <PrimaryActionIcon className="h-4 w-4" aria-hidden="true" />
              )}
              {primaryAction.label}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

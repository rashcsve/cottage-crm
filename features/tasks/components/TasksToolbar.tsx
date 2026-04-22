"use client";

import type { LucideIcon } from "lucide-react";
import {
  TaskFilterNav,
  type TaskFilterNavItem,
} from "@/features/tasks/components/TaskFilterNav";
import type { TaskFilter } from "@/features/tasks/types/tasks";
import { StatusBadge } from "@/shared/ui/StatusBadge";

interface TasksToolbarProps {
  activeFilter: TaskFilter;
  eyebrow: string;
  title: string;
  description: string;
  totalCount: number;
  summaryItems: TasksToolbarSummaryItem[];
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

const SUMMARY_TONE_CLASS: Record<TasksToolbarSummaryItem["tone"], string> = {
  neutral: "border-stone-200 bg-stone-50 text-stone-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

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
  const PrimaryActionIcon = primaryAction?.icon;

  return (
    <header className="space-y-5 p-4 sm:p-5">
      <div className="space-y-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            {eyebrow}
          </p>

          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="text-lg font-semibold text-stone-900">{title}</h2>
            <StatusBadge
              tone={activeFilter === "done" ? "success" : "neutral"}
              className="tabular-nums"
            >
              {totalCount}
            </StatusBadge>
          </div>

          <p className="max-w-2xl text-sm text-stone-600">{description}</p>
        </div>

        <ul className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {summaryItems.map((item) => (
            <li
              key={item.id}
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm ${
                SUMMARY_TONE_CLASS[item.tone]
              }`}
            >
              <span className="font-medium">{item.label}</span>
              <span className="tabular-nums">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>

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

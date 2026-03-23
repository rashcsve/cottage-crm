import Link from "next/link";

import { PageHeader } from "@/shared/ui/PageHeader";
import {
  StatusBadge,
  statusBadgeTone,
  StatusBadgeTone,
} from "@/shared/ui/StatusBadge";
import { TaskFilter } from "@/features/tasks/types/task.types";

interface TaskPageHeaderProps {
  pendingCount: number;
  overdueCount: number;
  doneCount: number;
  canManage: boolean;
  activeFilter: TaskFilter;
}

interface SummaryItem {
  label: string;
  value: string | number;
  tone: StatusBadgeTone;
  href: string;
  filter: TaskFilter;
}

function TaskSummaryBadge({
  label,
  value,
  tone,
  className = "",
}: {
  label: string;
  value: string | number;
  tone: StatusBadgeTone;
  className?: string;
}) {
  return (
    <StatusBadge
      tone={tone}
      className={`gap-2 px-3 py-1.5 text-sm ${className}`}
    >
      <span>{label}</span>
      <span className="font-semibold">{value}</span>
    </StatusBadge>
  );
}

export function TaskPageHeader({
  pendingCount,
  overdueCount,
  doneCount,
  canManage,
  activeFilter,
}: TaskPageHeaderProps) {
  const filterItems: SummaryItem[] = [
    {
      label: "Otevřené",
      value: pendingCount,
      tone: statusBadgeTone.neutral,
      href: "/tasks?filter=pending",
      filter: "pending",
    },
    {
      label: "Po termínu",
      value: overdueCount,
      tone: statusBadgeTone.warning,
      href: "/tasks?filter=overdue",
      filter: "overdue",
    },
    {
      label: "Dokončeno",
      value: doneCount,
      tone: statusBadgeTone.success,
      href: "/tasks?filter=done",
      filter: "done",
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <PageHeader title="Úkoly" />

        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          Přehled práce kolem chaty.
        </p>

        <nav aria-label="Filtry úkolů" className="pt-1">
          <ul className="flex flex-wrap gap-2">
            {filterItems.map((item) => {
              const isActive = item.filter === activeFilter;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <TaskSummaryBadge
                      label={item.label}
                      value={item.value}
                      tone={item.tone}
                      className={
                        isActive ? "ring-2 ring-stone-900 ring-offset-2" : ""
                      }
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {canManage && (
        <a
          href="#new-task-form"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800 xl:hidden"
        >
          Přidat úkol
        </a>
      )}
    </div>
  );
}

import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import { TaskFilter } from "@/features/tasks/types/task.types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import { PageHeader } from "@/shared/ui/PageHeader";

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

function getTasksHref(locale: string, filter: TaskFilter) {
  const basePath = locale === "cs" ? "/tasks" : `/${locale}/tasks`;
  return `${basePath}?filter=${filter}`;
}

export async function TaskPageHeader({
  pendingCount,
  overdueCount,
  doneCount,
  canManage,
  activeFilter,
}: TaskPageHeaderProps) {
  const t = await getTranslations("tasks");
  const locale = await getLocale();

  const filterItems: SummaryItem[] = [
    {
      label: t("header.filters.open"),
      value: pendingCount,
      tone: "neutral",
      href: getTasksHref(locale, "pending"),
      filter: "pending",
    },
    {
      label: t("header.filters.overdue"),
      value: overdueCount,
      tone: "warning",
      href: getTasksHref(locale, "overdue"),
      filter: "overdue",
    },
    {
      label: t("header.filters.done"),
      value: doneCount,
      tone: "success",
      href: getTasksHref(locale, "done"),
      filter: "done",
    },
  ];

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="space-y-2">
        <PageHeader title={t("header.title")} />

        <p className="max-w-2xl text-sm leading-6 text-stone-600">
          {t("header.description")}
        </p>

        <nav aria-label={t("aria.filterNavigation")} className="pt-1">
          <ul className="flex flex-wrap gap-2">
            {filterItems.map((item) => (
              <li key={item.filter}>
                <Link
                  href={item.href}
                  aria-current={
                    activeFilter === item.filter ? "page" : undefined
                  }
                >
                  <TaskSummaryBadge
                    label={item.label}
                    value={item.value}
                    tone={item.tone}
                    className={
                      activeFilter === item.filter
                        ? "ring-2 ring-stone-900 ring-offset-2"
                        : ""
                    }
                  />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {canManage && (
        <a
          href="#new-task-form"
          className="inline-flex h-11 items-center justify-center rounded-2xl bg-stone-900 px-5 text-sm font-medium text-white transition hover:bg-stone-800 xl:hidden"
        >
          {t("addTask")}
        </a>
      )}
    </div>
  );
}

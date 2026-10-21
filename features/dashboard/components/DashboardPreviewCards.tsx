import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { formatNoteTimestamp } from "@/features/notes/shared/formatNoteDate";
import { formatShoppingTimestamp } from "@/features/shopping/shared/formatShoppingDate";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import type { Task, TaskDueKind } from "@/features/tasks/types/tasks";
import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList, RowListItem } from "@/shared/ui/RowList";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Surface } from "@/shared/ui/Surface";
import { TextLink } from "@/shared/ui/TextLink";

const DESKTOP_ROW_LIMIT = 2;
const DESKTOP_NOTE_LIMIT = 1;

const PREVIEW_AREAS = ["notes", "tasks", "shopping"] as const;

type PreviewArea = (typeof PREVIEW_AREAS)[number];

interface DashboardPreviewCardsProps {
  data: Pick<DashboardOverviewData, "tasks" | "shopping" | "notes">;
  locale: string;
}

interface PreviewLabels {
  cta: string;
  emptyDescription: string;
  emptyTitle: string;
  title: string;
}

interface PreviewCardProps<Item> {
  id: string;
  className?: string;
  desktopLimit: number;
  href: string;
  items: Item[];
  labels: PreviewLabels;
  renderItem: (item: Item, rowClassName: string) => ReactNode;
}

function getDesktopRowClass(index: number, count: number, limit: number) {
  if (index >= limit) {
    return "lg:hidden";
  }

  return index === limit - 1 && count > limit ? "lg:border-b-0" : "";
}

function PreviewCard<Item>({
  id,
  className = "",
  desktopLimit,
  href,
  items,
  labels,
  renderItem,
}: PreviewCardProps<Item>) {
  const titleId = `dashboard-preview-${id}`;

  return (
    <section
      aria-labelledby={titleId}
      className={`min-w-0 space-y-3 ${className}`.trim()}
    >
      <SectionHeader
        title={labels.title}
        titleId={titleId}
        className="xl:flex-col xl:items-start"
        actions={<TextLink href={href}>{labels.cta}</TextLink>}
      />
      <Surface className="px-4 lg:px-6">
        {items.length === 0 ? (
          <EmptyState
            title={labels.emptyTitle}
            description={labels.emptyDescription}
          />
        ) : (
          <RowList>
            {items.map((item, index) =>
              renderItem(
                item,
                getDesktopRowClass(index, items.length, desktopLimit),
              ),
            )}
          </RowList>
        )}
      </Surface>
    </section>
  );
}

export async function DashboardPreviewCards({
  data,
  locale,
}: DashboardPreviewCardsProps) {
  const [t, tTasks] = await Promise.all([
    getTranslations("dashboard.overview"),
    getTranslations("tasks"),
  ]);

  const dueDateLabels: Record<TaskDueKind, string> = {
    completed: tTasks("dueDate.completed"),
    overdue: tTasks("dueDate.overdue"),
    dueToday: tTasks("dueDate.dueToday"),
    dueOn: tTasks("dueDate.dueOn"),
  };
  const previewLabels = Object.fromEntries(
    PREVIEW_AREAS.map((area) => [
      area,
      {
        title: t(`${area}.title`),
        emptyTitle: t(`${area}.emptyTitle`),
        emptyDescription: t(`${area}.emptyDescription`),
        cta: t(`${area}.cta`),
      },
    ]),
  ) as Record<PreviewArea, PreviewLabels>;
  const priorityLabels: Record<Task["priority"], string> = {
    high: tTasks("priorityLabel.high"),
    medium: tTasks("priorityLabel.medium"),
    low: tTasks("priorityLabel.low"),
  };

  return (
    <section
      aria-label={t("preview.ariaLabel")}
      className="grid gap-7 md:grid-cols-2 lg:gap-6 xl:grid-cols-3"
    >
      <PreviewCard
        id="notes"
        className="md:col-span-2 xl:col-span-1"
        desktopLimit={DESKTOP_NOTE_LIMIT}
        href={dashboardRoutes.notes}
        items={data.notes.recentNotes}
        labels={previewLabels.notes}
        renderItem={(note, rowClassName) => (
          <RowListItem
            key={note.id}
            className={`flex-col items-stretch gap-1 ${rowClassName}`.trim()}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="font-bold text-ink-primary">{note.author}</span>
              <time
                dateTime={note.createdAt}
                className="whitespace-nowrap font-mono text-xs text-ink-muted"
              >
                {formatNoteTimestamp(note.createdAt, locale)}
              </time>
            </div>
            <p className="line-clamp-3 min-w-0 text-sm text-ink-secondary">
              {note.content}
            </p>
          </RowListItem>
        )}
      />

      <PreviewCard
        id="tasks"
        desktopLimit={DESKTOP_ROW_LIMIT}
        href={dashboardRoutes.tasks}
        items={data.tasks.priorityTasks}
        labels={previewLabels.tasks}
        renderItem={(task, rowClassName) => (
          <li key={task.id} className={rowClassName || undefined}>
            <Link
              href={dashboardRoutes.tasks}
              className="group flex min-h-12 flex-col gap-1 py-3"
            >
              <span className="font-semibold text-ink-primary wrap-break-word transition-colors group-hover:text-accent">
                {task.title}
              </span>
              <span className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs">
                <TaskDueDate
                  task={task}
                  locale={locale}
                  labels={dueDateLabels}
                />
                <span className="text-ink-secondary">
                  {priorityLabels[task.priority]}
                </span>
              </span>
            </Link>
          </li>
        )}
      />

      <PreviewCard
        id="shopping"
        desktopLimit={DESKTOP_ROW_LIMIT}
        href={dashboardRoutes.shopping}
        items={data.shopping.pendingItems}
        labels={previewLabels.shopping}
        renderItem={(item, rowClassName) => (
          <RowListItem
            key={item.id}
            className={`flex-wrap justify-between gap-y-0.5 ${rowClassName}`.trim()}
          >
            <span className="flex-1 font-semibold text-ink-primary">
              {item.title}
            </span>
            <time
              dateTime={item.createdAt}
              className="shrink-0 whitespace-nowrap font-mono text-xs text-ink-secondary"
            >
              {formatShoppingTimestamp(item.createdAt, locale)}
            </time>
          </RowListItem>
        )}
      />
    </section>
  );
}

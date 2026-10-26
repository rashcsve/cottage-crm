import { TriangleAlert } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { formatRelativeTimestamp } from "@/features/dashboard/domain/relative-time";
import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { TaskDueDate } from "@/features/tasks/components/TaskDueDate";
import type { TaskDueKind } from "@/features/tasks/types/tasks";
import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RowList, RowListItem } from "@/shared/ui/RowList";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusLabel } from "@/shared/ui/StatusLabel";
import { Surface } from "@/shared/ui/Surface";
import { TextLink } from "@/shared/ui/TextLink";

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
  count?: ReactNode;
  href: string;
  items: Item[];
  labels: PreviewLabels;
  renderItem: (item: Item) => ReactNode;
}

function PreviewCard<Item>({
  id,
  count,
  href,
  items,
  labels,
  renderItem,
}: PreviewCardProps<Item>) {
  const titleId = `dashboard-preview-${id}`;

  return (
    <section
      aria-labelledby={titleId}
      className="row-span-2 grid min-w-0 grid-rows-subgrid gap-3"
    >
      <div>
        <SectionHeader
          title={labels.title}
          titleId={titleId}
          className="flex-nowrap! items-center!"
          contentClassName="flex-1"
          actions={<TextLink href={href}>{labels.cta}</TextLink>}
        />
        {count ? <p className="-mt-1 text-sm text-ink-secondary">{count}</p> : null}
      </div>
      <Surface className="self-start px-4 lg:px-6">
        {items.length === 0 ? (
          <EmptyState
            title={labels.emptyTitle}
            description={labels.emptyDescription}
          />
        ) : (
          <RowList>{items.map(renderItem)}</RowList>
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
  const now = new Date();

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

  const { openCount, overdueCount } = data.tasks;
  const { pendingCount } = data.shopping;

  const tasksCount =
    openCount > 0 ? (
      <span
        data-testid="preview-tasks-count"
        className="flex flex-wrap items-center gap-x-3 gap-y-0.5"
      >
        <span className="font-mono text-ink-secondary">
          {t("tasks.openCount", { count: openCount })}
        </span>
        {overdueCount > 0 ? (
          <StatusLabel
            tone="danger"
            icon={TriangleAlert}
            className="whitespace-nowrap"
          >
            {t("tasks.overdueCount", { count: overdueCount })}
          </StatusLabel>
        ) : null}
      </span>
    ) : undefined;

  const shoppingCount =
    pendingCount > 0 ? (
      <span className="font-mono">
        {t("shopping.toBuyCount", { count: pendingCount })}
      </span>
    ) : undefined;

  return (
    <section aria-label={t("preview.ariaLabel")} className="space-y-7 lg:space-y-9">
      <div className="grid gap-7 md:grid-cols-[repeat(auto-fit,minmax(17.5rem,1fr))] lg:gap-6">
        <PreviewCard
          id="tasks"
          count={tasksCount}
          href={dashboardRoutes.tasks}
          items={data.tasks.priorityTasks}
          labels={previewLabels.tasks}
          renderItem={(task) => (
            <li key={task.id}>
              <Link
                href={dashboardRoutes.tasks}
                className="group flex min-h-12 flex-col gap-1 py-3"
              >
                <span className="font-semibold text-ink-primary wrap-break-word transition-colors group-hover:text-accent">
                  {task.title}
                </span>
                {task.dueDate && task.dueKind ? (
                  <span className="text-xs">
                    <TaskDueDate
                      task={task}
                      locale={locale}
                      labels={dueDateLabels}
                    />
                  </span>
                ) : null}
              </Link>
            </li>
          )}
        />

        <PreviewCard
          id="shopping"
          count={shoppingCount}
          href={dashboardRoutes.shopping}
          items={data.shopping.pendingItems}
          labels={previewLabels.shopping}
          renderItem={(item) => (
            <RowListItem
              key={item.id}
              className="flex-wrap justify-between gap-y-0.5"
            >
              <span className="flex-1 font-semibold text-ink-primary">
                {item.title}
              </span>
              <span className="shrink-0 whitespace-nowrap text-xs text-ink-secondary">
                <span>{item.author}</span>
                <span aria-hidden="true"> · </span>
                <span className="sr-only">, </span>
                <time dateTime={item.createdAt} className="font-mono">
                  {formatRelativeTimestamp(item.createdAt, now, locale)}
                </time>
              </span>
            </RowListItem>
          )}
        />
      </div>

      <PreviewCard
        id="notes"
        href={dashboardRoutes.notes}
        items={data.notes.recentNotes}
        labels={previewLabels.notes}
        renderItem={(note) => (
          <RowListItem
            key={note.id}
            className="flex-col items-stretch gap-1 lg:grid lg:grid-cols-[9.375rem_1fr] lg:items-start lg:gap-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 lg:flex-col lg:justify-start">
              <span className="font-bold text-ink-primary">{note.author}</span>
              <time
                dateTime={note.createdAt}
                className="whitespace-nowrap font-mono text-xs text-ink-muted"
              >
                {formatRelativeTimestamp(note.createdAt, now, locale)}
              </time>
            </div>
            <p className="line-clamp-3 min-w-0 text-sm text-ink-secondary">
              {note.content}
            </p>
          </RowListItem>
        )}
      />
    </section>
  );
}

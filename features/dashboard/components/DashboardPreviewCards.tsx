import { LayoutList, NotebookPen, ShoppingCart } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import {
  DASHBOARD_ACCENT_STYLES,
  type DashboardAccent,
} from "@/features/dashboard/components/dashboardAccentStyles";
import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { formatNoteTimestamp } from "@/features/notes/shared/formatNoteDate";
import { formatShoppingTimestamp } from "@/features/shopping/shared/formatShoppingDate";
import { formatTaskDueDate } from "@/features/tasks/shared/formatTaskDate";
import type { Task } from "@/features/tasks/types/tasks";
import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { Surface } from "@/shared/ui/Surface";

import { DashboardEmptyState } from "./DashboardEmptyState";

const PREVIEW_META_SEPARATOR = " · ";

type PreviewAccent = Exclude<DashboardAccent, "visits">;

interface DashboardPreviewCardsProps {
  data: Pick<DashboardOverviewData, "tasks" | "shopping" | "notes">;
  locale: string;
}

interface PreviewLabels {
  cta: string;
  emptyDescription: string;
  emptyTitle: string;
  eyebrow: string;
  title: string;
}

interface TaskLabels extends PreviewLabels {
  dueDate: Record<NonNullable<Task["dueKind"]>, string>;
  fallbackMeta: string;
  priority: Record<Task["priority"], string>;
}

interface PreviewCardProps {
  accent: PreviewAccent;
  children: ReactNode;
  count: number;
  cta: string;
  eyebrow: string;
  href: string;
  icon: LucideIcon;
  title: string;
}

interface PreviewListProps<Item> {
  emptyDescription: string;
  emptyTitle: string;
  items: Item[];
  renderItem: (item: Item) => ReactNode;
}

function truncateText(value: string, maxLength = 110) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1).trim()}...`;
}

function formatPreviewMeta(parts: string[]) {
  return parts.filter(Boolean).join(PREVIEW_META_SEPARATOR);
}

function PreviewItem({
  meta,
  primary,
}: {
  meta: string;
  primary: string;
}) {
  return (
    <li className="py-1 first:pt-0 last:pb-0">
      <p className="wrap-break-word text-[13px] font-medium leading-5 text-stone-900">
        {primary}
      </p>
      <p className="mt-0.5 truncate text-[11px] font-medium text-stone-500">
        {meta}
      </p>
    </li>
  );
}

function getTaskMeta(task: Task, labels: TaskLabels, locale: string) {
  const owner =
    task.assignee?.displayName ??
    task.author?.displayName ??
    labels.fallbackMeta;
  const meta = [labels.priority[task.priority], owner];

  if (task.dueDate && task.dueKind) {
    meta.push(
      `${labels.dueDate[task.dueKind]} ${formatTaskDueDate(
        task.dueDate,
        locale,
      )}`,
    );
  }

  return formatPreviewMeta(meta);
}

function PreviewCard({
  accent,
  children,
  count,
  cta,
  eyebrow,
  href,
  icon: Icon,
  title,
}: PreviewCardProps) {
  return (
    <Surface className="p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
            {eyebrow}
          </p>
          <h2 className="truncate text-sm font-semibold text-stone-900">
            {title}
          </h2>
        </div>
        <span
          className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums ${DASHBOARD_ACCENT_STYLES[accent].countBadge}`}
        >
          {count}
        </span>
      </div>

      <div className="mt-2">{children}</div>

      <Link
        href={href}
        className="mt-1.5 inline-flex min-h-8 items-center gap-1.5 rounded-lg text-[11px] font-semibold text-stone-700 transition hover:text-stone-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {cta}
      </Link>
    </Surface>
  );
}

function PreviewList<Item>({
  emptyDescription,
  emptyTitle,
  items,
  renderItem,
}: PreviewListProps<Item>) {
  if (items.length === 0) {
    return (
      <DashboardEmptyState
        compact
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return <ul className="divide-y divide-stone-200">{items.map(renderItem)}</ul>;
}

export async function DashboardPreviewCards({
  data,
  locale,
}: DashboardPreviewCardsProps) {
  const [t, tTasks] = await Promise.all([
    getTranslations("dashboard.overview"),
    getTranslations("tasks"),
  ]);

  const taskLabels: TaskLabels = {
    eyebrow: t("tasks.eyebrow"),
    title: t("tasks.title"),
    emptyTitle: t("tasks.emptyTitle"),
    emptyDescription: t("tasks.emptyDescription"),
    cta: t("tasks.cta"),
    fallbackMeta: t("tasks.fallbackMeta"),
    dueDate: {
      completed: tTasks("dueDate.completed"),
      overdue: tTasks("dueDate.overdue"),
      dueToday: tTasks("dueDate.dueToday"),
      dueOn: tTasks("dueDate.dueOn"),
    },
    priority: {
      high: tTasks("priority.high"),
      medium: tTasks("priority.medium"),
      low: tTasks("priority.low"),
    },
  };
  const shoppingLabels: PreviewLabels = {
    eyebrow: t("shopping.eyebrow"),
    title: t("shopping.title"),
    emptyTitle: t("shopping.emptyTitle"),
    emptyDescription: t("shopping.emptyDescription"),
    cta: t("shopping.cta"),
  };
  const noteLabels: PreviewLabels = {
    eyebrow: t("notes.eyebrow"),
    title: t("notes.title"),
    emptyTitle: t("notes.emptyTitle"),
    emptyDescription: t("notes.emptyDescription"),
    cta: t("notes.cta"),
  };

  return (
    <section
      aria-label={t("preview.ariaLabel")}
      className="grid items-start gap-2.5 lg:grid-cols-3"
    >
      <PreviewCard
        accent="tasks"
        count={data.tasks.openCount}
        cta={taskLabels.cta}
        eyebrow={taskLabels.eyebrow}
        href={dashboardRoutes.tasks}
        icon={LayoutList}
        title={taskLabels.title}
      >
        <PreviewList
          items={data.tasks.priorityTasks}
          emptyTitle={taskLabels.emptyTitle}
          emptyDescription={taskLabels.emptyDescription}
          renderItem={(task) => (
            <PreviewItem
              key={task.id}
              primary={task.title}
              meta={getTaskMeta(task, taskLabels, locale)}
            />
          )}
        />
      </PreviewCard>

      <PreviewCard
        accent="shopping"
        count={data.shopping.pendingCount}
        cta={shoppingLabels.cta}
        eyebrow={shoppingLabels.eyebrow}
        href={dashboardRoutes.shopping}
        icon={ShoppingCart}
        title={shoppingLabels.title}
      >
        <PreviewList
          items={data.shopping.pendingItems}
          emptyTitle={shoppingLabels.emptyTitle}
          emptyDescription={shoppingLabels.emptyDescription}
          renderItem={(item) => (
            <PreviewItem
              key={item.id}
              primary={item.title}
              meta={t("shopping.byline", {
                author: item.author,
                date: formatShoppingTimestamp(item.createdAt, locale),
              })}
            />
          )}
        />
      </PreviewCard>

      <PreviewCard
        accent="notes"
        count={data.notes.recentNotes.length}
        cta={noteLabels.cta}
        eyebrow={noteLabels.eyebrow}
        href={dashboardRoutes.notes}
        icon={NotebookPen}
        title={noteLabels.title}
      >
        <PreviewList
          items={data.notes.recentNotes}
          emptyTitle={noteLabels.emptyTitle}
          emptyDescription={noteLabels.emptyDescription}
          renderItem={(note) => (
            <PreviewItem
              key={note.id}
              primary={truncateText(note.content)}
              meta={t("notes.byline", {
                author: note.author,
                date: formatNoteTimestamp(note.createdAt, locale),
              })}
            />
          )}
        />
      </PreviewCard>
    </section>
  );
}

import {
  ListChecks,
  NotebookText,
  Package,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import {
  DASHBOARD_SHOPPING_TAG_LIMIT,
  DASHBOARD_SHOPPING_TAG_MOBILE_LIMIT,
  selectShoppingPreviewTags,
} from "@/features/dashboard/domain/overview";
import type { DashboardOverviewData } from "@/features/dashboard/types/dashboard";
import { Link } from "@/i18n/navigation";
import { dashboardRoutes } from "@/lib/routes";
import { AuthorInitial } from "@/shared/ui/AuthorInitial";
import { EmptyState } from "@/shared/ui/EmptyState";
import { RelativeTime } from "@/shared/ui/ItemByline";
import { RowList } from "@/shared/ui/RowList";
import { StatusLabel } from "@/shared/ui/StatusLabel";
import { Surface } from "@/shared/ui/Surface";
import { TextLink } from "@/shared/ui/TextLink";

const PREVIEW_AREAS = ["tasks", "shopping", "notes"] as const;

type PreviewArea = (typeof PREVIEW_AREAS)[number];

const PREVIEW_HREFS: Record<PreviewArea, string> = {
  tasks: dashboardRoutes.tasks,
  shopping: dashboardRoutes.shopping,
  notes: dashboardRoutes.notes,
};

const PREVIEW_ICONS: Record<PreviewArea, LucideIcon> = {
  tasks: ListChecks,
  shopping: Package,
  notes: NotebookText,
};

const TITLE_CLASS = "text-base font-bold tracking-heading";
const COUNT_CLASS = "font-mono text-sm tabular-nums text-ink-secondary";
const COUNT_SEPARATOR_CLASS = "mr-2 text-ink-muted";
const TAG_CLASS = "rounded-full bg-muted px-2.5 py-1 text-sm text-ink-primary";
const DESKTOP_ONLY_CLASS = "hidden lg:block";
const HOVER_ACCENT_CLASS = "transition-colors hover:text-accent";
const GROUP_HOVER_ACCENT_CLASS = "transition-colors group-hover:text-accent";

interface DashboardPreviewCardsProps {
  data: Pick<DashboardOverviewData, "tasks" | "shopping" | "notes">;
  locale: string;
}

interface PreviewLabels {
  all: string;
  allLabel: string;
  emptyDescription: string;
  emptyTitle: string;
  title: string;
}

interface PreviewGroupProps {
  area: PreviewArea;
  count?: number;
  isEmpty: boolean;
  labels: PreviewLabels;
  children: ReactNode;
}

function PreviewGroup({ area, count = 0, isEmpty, labels, children }: PreviewGroupProps) {
  const titleId = `dashboard-preview-${area}`;

  return (
    <section
      aria-labelledby={titleId}
      className="border-t border-border pt-3 pb-1 first:border-t-0"
    >
      <div className="flex items-center gap-2">
        <h2 id={titleId}>
          <StatusLabel tone="neutral" icon={PREVIEW_ICONS[area]} className={TITLE_CLASS}>
            {labels.title}
          </StatusLabel>
        </h2>
        {count > 0 ? (
          <span data-testid="preview-count" className={COUNT_CLASS}>
            <span aria-hidden="true" className={COUNT_SEPARATOR_CLASS}>
              ·
            </span>
            {count}
          </span>
        ) : null}
        <TextLink
          href={PREVIEW_HREFS[area]}
          aria-label={labels.allLabel}
          className="ml-auto text-sm"
        >
          {labels.all}
        </TextLink>
      </div>

      {isEmpty ? (
        <EmptyState
          title={labels.emptyTitle}
          description={labels.emptyDescription}
          density="compact"
        />
      ) : (
        children
      )}
    </section>
  );
}

interface MoreTagProps {
  count: number;
  label: string;
  className: string;
}

function MoreTag({ count, label, className }: MoreTagProps) {
  return (
    <li className={`${TAG_CLASS} shrink-0 font-mono ${className}`}>
      <span aria-hidden="true">+{count}</span>
      <span className="sr-only">{label}</span>
    </li>
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

  const overdueLabel = tTasks("dueDate.overdue");
  const previewLabels = Object.fromEntries(
    PREVIEW_AREAS.map((area) => [
      area,
      {
        all: t("preview.all"),
        allLabel: t(`${area}.allLabel`),
        title: t(`${area}.title`),
        emptyTitle: t(`${area}.emptyTitle`),
        emptyDescription: t(`${area}.emptyDescription`),
      },
    ]),
  ) as Record<PreviewArea, PreviewLabels>;

  const { pendingItems, pendingCount } = data.shopping;
  const shoppingTags = selectShoppingPreviewTags(
    pendingItems,
    pendingCount,
    DASHBOARD_SHOPPING_TAG_LIMIT,
  );
  const mobileMoreCount = selectShoppingPreviewTags(
    pendingItems,
    pendingCount,
    DASHBOARD_SHOPPING_TAG_MOBILE_LIMIT,
  ).moreCount;

  return (
    <section aria-label={t("preview.ariaLabel")}>
      <Surface className="px-4 lg:px-6">
        <PreviewGroup
          area="tasks"
          count={data.tasks.openCount}
          isEmpty={data.tasks.priorityTasks.length === 0}
          labels={previewLabels.tasks}
        >
          <RowList divider="light">
            {data.tasks.priorityTasks.map((task) => {
              const isOverdue = task.dueKind === "overdue";

              return (
                <li key={task.id}>
                  <Link
                    href={dashboardRoutes.tasks}
                    aria-label={isOverdue ? `${overdueLabel} ${task.title}` : undefined}
                    className="group flex min-h-12 items-center gap-2 py-2"
                  >
                    {isOverdue ? (
                      <TriangleAlert
                        aria-hidden="true"
                        className="size-4 shrink-0 text-danger"
                      />
                    ) : null}
                    <span
                      className={`font-semibold text-ink-primary wrap-break-word ${GROUP_HOVER_ACCENT_CLASS}`}
                    >
                      {task.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </RowList>
        </PreviewGroup>

        <PreviewGroup
          area="shopping"
          count={data.shopping.pendingCount}
          isEmpty={shoppingTags.items.length === 0}
          labels={previewLabels.shopping}
        >
          <ul className="flex min-w-0 gap-1.5 overflow-hidden whitespace-nowrap pt-1 pb-3">
            {shoppingTags.items.map((item, index) => (
              <li
                key={item.id}
                title={item.title}
                className={[
                  "min-w-0",
                  index >= DASHBOARD_SHOPPING_TAG_MOBILE_LIMIT ? DESKTOP_ONLY_CLASS : "",
                ].join(" ")}
              >
                <Link
                  href={dashboardRoutes.shopping}
                  className={`${TAG_CLASS} ${HOVER_ACCENT_CLASS} block truncate`}
                >
                  {item.title}
                </Link>
              </li>
            ))}
            {mobileMoreCount > 0 ? (
              <MoreTag
                count={mobileMoreCount}
                label={t("shopping.moreItems", { count: mobileMoreCount })}
                className="lg:hidden"
              />
            ) : null}
            {shoppingTags.moreCount > 0 ? (
              <MoreTag
                count={shoppingTags.moreCount}
                label={t("shopping.moreItems", { count: shoppingTags.moreCount })}
                className={DESKTOP_ONLY_CLASS}
              />
            ) : null}
          </ul>
        </PreviewGroup>

        <PreviewGroup
          area="notes"
          isEmpty={data.notes.recentNotes.length === 0}
          labels={previewLabels.notes}
        >
          <RowList divider="light">
            {data.notes.recentNotes.map((note) => (
              <li key={note.id}>
                <Link
                  href={dashboardRoutes.notes}
                  className="group flex min-h-12 min-w-0 items-start gap-3 py-3 wrap-break-word"
                >
                  <AuthorInitial author={note.author.trim()} locale={locale} />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs text-ink-secondary">
                      <span className="font-bold text-ink-primary">{note.author}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="sr-only">, </span>
                      <RelativeTime dateTime={note.createdAt} locale={locale} />

                    </p>
                    <p
                      className={`line-clamp-2 text-sm text-ink-secondary ${GROUP_HOVER_ACCENT_CLASS}`}
                    >
                      {note.content}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </RowList>
        </PreviewGroup>
      </Surface>
    </section>
  );
}

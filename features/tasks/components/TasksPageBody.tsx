"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import { TasksToolbar } from "@/features/tasks/components/TasksToolbar";
import type { TaskFilter, TasksPageData } from "@/features/tasks/types/tasks";
import type { FilterNavItem } from "@/shared/ui/FilterNav";
import { Surface } from "@/shared/ui/Surface";

function TaskQuickAddPlaceholder() {
  return (
    <div
      aria-hidden="true"
      data-testid="task-quick-add-placeholder"
      className="space-y-3"
    >
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        <span className="mb-2 block text-sm font-semibold">&nbsp;</span>
        <div className="col-start-1 h-11 rounded-control border-control border-border bg-surface" />
        <div className="col-start-2 row-start-2 h-11 w-20 rounded-control bg-muted" />
      </div>
      <div className="h-11" />
    </div>
  );
}

const TaskQuickAdd = dynamic(
  () =>
    import("@/features/tasks/components/forms/TaskQuickAdd").then(
      (module) => module.TaskQuickAdd,
    ),
  { loading: TaskQuickAddPlaceholder },
);

interface TasksPageBodyProps {
  activeFilter: TaskFilter;
  data: TasksPageData;
}

const OVERDUE_HEADING_ID = "tasks-group-overdue";
const ON_TRACK_HEADING_ID = "tasks-group-on-track";
const OPEN_HEADING_ID = "tasks-group-open";
const DONE_HEADING_ID = "tasks-group-done";

export function TasksPageBody({ activeFilter, data }: TasksPageBodyProps) {
  const t = useTranslations("tasks");

  const filterItems: FilterNavItem<TaskFilter>[] = [
    {
      label: t("toolbar.filters.open"),
      value: data.openCount,
      filter: "open",
    },
    {
      label: t("toolbar.filters.done"),
      value: data.doneCount,
      filter: "done",
    },
  ];

  const showQuickAdd = activeFilter === "open" && data.canManage;

  const toolbarSummaryItems = [
    {
      id: "open" as const,
      label: t("toolbar.summary.open"),
      value: data.openCount,
      tone: "neutral" as const,
    },
    {
      id: "overdue" as const,
      label: t("toolbar.summary.overdue"),
      value: data.overdueCount,
      tone: "danger" as const,
    },
    {
      id: "done" as const,
      label: t("toolbar.summary.done"),
      value: data.doneCount,
      tone: "success" as const,
    },
  ];

  const toolbarSectionKey = activeFilter === "done" ? "done" : "open";
  const toolbarTitle = t(`sections.${toolbarSectionKey}.title`);
  const toolbarDescription = t(`sections.${toolbarSectionKey}.description`);
  const toolbarTotalCount =
    activeFilter === "done" ? data.doneCount : data.openCount;

  const sharedPermissions = {
    canManageTasks: data.canManage,
    currentUserId: data.currentUserId,
  };

  return (
    <div className="space-y-7 lg:space-y-10">
      <section className="space-y-4">
        <TasksToolbar
          activeFilter={activeFilter}
          title={toolbarTitle}
          description={toolbarDescription}
          totalCount={toolbarTotalCount}
          summaryItems={toolbarSummaryItems}
          filterItems={filterItems}
          filterAriaLabel={t("aria.filterNavigation")}
        />

        {showQuickAdd ? (
          <Surface className="px-4 py-3 lg:px-6">
            <TaskQuickAdd />
          </Surface>
        ) : null}
      </section>

      {activeFilter === "done" ? (
        <TaskGroup
          headingId={DONE_HEADING_ID}
          eyebrow={t("sections.done.eyebrow")}
          title={t("sections.done.title")}
          description={t("sections.done.description")}
          tasks={data.doneTasks}
          emptyTitle={t("sections.done.emptyTitle")}
          emptyDescription={t("sections.done.emptyDescription")}
          {...sharedPermissions}
        />
      ) : data.overdueCount > 0 ? (
        <div className="space-y-7 lg:space-y-10">
          <TaskGroup
            headingId={OVERDUE_HEADING_ID}
            eyebrow={t("sections.overdue.eyebrow")}
            title={t("sections.overdue.title")}
            description={t("sections.overdue.description")}
            tasks={data.overdueTasks}
            emptyTitle={t("sections.overdue.emptyTitle")}
            emptyDescription={t("sections.overdue.emptyDescription")}
            tone="danger"
            {...sharedPermissions}
          />

          {data.onTrackCount > 0 ? (
            <TaskGroup
              headingId={ON_TRACK_HEADING_ID}
              eyebrow={t("sections.onTrack.eyebrow")}
              title={t("sections.onTrack.title")}
              description={t("sections.onTrack.description")}
              tasks={data.onTrackTasks}
              emptyTitle={t("sections.onTrack.emptyTitle")}
              emptyDescription={t("sections.onTrack.emptyDescription")}
              {...sharedPermissions}
            />
          ) : null}
        </div>
      ) : (
        <TaskGroup
          headingId={OPEN_HEADING_ID}
          eyebrow={t("sections.open.eyebrow")}
          title={t("sections.open.title")}
          description={t("sections.open.description")}
          tasks={data.openTasks}
          emptyTitle={t("sections.open.emptyTitle")}
          emptyDescription={t("sections.open.emptyDescription")}
          {...sharedPermissions}
        />
      )}
    </div>
  );
}

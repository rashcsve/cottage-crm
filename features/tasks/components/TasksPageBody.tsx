"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import { TasksToolbar } from "@/features/tasks/components/TasksToolbar";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import type {
  Task,
  TaskFilter,
  TasksPageData,
} from "@/features/tasks/types/tasks";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import type { FilterNavItem } from "@/shared/ui/FilterNav";
import { QuickAddPlaceholder } from "@/shared/ui/Form/QuickAddPlaceholder";
import { Surface } from "@/shared/ui/Surface";

const TaskQuickAdd = dynamic(
  () =>
    import("@/features/tasks/components/forms/TaskQuickAdd").then(
      (module) => module.TaskQuickAdd,
    ),
  {
    loading: () => (
      <QuickAddPlaceholder testId="task-quick-add-placeholder" withDetailsRow />
    ),
  },
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
  const tCommon = useTranslations("common");
  const router = useRouter();

  const allTasks = useMemo(
    () => [...data.openTasks, ...data.doneTasks],
    [data.openTasks, data.doneTasks],
  );

  const { removeItem: removeTask, isRemoved } = useOptimisticRemoveList({
    items: allTasks,
    commitRemove: (task) => deleteTaskAction({ taskId: task.id }),
    messages: {
      success: t("delete.success"),
      restored: t("delete.restored"),
      undo: t("delete.undo"),
      fallbackError: tCommon("error"),
      retry: t("delete.retry"),
    },
    onCommitSuccess: () => {
      router.refresh();
    },
  });

  const isVisible = (task: Task) => !isRemoved(task.id);
  const openTasks = data.openTasks.filter(isVisible);
  const overdueTasks = data.overdueTasks.filter(isVisible);
  const onTrackTasks = data.onTrackTasks.filter(isVisible);
  const doneTasks = data.doneTasks.filter(isVisible);

  const filterItems: FilterNavItem<TaskFilter>[] = [
    {
      label: t("toolbar.filters.open"),
      value: openTasks.length,
      filter: "open",
    },
    {
      label: t("toolbar.filters.done"),
      value: doneTasks.length,
      filter: "done",
    },
  ];

  const showQuickAdd = activeFilter === "open" && data.canManage;

  const toolbarSummaryItems = [
    {
      id: "open" as const,
      label: t("toolbar.summary.open"),
      value: openTasks.length,
      tone: "neutral" as const,
    },
    {
      id: "overdue" as const,
      label: t("toolbar.summary.overdue"),
      value: overdueTasks.length,
      tone: "danger" as const,
    },
    {
      id: "done" as const,
      label: t("toolbar.summary.done"),
      value: doneTasks.length,
      tone: "success" as const,
    },
  ];

  const toolbarSectionKey = activeFilter === "done" ? "done" : "open";
  const toolbarTitle = t(`sections.${toolbarSectionKey}.title`);
  const toolbarDescription = t(`sections.${toolbarSectionKey}.description`);
  const toolbarTotalCount =
    activeFilter === "done" ? doneTasks.length : openTasks.length;

  const sharedPermissions = {
    canManageTasks: data.canManage,
    currentUserId: data.currentUserId,
    onDelete: removeTask,
  };

  return (
    <div className="space-y-7 lg:space-y-10">
      <section className="space-y-2">
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
          tasks={doneTasks}
          emptyTitle={t("sections.done.emptyTitle")}
          emptyDescription={t("sections.done.emptyDescription")}
          {...sharedPermissions}
        />
      ) : overdueTasks.length > 0 ? (
        <div className="space-y-7 lg:space-y-10">
          <TaskGroup
            headingId={OVERDUE_HEADING_ID}
            eyebrow={t("sections.overdue.eyebrow")}
            title={t("sections.overdue.title")}
            description={t("sections.overdue.description")}
            tasks={overdueTasks}
            emptyTitle={t("sections.overdue.emptyTitle")}
            emptyDescription={t("sections.overdue.emptyDescription")}
            tone="danger"
            {...sharedPermissions}
          />

          {onTrackTasks.length > 0 ? (
            <TaskGroup
              headingId={ON_TRACK_HEADING_ID}
              eyebrow={t("sections.onTrack.eyebrow")}
              title={t("sections.onTrack.title")}
              description={t("sections.onTrack.description")}
              tasks={onTrackTasks}
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
          tasks={openTasks}
          emptyTitle={t("sections.open.emptyTitle")}
          emptyDescription={t("sections.open.emptyDescription")}
          {...sharedPermissions}
        />
      )}
    </div>
  );
}

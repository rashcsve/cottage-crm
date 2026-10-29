"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { Calendar, Clock, TriangleAlert } from "lucide-react";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import { TasksToolbar } from "@/features/tasks/components/TasksToolbar";
import { groupOpenTasksByUrgency } from "@/features/tasks/domain/urgency-groups";
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

const NEEDS_ATTENTION_HEADING_ID = "tasks-group-needs-attention";
const TODAY_HEADING_ID = "tasks-group-today";
const LATER_HEADING_ID = "tasks-group-later";
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
  const doneTasks = data.doneTasks.filter(isVisible);
  const urgencyGroups = groupOpenTasksByUrgency(openTasks);

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

  const singleGroupHeadingId =
    activeFilter === "done"
      ? DONE_HEADING_ID
      : openTasks.length === 0
        ? OPEN_HEADING_ID
        : undefined;

  const sharedPermissions = {
    canManageTasks: data.canManage,
    currentUserId: data.currentUserId,
    onDelete: removeTask,
  };

  return (
    <div className="space-y-2">
      <section className="space-y-2">
        <TasksToolbar
          activeFilter={activeFilter}
          title={t(activeFilter === "done" ? "sections.done.title" : "sections.open.title")}
          titleId={singleGroupHeadingId}
          totalCount={activeFilter === "done" ? doneTasks.length : openTasks.length}
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
          title={t("sections.done.title")}
          tasks={doneTasks}
          emptyTitle={t("sections.done.emptyTitle")}
          emptyDescription={t("sections.done.emptyDescription")}
          showHeader={false}
          {...sharedPermissions}
        />
      ) : openTasks.length > 0 ? (
        <div className="space-y-7 lg:space-y-10">
          {urgencyGroups.needsAttention.length > 0 ? (
            <TaskGroup
              headingId={NEEDS_ATTENTION_HEADING_ID}
              title={t("groups.needsAttention")}
              tasks={urgencyGroups.needsAttention}
              tone="danger"
              icon={TriangleAlert}
              {...sharedPermissions}
            />
          ) : null}

          {urgencyGroups.today.length > 0 ? (
            <TaskGroup
              headingId={TODAY_HEADING_ID}
              title={t("groups.today")}
              tasks={urgencyGroups.today}
              tone="warning"
              icon={Clock}
              {...sharedPermissions}
            />
          ) : null}

          {urgencyGroups.later.length > 0 ? (
            <TaskGroup
              headingId={LATER_HEADING_ID}
              title={t("groups.later")}
              tasks={urgencyGroups.later}
              tone="neutral"
              icon={Calendar}
              {...sharedPermissions}
            />
          ) : null}
        </div>
      ) : (
        <TaskGroup
          headingId={OPEN_HEADING_ID}
          title={t("sections.open.title")}
          tasks={openTasks}
          emptyTitle={t("sections.open.emptyTitle")}
          emptyDescription={t("sections.open.emptyDescription")}
          showHeader={false}
          {...sharedPermissions}
        />
      )}
    </div>
  );
}

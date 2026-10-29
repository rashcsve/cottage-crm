"use client";

import { useMemo, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Calendar, Clock, TriangleAlert } from "lucide-react";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import { TaskQuickAddBar } from "@/features/tasks/components/TaskQuickAddBar";
import { TasksDueChips } from "@/features/tasks/components/TasksDueChips";
import { TasksHeaderSummary } from "@/features/tasks/components/TasksHeaderSummary";
import { TasksStatusSwitch } from "@/features/tasks/components/TasksStatusSwitch";
import { filterOpenTasksByDue } from "@/features/tasks/domain/due-filter";
import { groupOpenTasksByUrgency } from "@/features/tasks/domain/urgency-groups";
import { deleteTaskAction } from "@/features/tasks/server/actions";
import type {
  Task,
  TaskDueFilter,
  TaskFilter,
  TaskUrgencyGroups,
  TasksPageData,
} from "@/features/tasks/types/tasks";
import { useRouter } from "@/i18n/navigation";
import { useOptimisticRemoveList } from "@/shared/hooks/useOptimisticRemoveList";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Surface } from "@/shared/ui/Surface";
import { TextLink } from "@/shared/ui/TextLink";

interface TasksPageBodyProps {
  activeFilter: TaskFilter;
  activeDue: TaskDueFilter;
  data: TasksPageData;
}

type OpenView = "groups" | "filteredEmpty" | "empty";

const NEEDS_ATTENTION_HEADING_ID = "tasks-group-needs-attention";
const TODAY_HEADING_ID = "tasks-group-today";
const LATER_HEADING_ID = "tasks-group-later";
const OPEN_HEADING_ID = "tasks-group-open";
const DONE_HEADING_ID = "tasks-group-done";

function getOpenView(
  groups: TaskUrgencyGroups,
  activeDue: TaskDueFilter,
): OpenView {
  const visibleCount =
    groups.needsAttention.length + groups.today.length + groups.later.length;

  if (visibleCount > 0) {
    return "groups";
  }

  return activeDue === "all" ? "empty" : "filteredEmpty";
}

function getSingleGroupHeadingId(
  activeFilter: TaskFilter,
  openView: OpenView,
): string | undefined {
  if (activeFilter === "done") {
    return DONE_HEADING_ID;
  }

  return openView === "empty" ? OPEN_HEADING_ID : undefined;
}

export function TasksPageBody({
  activeFilter,
  activeDue,
  data,
}: TasksPageBodyProps) {
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
  const overdueCount = groupOpenTasksByUrgency(openTasks).needsAttention.length;
  const urgencyGroups = groupOpenTasksByUrgency(
    filterOpenTasksByDue(openTasks, activeDue, data.todayIso),
  );
  const openView = getOpenView(urgencyGroups, activeDue);

  const showQuickAdd = activeFilter === "open" && data.canManage;

  const singleGroupHeadingId = getSingleGroupHeadingId(activeFilter, openView);

  const sharedPermissions = {
    canManageTasks: data.canManage,
    currentUserId: data.currentUserId,
    onDelete: removeTask,
  };

  function renderTaskList() {
    if (activeFilter === "done") {
      return (
        <TaskGroup
          headingId={DONE_HEADING_ID}
          title={t("sections.done.title")}
          tasks={doneTasks}
          emptyTitle={t("sections.done.emptyTitle")}
          emptyDescription={t("sections.done.emptyDescription")}
          showHeader={false}
          {...sharedPermissions}
        />
      );
    }

    if (openView === "filteredEmpty") {
      return (
        <Surface className="px-4 lg:px-6">
          <EmptyState
            title={t("empty.filteredTitle")}
            description={t("empty.filteredDescription")}
            action={
              <TextLink href={{ pathname: "/tasks", query: { filter: "open" } }}>
                {t("empty.showAll")}
              </TextLink>
            }
          />
        </Surface>
      );
    }

    if (openView === "groups") {
      return (
        <Surface className="divide-y divide-border px-4 pb-1 lg:px-6">
          {urgencyGroups.needsAttention.length > 0 ? (
            <TaskGroup
              headingId={NEEDS_ATTENTION_HEADING_ID}
              title={t("groups.needsAttention")}
              tasks={urgencyGroups.needsAttention}
              tone="danger"
              icon={TriangleAlert}
              framed={false}
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
              framed={false}
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
              framed={false}
              {...sharedPermissions}
            />
          ) : null}
        </Surface>
      );
    }

    return (
      <TaskGroup
        headingId={OPEN_HEADING_ID}
        title={t("sections.open.title")}
        tasks={openTasks}
        emptyTitle={t("sections.open.emptyTitle")}
        emptyDescription={t("sections.open.emptyDescription")}
        showHeader={false}
        {...sharedPermissions}
      />
    );
  }

  function renderPage(headerTrigger: ReactNode) {
    return (
      <div className="space-y-2">
        <section className="space-y-2">
          <header className="space-y-3 px-3.5 pb-1 sm:px-4 sm:pb-4">
            <div className="flex items-center justify-between gap-3">
              <TasksHeaderSummary
                openCount={openTasks.length}
                overdueCount={overdueCount}
              />
              {headerTrigger}
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="md:w-80 md:shrink-0">
                <TasksStatusSwitch
                  activeFilter={activeFilter}
                  openCount={openTasks.length}
                  doneCount={doneTasks.length}
                />
              </div>
              {activeFilter === "open" ? (
                <TasksDueChips activeDue={activeDue} />
              ) : null}
            </div>
            <h2 id={singleGroupHeadingId} className="sr-only">
              {t(activeFilter === "done" ? "sections.done.title" : "sections.open.title")}
            </h2>
          </header>
        </section>

        {renderTaskList()}
      </div>
    );
  }

  if (showQuickAdd) {
    return <TaskQuickAddBar todayIso={data.todayIso}>{renderPage}</TaskQuickAddBar>;
  }

  return renderPage(null);
}

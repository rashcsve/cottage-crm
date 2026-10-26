"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { NewTaskForm } from "@/features/tasks/components/forms/NewTaskForm";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import {
  TasksToolbar,
  type TasksToolbarAction,
} from "@/features/tasks/components/TasksToolbar";
import type { TaskFilter, TasksPageData } from "@/features/tasks/types/tasks";
import { useComposerScroll } from "@/shared/hooks/useComposerScroll";
import type { FilterNavItem } from "@/shared/ui/FilterNav";

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
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const composerRef = useComposerScroll(isComposerOpen);

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

  const primaryAction: TasksToolbarAction | undefined =
    activeFilter === "open" && data.canManage && !isComposerOpen
      ? {
          label: t("form.openComposer"),
          onClick: () => setIsComposerOpen(true),
          icon: Plus,
        }
      : undefined;

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
          primaryAction={primaryAction}
        />

        {activeFilter === "open" && data.canManage && isComposerOpen ? (
          <div ref={composerRef}>
            <NewTaskForm onClose={() => setIsComposerOpen(false)} />
          </div>
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

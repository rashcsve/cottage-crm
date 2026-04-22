"use client";

import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import { NewTaskForm } from "@/features/tasks/components/forms/NewTaskForm";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import {
  TasksToolbar,
  type TasksToolbarAction,
} from "@/features/tasks/components/TasksToolbar";
import type { TaskFilter, TasksPageData } from "@/features/tasks/types/tasks";
import type { TaskFilterNavItem } from "@/features/tasks/components/TaskFilterNav";

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
  const composerRef = useRef<HTMLDivElement>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  useEffect(() => {
    if (!isComposerOpen) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      "matchMedia" in window &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const frameId = requestAnimationFrame(() => {
      if (typeof composerRef.current?.scrollIntoView === "function") {
        composerRef.current.scrollIntoView({
          behavior: prefersReducedMotion ? "auto" : "smooth",
          block: "start",
        });
      }
    });

    return () => cancelAnimationFrame(frameId);
  }, [isComposerOpen]);

  const filterItems: TaskFilterNavItem[] = [
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

  const sharedPermissions = {
    canManageTasks: data.canManage,
    currentUserId: data.currentUserId,
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
        <TasksToolbar
          activeFilter={activeFilter}
          filterItems={filterItems}
          filterAriaLabel={t("aria.filterNavigation")}
          primaryAction={primaryAction}
        />

        {activeFilter === "open" && data.canManage && isComposerOpen ? (
          <div
            ref={composerRef}
            className="border-t border-stone-200 bg-stone-50 px-3 py-4 sm:px-5 sm:py-5"
          >
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
          tone="success"
          {...sharedPermissions}
        />
      ) : data.overdueCount > 0 ? (
        <div className="space-y-4 sm:space-y-5">
          <TaskGroup
            headingId={OVERDUE_HEADING_ID}
            eyebrow={t("sections.overdue.eyebrow")}
            title={t("sections.overdue.title")}
            description={t("sections.overdue.description")}
            tasks={data.overdueTasks}
            emptyTitle={t("sections.overdue.emptyTitle")}
            emptyDescription={t("sections.overdue.emptyDescription")}
            tone="warning"
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

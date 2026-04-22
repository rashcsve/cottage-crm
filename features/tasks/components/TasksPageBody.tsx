import { NewTaskForm } from "@/features/tasks/components/forms/NewTaskForm";
import { TaskGroup } from "@/features/tasks/components/TaskGroup";
import { TaskList } from "@/features/tasks/components/TaskList";
import type {
  TaskFilter,
  TasksPageData,
} from "@/features/tasks/types/tasks";
import { Surface } from "@/shared/ui/Surface";

export interface TasksPageSectionLabels {
  open: {
    emptyTitle: string;
    emptyDescription: string;
  };
  overdue: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  onTrack: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
  };
  done: {
    title: string;
    emptyTitle: string;
    emptyDescription: string;
  };
}

interface TasksPageBodyProps {
  activeFilter: TaskFilter;
  data: TasksPageData;
  sectionLabels: TasksPageSectionLabels;
}

const TOP_ACTION_CLASS = "border-b border-stone-200 px-4 py-3 sm:px-5";
const GROUPS_WRAPPER_CLASS = "divide-y divide-stone-200";

const OVERDUE_HEADING_ID = "tasks-group-overdue";
const ON_TRACK_HEADING_ID = "tasks-group-on-track";
const DONE_HEADING_ID = "tasks-group-done";

export function TasksPageBody({
  activeFilter,
  data,
  sectionLabels,
}: TasksPageBodyProps) {
  const sharedPermissions = {
    canManageTasks: data.canManage,
    currentUserId: data.currentUserId,
  };

  const showNewTaskForm = activeFilter === "open" && data.canManage;
  const hasOverdue = data.overdueCount > 0;
  const hasOnTrack = data.onTrackCount > 0;

  return (
    <Surface className="overflow-hidden">
      {showNewTaskForm && (
        <div className={TOP_ACTION_CLASS}>
          <NewTaskForm />
        </div>
      )}

      {activeFilter === "done" ? (
        <TaskGroup
          headingId={DONE_HEADING_ID}
          title={sectionLabels.done.title}
          tasks={data.doneTasks}
          emptyTitle={sectionLabels.done.emptyTitle}
          emptyDescription={sectionLabels.done.emptyDescription}
          {...sharedPermissions}
        />
      ) : hasOverdue ? (
        <div className={GROUPS_WRAPPER_CLASS}>
          <TaskGroup
            headingId={OVERDUE_HEADING_ID}
            title={sectionLabels.overdue.title}
            tasks={data.overdueTasks}
            emptyTitle={sectionLabels.overdue.emptyTitle}
            emptyDescription={sectionLabels.overdue.emptyDescription}
            tone="warning"
            {...sharedPermissions}
          />

          {hasOnTrack && (
            <TaskGroup
              headingId={ON_TRACK_HEADING_ID}
              title={sectionLabels.onTrack.title}
              tasks={data.onTrackTasks}
              emptyTitle={sectionLabels.onTrack.emptyTitle}
              emptyDescription={sectionLabels.onTrack.emptyDescription}
              {...sharedPermissions}
            />
          )}
        </div>
      ) : (
        <TaskList
          initialTasks={data.openTasks}
          emptyTitle={sectionLabels.open.emptyTitle}
          emptyDescription={sectionLabels.open.emptyDescription}
          variant="plain"
          {...sharedPermissions}
        />
      )}
    </Surface>
  );
}

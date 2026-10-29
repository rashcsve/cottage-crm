import type { LucideIcon } from "lucide-react";
import { TaskList } from "@/features/tasks/components/TaskList";
import type { Task } from "@/features/tasks/types/tasks";
import { StatusLabel } from "@/shared/ui/StatusLabel";
import { Surface } from "@/shared/ui/Surface";

type TaskGroupTone =
  | { tone: "danger" | "warning"; icon: LucideIcon }
  | { tone?: "neutral"; icon?: LucideIcon };

type TaskGroupProps = TaskGroupTone & {
  title: string;
  headingId: string;
  tasks: Task[];
  onDelete: (task: Task) => void;
  canManageTasks: boolean;
  currentUserId: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showHeader?: boolean;
  framed?: boolean;
};

const TITLE_CLASS = "text-base font-bold tracking-heading";
const COUNT_CLASS =
  "font-mono text-sm tabular-nums text-ink-secondary before:mr-2 before:text-ink-muted before:content-['·']";

function GroupLabel({ title, label }: { title: string; label: TaskGroupTone }) {
  if (label.tone === "danger" || label.tone === "warning") {
    return (
      <StatusLabel tone={label.tone} icon={label.icon} className={TITLE_CLASS}>
        {title}
      </StatusLabel>
    );
  }

  return (
    <StatusLabel tone="neutral" icon={label.icon} className={TITLE_CLASS}>
      {title}
    </StatusLabel>
  );
}

export function TaskGroup({
  title,
  headingId,
  tasks,
  onDelete,
  canManageTasks,
  currentUserId,
  emptyTitle,
  emptyDescription,
  showHeader = true,
  framed = true,
  ...label
}: TaskGroupProps) {
  const list = (
    <TaskList
      tasks={tasks}
      onDelete={onDelete}
      canManageTasks={canManageTasks}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      currentUserId={currentUserId}
    />
  );

  return (
    <section
      className={framed ? "space-y-3" : "space-y-1 pt-4"}
      aria-labelledby={headingId}
    >
      {showHeader ? (
        <div className="flex items-center gap-2">
          <h3 id={headingId}>
            <GroupLabel title={title} label={label} />
          </h3>
          <span className={COUNT_CLASS}>{tasks.length}</span>
        </div>
      ) : null}

      {framed ? <Surface className="px-4 lg:px-6">{list}</Surface> : list}
    </section>
  );
}

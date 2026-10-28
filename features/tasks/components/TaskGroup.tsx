import { TriangleAlert } from "lucide-react";
import { TaskList } from "@/features/tasks/components/TaskList";
import type { Task } from "@/features/tasks/types/tasks";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusLabel } from "@/shared/ui/StatusLabel";
import { Surface } from "@/shared/ui/Surface";

interface TaskGroupProps {
  title: string;
  headingId: string;
  tasks: Task[];
  onDelete: (task: Task) => void;
  canManageTasks: boolean;
  currentUserId: string;
  emptyTitle?: string;
  emptyDescription?: string;
  tone?: "neutral" | "danger";
  showHeader?: boolean;
}

const COUNT_CLASS = "font-mono text-sm tabular-nums";

export function TaskGroup({
  title,
  headingId,
  tasks,
  onDelete,
  canManageTasks,
  currentUserId,
  emptyTitle,
  emptyDescription,
  tone = "neutral",
  showHeader = true,
}: TaskGroupProps) {
  return (
    <section className="space-y-3" aria-labelledby={headingId}>
      {showHeader ? (
        <SectionHeader
          title={title}
          titleId={headingId}
          titleTag="h3"
          badge={
            tone === "danger" ? (
              <StatusLabel tone="danger" icon={TriangleAlert} className={COUNT_CLASS}>
                {tasks.length}
              </StatusLabel>
            ) : (
              <StatusLabel tone="neutral" className={COUNT_CLASS}>
                {tasks.length}
              </StatusLabel>
            )
          }
        />
      ) : null}

      <Surface className="px-4 lg:px-6">
        <TaskList
          tasks={tasks}
          onDelete={onDelete}
          canManageTasks={canManageTasks}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          currentUserId={currentUserId}
        />
      </Surface>
    </section>
  );
}

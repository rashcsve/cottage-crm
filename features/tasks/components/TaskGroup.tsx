import { TaskList } from "@/features/tasks/components/TaskList";
import type { Task } from "@/features/tasks/types/tasks";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";

interface TaskGroupProps {
  eyebrow: string;
  title: string;
  description: string;
  headingId: string;
  tasks: Task[];
  canManageTasks: boolean;
  currentUserId: string;
  emptyTitle?: string;
  emptyDescription?: string;
  tone?: StatusBadgeTone;
}

const PANEL_BASE_CLASS =
  "rounded-2xl border border-stone-200 bg-stone-50/70 p-3.5 shadow-sm sm:rounded-3xl sm:p-4";
const BASE_TITLE_CLASS = "text-lg font-semibold leading-tight";
const NEUTRAL_TITLE_CLASS = "text-stone-900";
const WARNING_TITLE_CLASS = "text-amber-900";
const COUNT_BADGE_CLASS = "tabular-nums";
const WARNING_PANEL_CLASS = "border-amber-200 bg-amber-50/60";

export function TaskGroup({
  eyebrow,
  title,
  description,
  headingId,
  tasks,
  canManageTasks,
  currentUserId,
  emptyTitle,
  emptyDescription,
  tone = "neutral",
}: TaskGroupProps) {
  const titleToneClass =
    tone === "warning" ? WARNING_TITLE_CLASS : NEUTRAL_TITLE_CLASS;
  const panelToneClass = tone === "warning" ? WARNING_PANEL_CLASS : "";

  return (
    <section
      className={`${PANEL_BASE_CLASS} ${panelToneClass}`.trim()}
      aria-labelledby={headingId}
    >
      <div className="flex flex-col gap-3">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          titleId={headingId}
          titleTag="h3"
          titleClassName={`${BASE_TITLE_CLASS} ${titleToneClass}`}
          description={description}
          badge={
            <StatusBadge tone={tone} className={COUNT_BADGE_CLASS}>
              {tasks.length}
            </StatusBadge>
          }
          contentClassName="space-y-1.5"
        />

        <TaskList
          initialTasks={tasks}
          canManageTasks={canManageTasks}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          currentUserId={currentUserId}
          variant="plain"
        />
      </div>
    </section>
  );
}

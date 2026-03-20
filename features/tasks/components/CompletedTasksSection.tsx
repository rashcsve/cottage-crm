import { Task } from "@/features/tasks/types/task.types";
import { TaskList } from "./TaskList";

interface CompletedTasksSectionProps {
  completedTasks: Task[];
  totalCount: number;
  canManageTasks: boolean;
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CompletedTasksSection({
  completedTasks,
  totalCount,
  canManageTasks,
}: CompletedTasksSectionProps) {
  return (
    <details
      open={totalCount === 0}
      className="group rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
            Historie
          </p>

          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-stone-900">Dokončené</h2>
            <span className="inline-flex min-w-9 items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
              {totalCount}
            </span>
          </div>
        </div>

        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition group-open:rotate-180">
          <ChevronDownIcon />
        </span>
      </summary>

      <div className="mt-5">
        <TaskList
          tasks={completedTasks}
          canManageTasks={canManageTasks}
          emptyTitle="Zatím nic dokončeného"
          emptyDescription="Až se něco uzavře, objeví se to tady."
        />

        {totalCount > completedTasks.length ? (
          <p className="mt-4 text-xs text-stone-500">
            Zobrazeno {completedTasks.length} z {totalCount} hotových úkolů.
          </p>
        ) : null}
      </div>
    </details>
  );
}


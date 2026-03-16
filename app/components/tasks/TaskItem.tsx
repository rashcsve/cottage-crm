import { Task } from "./types";

type TaskItemProps = {
  task: Task;
};

export function TaskItem({ task }: TaskItemProps) {
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h4
          className={
            task.status === "done"
              ? "text-lg font-semibold line-through text-stone-400"
              : "text-lg font-semibold text-stone-800"
          }
        >
          {task.title}
        </h4>

        <p className="mt-1 text-sm text-stone-500">Přidal(a): {task.author}</p>
      </div>
      {/* <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onToggleTask(task.id)}
          className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 cursor-pointer"
        >
          {task.status === "pending" ? "Označit jako hotovo" : "Vrátit na čeká"}
        </button>

        <button
          type="button"
          onClick={() => onDeleteTask(task.id)}
          className="rounded-xl border border-red-200 px-4 py-2 text-sm text-red-700 font-medium transition hover:bg-red-50 cursor-pointer"
        >
          Smazat
        </button>
      </div> */}
    </article>
  );
}

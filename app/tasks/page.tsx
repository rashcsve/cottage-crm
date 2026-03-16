"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";

type TaskStatus = "pending" | "done";

interface Task {
  id: number;
  title: string;
  status: TaskStatus;
  author: string;
}

const initialTasks: Task[] = [
  {
    id: 1,
    title: "Posekat trávu",
    status: "pending",
    author: "Filip",
  },
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  function handleAddTask() {
    const trimmedTitle = newTaskTitle.trim();

    if (!trimmedTitle) return;

    const newTask: Task = {
      id: Date.now(),
      title: trimmedTitle,
      status: "pending",
      author: "Svetlana",
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setNewTaskTitle("");
  }

  function handleToggleTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, status: task.status === "pending" ? "done" : "pending" }
          : task
      )
    );
  }

  const pendingCount = useMemo(() => {
    return tasks.filter((task) => task.status === "pending").length;
  }, [tasks]);

  return (
    <AppShell title="Úkoly">
      <SectionHeader
        title="Seznam úkolů"
        description="Opravy, sečení a další práce kolem chaty"
      />

      <section className="mb-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
        <label
          htmlFor="new-task"
          className="mb-2 block text-sm font-medium text-stone-700"
        >
          Nový úkol
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="new-task"
            type="text"
            value={newTaskTitle}
            onChange={(event) => setNewTaskTitle(event.target.value)}
            placeholder="Např. natřít lavičku"
            className="flex-1 rounded-xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-stone-500"
          />

          <button
            type="button"
            onClick={handleAddTask}
            className="rounded-xl bg-stone-800 px-5 py-3 font-medium text-white transition hover:bg-stone-700"
          >
            Přidat úkol
          </button>
        </div>
      </section>

      <section className="mb-4">
        <p className="text-sm text-stone-600">
          Čekající úkoly: <strong>{pendingCount}</strong>
        </p>
      </section>

      <section className="space-y-3">
        {tasks.map((task) => (
          <article
            key={task.id}
            className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
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

              <p className="mt-1 text-sm text-stone-500">
                Přidal(a): {task.author}
              </p>

              <button
                type="button"
                onClick={() => handleToggleTask(task.id)}
                className="rounded-xl border border-stone-300 px-4 py-2 text-sm font-medium transition hover:bg-stone-100 cursor-pointer"
              >
                {task.status === "pending"
                  ? "Označit jako hotovo"
                  : "Vrátit na čeká"}
              </button>
            </div>
          </article>
        ))}

        {tasks.length === 0 && (
          <p className="text-stone-500"> Zatím tu nejsou žádné úkoly.</p>
        )}
      </section>
    </AppShell>
  );
}

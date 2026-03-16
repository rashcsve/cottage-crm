"use client";

import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { Task } from "@/components/tasks/types";

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

  function handleAddTask(title: string) {
    const newTask: Task = {
      id: Date.now(),
      title,
      status: "pending",
      author: "Svetlana",
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
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

  function handleDeleteTask(taskId: number) {
    setTasks((currentTasks) =>
      currentTasks.filter((task) => task.id !== taskId)
    );
  }

  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  return (
    <AppShell title="Úkoly">
      <SectionHeader
        title="Seznam úkolů"
        description="Opravy, sečení a další práce kolem chaty"
      />

      <NewTaskForm onAddTask={handleAddTask} />

      <section className="mb-4">
        <p className="text-sm text-stone-600">
          Čekající úkoly: <strong>{pendingCount}</strong>
        </p>
      </section>

      <TaskList
        tasks={tasks}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
      />
    </AppShell>
  );
}

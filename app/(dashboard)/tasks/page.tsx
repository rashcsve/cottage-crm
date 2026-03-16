import { SectionHeader } from "@/components/SectionHeader";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { Task } from "@/components/tasks/types";
import { createClient } from "@/../lib/supabase/server";
import { getCurrentProfile } from "@/../lib/auth/get-current-profile";

type TaskRow = {
  id: number;
  title: string;
  status: "pending" | "done";
  author_id: string;
  created_at: string;
  author: {
    display_name: string | null;
  } | null;
};

export default async function TasksPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();

  const { data: tasksData, error: tasksError } = await supabase
    .from("tasks")
    .select(
      `
    id,
    title,
    status,
    author_id,
    created_at,
    author:profiles!tasks_author_id_fkey (
      display_name
    )
  `
    )
    .order("created_at", { ascending: false });

  if (tasksError)
    throw new Error(`Nepodařilo se načíst úkoly: ${tasksError.message}`);

  const taskRows = (tasksData ?? []) as unknown as TaskRow[];
  const tasks: Task[] = taskRows.map((task) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    author_id: task.author_id,
    created_at: task.created_at,
    author_name: task.author?.display_name ?? "Neznámý uživatel",
  }));

  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  return (
    <>
      <SectionHeader title="Seznam úkolů" />

      {profile.role === "admin" && <NewTaskForm />}

      <section className="mb-4">
        <p className="text-sm text-stone-600">
          Čekající úkoly: <strong>{pendingCount}</strong>
        </p>
      </section>

      <TaskList tasks={tasks} canManageTasks={profile.role === "admin"} />
    </>
  );
}

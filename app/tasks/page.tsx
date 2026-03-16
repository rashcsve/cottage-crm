import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { NewTaskForm } from "@/components/tasks/NewTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { Task } from "@/components/tasks/types";
import { createClient } from "@/../lib/supabase/client";

export default async function TasksPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Nepodařilo se načíst úkoly: ${error.message}`);

  const tasks = (data ?? []) as Task[];

  const pendingCount = tasks.filter((task) => task.status === "pending").length;

  return (
    <AppShell title="Úkoly">
      <SectionHeader
        title="Seznam úkolů"
        description="Opravy, sečení a další práce kolem chaty"
      />

      <NewTaskForm />

      <section className="mb-4">
        <p className="text-sm text-stone-600">
          Čekající úkoly: <strong>{pendingCount}</strong>
        </p>
      </section>

      <TaskList tasks={tasks} />
    </AppShell>
  );
}

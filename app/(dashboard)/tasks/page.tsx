import { NewTaskForm } from "@/app/components/tasks/NewTaskForm";
import { TaskList } from "@/app/components/tasks/TaskList";
import { Task } from "@/app/components/tasks/types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { PageContent } from "@/app/components/ui/PageContent";
import { PageHeader } from "@/app/components/ui/PageHeader";
import { PageSection } from "@/app/components/ui/PageSections";
import { StatCard } from "@/app/components/ui/StatCard";

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
  const canManage = isAdminRole(profile.role);

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

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const doneTasks = tasks.filter((task) => task.status === "done");

  return (
    <PageContent>
      <PageHeader title="Seznam úkolů" />

      <section className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Čeká" value={pendingTasks.length} />
        <StatCard label="Hotovo" value={doneTasks.length} />
      </section>

      {canManage && <NewTaskForm />}

      <PageSection title="Čeká">
        <TaskList tasks={pendingTasks} canManageTasks={canManage} />
      </PageSection>

      <PageSection title="Hotovo">
        <TaskList tasks={doneTasks} canManageTasks={canManage} />
      </PageSection>
    </PageContent>
  );
}

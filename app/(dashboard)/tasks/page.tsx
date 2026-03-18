import { NewTaskForm } from "@/app/components/tasks/NewTaskForm";
import { TaskList } from "@/app/components/tasks/TaskList";
import { Task } from "@/app/components/tasks/types";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { PageContent } from "@/app/components/ui/PageContent";
import { PageHeader } from "@/app/components/ui/PageHeader";

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

  if (tasksError) {
    throw new Error(`Nepodařilo se načíst úkoly: ${tasksError.message}`);
  }

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
  const completionRate =
    tasks.length === 0
      ? 0
      : Math.round((doneTasks.length / tasks.length) * 100);

  return (
    <PageContent>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <PageHeader title="Úkoly" />
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid items-start gap-6 lg:grid-cols-2">
            <section className="self-start rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Čeká
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {pendingTasks.length}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Aktivní úkoly, které je potřeba vyřešit.
                  </p>
                </div>

                <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  Otevřené
                </span>
              </div>

              <TaskList tasks={pendingTasks} canManageTasks={canManage} />
            </section>

            <section className="self-start rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    Hotovo
                  </p>
                  <p className="mt-2 text-3xl font-semibold text-stone-900">
                    {doneTasks.length}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    Dokončené úkoly a hotové práce.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Uzavřené
                </span>
              </div>

              <TaskList tasks={doneTasks} canManageTasks={canManage} />
            </section>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Přehled
                </p>
                <h2 className="text-lg font-semibold text-stone-900">
                  Stav úkolů
                </h2>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                    Celkem
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">
                    {tasks.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                    Čeká
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">
                    {pendingTasks.length}
                  </p>
                </div>

                <div className="rounded-2xl bg-stone-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">
                    Hotovo
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-900">
                    {completionRate} %
                  </p>
                </div>
              </div>
            </section>

            {canManage && <NewTaskForm id="new-task-form" />}
          </aside>
        </div>
      </div>
    </PageContent>
  );
}

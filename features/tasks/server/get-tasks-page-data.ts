import { isTaskOverdue, mapTaskRowToTask } from "@/features/tasks/lib/utils";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { createClient } from "@/lib/supabase/server";

export async function getTasksPageData() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const canManage = isAdminRole(profile.role);

  const { data, error } = await supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      status,
      priority,
      category,
      author_id,
      assignee_id,
      visit_id,
      due_date,
      created_at,
      updated_at,
      completed_at,
      author:profiles!tasks_author_id_fkey (
        display_name
      ),
      assignee:profiles!tasks_assignee_id_fkey (
        display_name
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Nepodařilo se načíst úkoly: ${error.message}`);
  }

  const tasks = (data ?? []).map(mapTaskRowToTask);

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const recentDoneTasks = doneTasks.slice(0, 5);
  const overdueTasks = pendingTasks.filter((task) =>
    isTaskOverdue(task.dueDate, task.status)
  );

  return {
    canManage,
    tasks,
    pendingTasks,
    recentDoneTasks,
    totalCount: tasks.length,
    pendingCount: pendingTasks.length,
    doneCount: doneTasks.length,
    overdueCount: overdueTasks.length,
    completionRate:
      tasks.length === 0
        ? 0
        : Math.round((doneTasks.length / tasks.length) * 100),
  };
}

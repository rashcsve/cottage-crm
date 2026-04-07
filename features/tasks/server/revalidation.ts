import { revalidatePath } from "next/cache";

const TASKS_PATH = "/tasks";
const DASHBOARD_PATH = "/";

export function revalidateTaskPaths() {
  revalidatePath(TASKS_PATH);
  revalidatePath(DASHBOARD_PATH);
}

import { revalidateLocalizedPath } from "@/i18n/revalidation";

const TASKS_PATH = "/tasks";

export function revalidateTaskPaths() {
  revalidateLocalizedPath(TASKS_PATH);
}

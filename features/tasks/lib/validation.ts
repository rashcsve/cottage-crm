import { TaskCategory, TaskPriority } from "@/features/tasks/types/task.types";

export function getPriority(formData: FormData): TaskPriority {
  const value = String(formData.get("priority") ?? "").trim();

  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

export function getCategory(formData: FormData): TaskCategory | null {
  const value = String(formData.get("category") ?? "").trim();

  if (
    value === "inside" ||
    value === "outside" ||
    value === "maintenance" ||
    value === "shopping" ||
    value === "cleaning" ||
    value === "other"
  ) {
    return value;
  }

  return null;
}


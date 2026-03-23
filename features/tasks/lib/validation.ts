import { TaskPriority } from "@/features/tasks/types/task.types";

export function getPriority(formData: FormData): TaskPriority {
  const value = String(formData.get("priority") ?? "").trim();

  if (value === "low" || value === "medium" || value === "high") {
    return value;
  }

  return "medium";
}

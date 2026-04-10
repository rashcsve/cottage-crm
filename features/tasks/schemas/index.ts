import { z } from "zod";
import type { TaskFilter } from "@/features/tasks/types/tasks";

export const TaskStatusSchema = z.enum(["pending", "done"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskIdSchema = z.number().int().positive();
export const TaskFilterSchema = z
  .enum(["open", "pending", "overdue", "done"])
  .transform(
    (value): TaskFilter => (value === "done" ? "done" : "open")
  );

export interface CreateTaskSchemaMessages {
  titleRequired: string;
  titleMin: string;
  titleMax: string;
  descriptionMax: string;
  invalidDate: string;
}

export function createTaskSchema(messages: CreateTaskSchemaMessages) {
  return z.object({
    title: z
      .string()
      .trim()
      .min(1, messages.titleRequired)
      .min(3, messages.titleMin)
      .max(255, messages.titleMax),
    description: z
      .string()
      .max(1000, messages.descriptionMax)
      .optional()
      .default(""),
    priority: TaskPrioritySchema.default("medium"),
    dueDate: z.preprocess(
      (value) => (value === "" ? undefined : value),
      z.iso.date(messages.invalidDate).optional()
    ),
  });
}

type CreateTaskSchemaType = ReturnType<typeof createTaskSchema>;

export type CreateTaskFormInput = z.input<CreateTaskSchemaType>;
export type CreateTaskFormData = z.output<CreateTaskSchemaType>;

export const ToggleTaskSchema = z.object({
  taskId: TaskIdSchema,
});

export const DeleteTaskSchema = z.object({
  taskId: TaskIdSchema,
});

export type ToggleTaskInput = z.infer<typeof ToggleTaskSchema>;
export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>;

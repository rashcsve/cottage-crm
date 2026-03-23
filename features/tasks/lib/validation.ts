import { z } from "zod";

export const TaskStatusSchema = z.enum(["pending", "done"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);

export const CreateTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).optional().nullable(),
  priority: TaskPrioritySchema.default("medium"),
  dueDate: z.string().date().optional().nullable(),
});

export const ToggleTaskSchema = z.object({
  taskId: z.number().int().positive(),
  currentStatus: TaskStatusSchema,
});

export const DeleteTaskSchema = z.object({
  taskId: z.number().int().positive(),
});

export type CreateTaskInput = z.infer<typeof CreateTaskSchema>;
export type ToggleTaskInput = z.infer<typeof ToggleTaskSchema>;
export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>;

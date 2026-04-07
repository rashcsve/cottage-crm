import { z } from "zod";

export const TaskStatusSchema = z.enum(["pending", "done"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);
export const TaskIdSchema = z.number().int().positive();
export const TaskFilterSchema = z.enum(["pending", "overdue", "done"]);

export const CreateTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Název úkolu je povinný")
    .min(3, "Název musí mít alespoň 3 znaky")
    .max(255, "Název nesmí překročit 255 znaků"),
  description: z
    .string()
    .max(1000, "Popis nesmí překročit 1000 znaků")
    .optional()
    .default(""),
  priority: TaskPrioritySchema.default("medium"),
  dueDate: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.iso.date("Neplatný formát data").optional()
  ),
});

export type CreateTaskFormInput = z.input<typeof CreateTaskSchema>;
export type CreateTaskFormData = z.output<typeof CreateTaskSchema>;

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export const ToggleTaskSchema = z.object({
  taskId: TaskIdSchema,
});

export const DeleteTaskSchema = z.object({
  taskId: TaskIdSchema,
});

export type ToggleTaskInput = z.infer<typeof ToggleTaskSchema>;
export type DeleteTaskInput = z.infer<typeof DeleteTaskSchema>;

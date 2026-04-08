import { z } from "zod";

export const createNoteSchema = z.object({
  title: z.string().min(1, "Title required").max(255),
  content: z.string().max(10000),
});

export const updateNoteSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(255).optional(),
  content: z.string().max(10000).optional(),
  is_archived: z.boolean().optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

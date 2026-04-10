import { z } from "zod";

export const NoteIdSchema = z.number().int().positive();

export const createNoteSchema = (messages: {
  contentRequired: string;
  contentMax: string;
}) =>
  z.object({
    content: z
      .string()
      .trim()
      .min(1, messages.contentRequired)
      .max(5000, messages.contentMax),
  });

export type CreateNoteFormInput = z.infer<ReturnType<typeof createNoteSchema>>;
export type CreateNoteFormData = CreateNoteFormInput;

export const DeleteNoteSchema = z.object({
  noteId: NoteIdSchema,
});

export type DeleteNoteInput = z.infer<typeof DeleteNoteSchema>;

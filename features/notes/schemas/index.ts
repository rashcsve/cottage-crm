import { z } from "zod";
import type { NotesShowFilter } from "@/features/notes/types/notes";

export const NoteIdSchema = z.number().int().positive();

export const NotesShowFilterSchema = z.enum(["all", "photos", "mine"]);

export function parseNotesSearchParams(searchParams: { show?: unknown }): {
  activeShow: NotesShowFilter;
} {
  return {
    activeShow: NotesShowFilterSchema.catch("all").parse(searchParams.show),
  };
}

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

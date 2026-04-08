import { z } from "zod";

export const createNoteSchema = (messages: {
  contentRequired: string;
  contentMax: string;
}) =>
  z.object({
    content: z
      .string()
      .min(1, messages.contentRequired)
      .max(5000, messages.contentMax),
  });

export type CreateNoteFormInput = z.infer<ReturnType<typeof createNoteSchema>>;
export type CreateNoteFormData = CreateNoteFormInput;

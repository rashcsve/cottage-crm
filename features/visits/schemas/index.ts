import { z } from "zod";

export const DeleteVisitSchema = z.object({
  visitId: z.number().int().positive(),
});

export interface CreateVisitSchemaMessages {
  visitorNameRequired: string;
  visitorNameTooLong: string;
  dateFromInvalid: string;
  dateToInvalid: string;
  noteTooLong: string;
}

export function createVisitSchema(messages: CreateVisitSchemaMessages) {
  return z.object({
    visitorName: z
      .string()
      .trim()
      .min(1, messages.visitorNameRequired)
      .max(255, messages.visitorNameTooLong),
    dateFrom: z.iso.date(messages.dateFromInvalid),
    dateTo: z.iso.date(messages.dateToInvalid),
    note: z.string().max(1000, messages.noteTooLong).nullable().optional(),
  });
}

type CreateVisitSchemaType = ReturnType<typeof createVisitSchema>;

export type CreateVisitFormInput = z.input<CreateVisitSchemaType>;
export type CreateVisitFormData = z.output<CreateVisitSchemaType>;

export type DeleteVisitInput = z.infer<typeof DeleteVisitSchema>;

export const visitSchema = z.object({
  id: z.number().int().positive(),
  visitorName: z.string(),
  dateFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dateTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["past", "upcoming", "current"]),
  note: z.string().nullable(),
  author: z.string(),
  authorId: z.string(),
  createdAt: z.string(),
});

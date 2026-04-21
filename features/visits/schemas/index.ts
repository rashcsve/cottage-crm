import { z } from "zod";

export const DeleteVisitSchema = z.object({
  visitId: z.number().int().positive(),
});

export interface CreateVisitSchemaMessages {
  visitorNameRequired: string;
  visitorNameTooLong: string;
  dateFromInvalid: string;
  dateToInvalid: string;
  dateRangeInvalid: string;
  noteTooLong: string;
}

export function createVisitSchema(messages: CreateVisitSchemaMessages) {
  const dateOnlySchema = z.iso.date();

  return z
    .object({
      visitorName: z
        .string()
        .trim()
        .min(1, messages.visitorNameRequired)
        .max(255, messages.visitorNameTooLong),
      dateFrom: z.iso.date(messages.dateFromInvalid),
      dateTo: z.iso.date(messages.dateToInvalid),
      note: z.string().max(1000, messages.noteTooLong).nullable().optional(),
    })
    .superRefine((data, ctx) => {
      const hasValidDates =
        dateOnlySchema.safeParse(data.dateFrom).success &&
        dateOnlySchema.safeParse(data.dateTo).success;

      if (!hasValidDates || data.dateFrom <= data.dateTo) {
        return;
      }

      ctx.addIssue({
        code: "custom",
        path: ["dateTo"],
        message: messages.dateRangeInvalid,
      });
    });
}

type CreateVisitSchemaType = ReturnType<typeof createVisitSchema>;

export type CreateVisitFormInput = z.input<CreateVisitSchemaType>;
export type CreateVisitFormData = z.output<CreateVisitSchemaType>;

export type DeleteVisitInput = z.infer<typeof DeleteVisitSchema>;

import { z } from "zod";

export const createShoppingItemSchema = (messages: Record<string, string>) =>
  z.object({
    title: z
      .string()
      .min(1, messages.titleRequired)
      .max(100, messages.titleMaxLength),
  });

export type CreateShoppingItemFormInput = z.infer<
  ReturnType<typeof createShoppingItemSchema>
>;

export type CreateShoppingItemFormData = CreateShoppingItemFormInput;

export const updateShoppingItemSchema = z.object({
  id: z.number().positive(),
  is_checked: z.boolean(),
});

export type UpdateShoppingItemFormInput = z.infer<
  typeof updateShoppingItemSchema
>;

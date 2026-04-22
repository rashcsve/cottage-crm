import { z } from "zod";
import type { ShoppingFilter } from "@/features/shopping/types/shopping";

export const ShoppingItemIdSchema = z.number().int().positive();
export const ShoppingFilterSchema = z
  .enum(["pending", "purchased"])
  .transform((value): ShoppingFilter => value);

export const createShoppingItemSchema = (messages: Record<string, string>) =>
  z.object({
    title: z
      .string()
      .trim()
      .min(1, messages.titleRequired)
      .max(100, messages.titleMaxLength),
  });

export type CreateShoppingItemFormInput = z.infer<
  ReturnType<typeof createShoppingItemSchema>
>;

export type CreateShoppingItemFormData = CreateShoppingItemFormInput;

export const ToggleShoppingItemSchema = z.object({
  itemId: ShoppingItemIdSchema,
  isChecked: z.boolean(),
});

export const DeleteShoppingItemSchema = z.object({
  itemId: ShoppingItemIdSchema,
});

export type ToggleShoppingItemInput = z.infer<typeof ToggleShoppingItemSchema>;
export type DeleteShoppingItemInput = z.infer<typeof DeleteShoppingItemSchema>;

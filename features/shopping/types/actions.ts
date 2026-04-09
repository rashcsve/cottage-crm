import type { ActionResult } from "@/lib/types/actions.types";

export type CreateShoppingItemResult = ActionResult<{ id: number }>;
export type UpdateShoppingItemResult = ActionResult<void>;
export type DeleteShoppingItemResult = ActionResult<void>;

import { ActionResult } from "@/lib/types/actions.types";

export type CreateTaskResult = ActionResult<{ id: number }>;
export type ToggleTaskResult = ActionResult<void>;
export type DeleteTaskResult = ActionResult<void>;

import { ActionResult } from "@/lib/types/action-state";

export type CreateTaskResult = ActionResult<{ id: number }>;
export type ToggleTaskResult = ActionResult<void>;
export type DeleteTaskResult = ActionResult<void>;

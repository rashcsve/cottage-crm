import type { ActionResult } from "@/lib/types/actions.types";

export type CreateNoteResult = ActionResult<{ id: number }>;
export type DeleteNoteResult = ActionResult<void>;

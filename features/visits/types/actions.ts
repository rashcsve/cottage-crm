import type { ActionResult } from "@/lib/types/actions.types";
import type { Visit } from "./visits";

export type CreateVisitResult = ActionResult<Visit>;
export type DeleteVisitResult = ActionResult<void>;

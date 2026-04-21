import type { VisitStatus } from "../../../types/visits";

export const VISIT_STATUS_TONE_CLASS: Record<VisitStatus, string> = {
  current:  "border-emerald-200 bg-emerald-50 text-emerald-800",
  upcoming: "border-amber-200 bg-amber-50 text-amber-800",
  past:     "border-stone-200 bg-stone-100 text-stone-700",
};

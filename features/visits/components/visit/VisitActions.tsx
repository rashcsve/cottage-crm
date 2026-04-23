import { Trash2 } from "lucide-react";
import type { Visit } from "../../types/visits";

interface VisitActionsProps {
  visit: Visit;
  onDelete: (visit: Visit) => void;
  deleteAriaLabel: string;
  size?: "default" | "compact";
}

export function VisitActions({
  visit,
  onDelete,
  deleteAriaLabel,
  size = "default",
}: VisitActionsProps) {
  const sizeClassName =
    size === "compact" ? "h-8 w-8 rounded-lg" : "h-10 w-10 rounded-xl";

  return (
    <button
      type="button"
      onClick={() => onDelete(visit)}
      className={`inline-flex cursor-pointer items-center justify-center border border-stone-200 bg-white text-stone-500 shadow-sm transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${sizeClassName}`}
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}

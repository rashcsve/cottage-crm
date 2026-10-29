import { Trash2 } from "lucide-react";
import type { Visit } from "../../types/visits";
import { IconButton } from "@/shared/ui/IconButton";

interface VisitActionsProps {
  visit: Visit;
  onDelete: (visit: Visit) => void;
  deleteAriaLabel: string;
  size?: "default" | "strip";
}

const STRIP_BUTTON_CLASS =
  "inline-flex h-full w-10 shrink-0 items-center justify-center text-ink-secondary transition-colors hover:text-ink-primary focus-visible:-outline-offset-2";

export function VisitActions({
  visit,
  onDelete,
  deleteAriaLabel,
  size = "default",
}: VisitActionsProps) {
  if (size === "strip") {
    return (
      <button
        type="button"
        onClick={() => onDelete(visit)}
        aria-label={deleteAriaLabel}
        className={STRIP_BUTTON_CLASS}
      >
        <Trash2 className="size-3.5" aria-hidden="true" />
      </button>
    );
  }

  return (
    <IconButton
      type="button"
      onClick={() => onDelete(visit)}
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}

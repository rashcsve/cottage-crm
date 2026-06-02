import { Trash2 } from "lucide-react";
import type { Visit } from "../../types/visits";
import { IconButton } from "@/shared/ui/IconButton";

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
  return (
    <IconButton
      type="button"
      size={size}
      onClick={() => onDelete(visit)}
      aria-label={deleteAriaLabel}
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </IconButton>
  );
}

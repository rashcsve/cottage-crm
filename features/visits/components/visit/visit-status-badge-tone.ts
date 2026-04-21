import type { StatusBadgeTone } from "@/shared/ui/StatusBadge";
import type { VisitStatus } from "../../types/visits";

export function getVisitStatusBadgeTone(status: VisitStatus): StatusBadgeTone {
  switch (status) {
    case "current":
      return "success";
    case "upcoming":
      return "warning";
    case "past":
      return "neutral";
  }
}

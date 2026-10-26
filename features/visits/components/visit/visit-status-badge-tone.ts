import {
  CalendarClock,
  History,
  LogIn,
  type LucideIcon,
} from "lucide-react";
import type { StatusLabelTone } from "@/shared/ui/StatusLabel";
import type { VisitStatus } from "../../types/visits";

export interface VisitStatusTone {
  tone: StatusLabelTone;
  icon: LucideIcon;
}

const VISIT_STATUS_TONE: Record<VisitStatus, VisitStatusTone> = {
  current: { tone: "success", icon: LogIn },
  upcoming: { tone: "neutral", icon: CalendarClock },
  past: { tone: "neutral", icon: History },
};

export function getVisitStatusTone(status: VisitStatus): VisitStatusTone {
  return VISIT_STATUS_TONE[status];
}

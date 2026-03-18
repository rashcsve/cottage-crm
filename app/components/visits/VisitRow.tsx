import { StatusBadge } from "../ui/StatusBadge";
import { Surface } from "../ui/Surface";
import { Visit } from "./types";
import { formatDateRange, getVisitStatus, VISIT_STATUS_META } from "./utils";
import { VisitActions } from "./VisitActions";

interface VisitRowProps {
  visit: Visit;
  canManageVisits: boolean;
}

export function VisitRow({ visit, canManageVisits }: VisitRowProps) {
  const status = getVisitStatus(visit.date_from, visit.date_to);
  const statusMeta = VISIT_STATUS_META[status];

  return (
    <Surface className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-medium text-stone-900">
            {visit.visitor_name}
          </p>

          <p className="mt-1 text-sm text-stone-500">
            {formatDateRange(visit.date_from, visit.date_to)}
          </p>

          {visit.note && (
            <p className="mt-2 text-sm text-stone-700">{visit.note}</p>
          )}

          <p className="mt-2 text-xs text-stone-500">
            Přidal(a): {visit.author}
          </p>

          {canManageVisits && <VisitActions visitId={visit.id} />}
        </div>

        <div className="shrink-0">
          <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
        </div>
      </div>
    </Surface>
  );
}

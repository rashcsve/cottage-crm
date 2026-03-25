import { InlineActions } from "@/shared/ui/InlineActions";
import { ListRow } from "@/shared/ui/ListRow";
import { MetaText } from "@/shared/ui/MetaText";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { Visit } from "@/app/components/visits/types";
import {
  formatDateRange,
  getVisitStatus,
  VISIT_STATUS_META,
} from "@/app/components/visits/utils";
import { VisitActions } from "@/app/components/visits/VisitActions";

interface VisitRowProps {
  visit: Visit;
  canManageVisits: boolean;
}

export function VisitRow({ visit, canManageVisits }: VisitRowProps) {
  const status = getVisitStatus(visit.date_from, visit.date_to);
  const statusMeta = VISIT_STATUS_META[status];

  return (
    <ListRow>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-medium text-stone-900">
            {visit.visitor_name}
          </p>

          <MetaText>{formatDateRange(visit.date_from, visit.date_to)}</MetaText>

          {visit.note && (
            <p className="mt-2 text-sm text-stone-700">{visit.note}</p>
          )}

          <MetaText>Přidal(a): {visit.author}</MetaText>

          {canManageVisits && (
            <InlineActions className="mt-2">
              <VisitActions visitId={visit.id} />
            </InlineActions>
          )}
        </div>

        <div className="shrink-0">
          <StatusBadge tone={statusMeta.tone}>{statusMeta.label}</StatusBadge>
        </div>
      </div>
    </ListRow>
  );
}

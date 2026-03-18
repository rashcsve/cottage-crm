import { Visit } from "./types";
import { VisitRow } from "./VisitRow";

interface VisitsListProps {
  visits: Visit[];
  emptyMessage: string;
  canManageVisits: boolean;
}

export function VisitsList({
  visits,
  emptyMessage,
  canManageVisits,
}: VisitsListProps) {
  if (visits.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-stone-200 bg-stone-50 px-4 py-6 text-sm text-stone-500">
        {emptyMessage}
      </div>
    );
  }

  return (
    <section className="space-y-3">
      {visits.map((visit) => (
        <VisitRow
          visit={visit}
          key={visit.id}
          canManageVisits={canManageVisits}
        />
      ))}
    </section>
  );
}

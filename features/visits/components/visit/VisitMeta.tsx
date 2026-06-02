import type { Visit } from "../../types/visits";

interface VisitMetaProps {
  visit: Visit;
  addedByLabel: string;
  compact?: boolean;
}

export function VisitMeta({
  visit,
  addedByLabel,
  compact = false,
}: VisitMetaProps) {
  if (compact) {
    return (
      <div className="min-w-0 space-y-0.5" title={`${addedByLabel}: ${visit.author}`}>
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-500">
          {addedByLabel}
        </p>
        <p className="break-words text-[11px] font-medium leading-4 text-stone-700">
          {visit.author}
        </p>
      </div>
    );
  }

  return (
    <p
      className="text-xs text-stone-400"
      title={`${addedByLabel}: ${visit.author}`}
    >
      {addedByLabel}: {visit.author}
    </p>
  );
}

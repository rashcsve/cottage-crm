import type { Visit } from "../types/visits";

interface VisitMetaProps {
  visit: Visit;
  addedByLabel: string;
}

export function VisitMeta({ visit, addedByLabel }: VisitMetaProps) {
  return (
    <p className="text-xs text-stone-400">
      {addedByLabel}: {visit.author}
    </p>
  );
}

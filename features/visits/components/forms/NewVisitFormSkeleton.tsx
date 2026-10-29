import { AddItemPanelFooter } from "@/shared/ui/AddItemPanel";
import { Skeleton } from "@/shared/ui/Skeleton";

interface NewVisitFormSkeletonProps {
  coupleCount: number;
  hasSelectedRange: boolean;
}

function FieldSkeleton({ inputClassName = "h-11" }: { inputClassName?: string }) {
  return (
    <div>
      <Skeleton className="mb-2 h-5 w-24" />
      <Skeleton className={inputClassName} />
    </div>
  );
}

export function NewVisitFormSkeleton({
  coupleCount,
  hasSelectedRange,
}: NewVisitFormSkeletonProps) {
  return (
    <div className="space-y-4" aria-hidden="true">
      {hasSelectedRange ? <Skeleton className="h-11 rounded-card" /> : null}

      <div className="space-y-3">
        <div>
          <Skeleton className="mb-2 h-5 w-20" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: Math.max(coupleCount, 1) }, (_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <FieldSkeleton />
          <FieldSkeleton />
        </div>

        <div>
          <FieldSkeleton inputClassName="min-h-22" />
          <Skeleton className="mt-1 ml-auto h-4 w-16" />
        </div>

        <Skeleton className="h-5 w-3/4" />

        <AddItemPanelFooter>
          <Skeleton className="h-11 w-full sm:w-32" />
        </AddItemPanelFooter>
      </div>
    </div>
  );
}

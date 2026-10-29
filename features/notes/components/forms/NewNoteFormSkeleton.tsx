import { AddItemPanelFooter } from "@/shared/ui/AddItemPanel";
import { Skeleton } from "@/shared/ui/Skeleton";

export function NewNoteFormSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="space-y-1">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
      </div>

      <div className="space-y-3">
        <div>
          <Skeleton className="mb-2 h-5 w-24" />
          <Skeleton className="h-36" />
          <Skeleton className="mt-2 ml-auto h-5 w-16" />
        </div>

        <div>
          <Skeleton className="mb-2 h-5 w-20" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="mt-3 h-11 w-36" />
        </div>

        <AddItemPanelFooter>
          <Skeleton className="h-11 w-full sm:w-32" />
        </AddItemPanelFooter>
      </div>
    </div>
  );
}

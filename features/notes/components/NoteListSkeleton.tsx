import { RowList, RowListItem } from "@/shared/ui/RowList";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function NoteListSkeleton() {
  return (
    <Surface className="px-4 lg:px-6" aria-hidden="true">
      <RowList>
        {Array.from({ length: 3 }).map((_, index) => (
          <RowListItem key={index} className="items-start">
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-2 md:grid-cols-[150px_minmax(0,1fr)_auto] md:gap-x-6">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="col-start-2 row-start-1 h-4 w-24 md:col-start-3" />
              <div className="col-span-2 space-y-2 md:col-span-1 md:col-start-2 md:row-start-1">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </RowListItem>
        ))}
      </RowList>
    </Surface>
  );
}

import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function ShoppingListSkeleton() {
  return (
    <Surface className="px-4 lg:px-6">
      <ul className="divide-y divide-border" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-center gap-1.5 py-1 sm:gap-3 sm:py-3">
            <Skeleton className="size-11 shrink-0" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-24 sm:h-3.5 sm:w-28" />
            </div>
          </li>
        ))}
      </ul>
    </Surface>
  );
}

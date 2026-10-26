import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function TaskListSkeleton() {
  return (
    <Surface className="px-4 lg:px-6">
      <ul className="divide-y divide-border" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="flex items-start gap-3 py-3">
            <Skeleton className="size-11 shrink-0" />

            <div className="min-w-0 flex-1 space-y-2 pt-2.5">
              <Skeleton className="h-4 w-40" />
              <div className="flex flex-wrap gap-3.5">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-20" />
                <Skeleton className="h-3.5 w-16" />
              </div>
              <Skeleton className="h-3.5 w-5/6" />
            </div>

            <Skeleton className="size-11 shrink-0" />
          </li>
        ))}
      </ul>
    </Surface>
  );
}

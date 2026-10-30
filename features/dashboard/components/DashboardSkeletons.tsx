import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function PresenceSkeleton() {
  return (
    <div className="animate-skeleton-appear space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-9 w-64 max-w-full" />
      </div>
      <Skeleton className="h-12 w-full" />
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <Surface padding="default" className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-28" />
      <Skeleton className="h-10 w-full" />
    </Surface>
  );
}

const PREVIEW_SKELETON_ROWS = [3, 1, 2];

export function PreviewSectionSkeleton() {
  return (
    <Surface className="animate-skeleton-appear divide-y divide-border px-4 lg:px-6">
      {PREVIEW_SKELETON_ROWS.map((rows, group) => (
        <div key={group} className="space-y-3 py-4">
          <Skeleton className="h-5 w-32" />
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ))}
    </Surface>
  );
}

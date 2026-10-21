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

function PreviewSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-36" />
      <Surface padding="default" className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Surface>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="animate-skeleton-appear space-y-7 lg:space-y-6">
      <div className="grid gap-3 border-t border-ink-primary pt-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
      <div className="grid gap-7 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        <div className="md:col-span-2 xl:col-span-1">
          <PreviewSkeleton />
        </div>
        <PreviewSkeleton />
        <PreviewSkeleton />
      </div>
    </div>
  );
}

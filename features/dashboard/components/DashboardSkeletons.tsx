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

function PreviewSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-11 w-36" />
      <Surface padding="default" className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </Surface>
    </div>
  );
}

export function PreviewSectionSkeleton() {
  return (
    <div className="animate-skeleton-appear space-y-7 lg:space-y-9">
      <div className="grid gap-7 md:grid-cols-[repeat(auto-fit,minmax(17.5rem,1fr))] lg:gap-6">
        <PreviewSkeleton rows={3} />
        <PreviewSkeleton rows={3} />
      </div>
      <PreviewSkeleton rows={2} />
    </div>
  );
}

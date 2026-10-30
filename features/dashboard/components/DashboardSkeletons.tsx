import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function PresenceSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-8 w-64 max-w-full lg:h-9" />
      <Skeleton className="hidden h-9 w-48 max-w-full lg:block" />
      <Skeleton className="h-5 w-56 max-w-full" />
    </div>
  );
}

export function WeatherSkeleton() {
  return (
    <Surface className="px-4 py-3 lg:p-6">
      <div className="flex items-center gap-3 lg:hidden">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="hidden space-y-4 lg:block">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-28" />
        <Skeleton className="h-10 w-full" />
      </div>
    </Surface>
  );
}

const GROUP_CLASS = "border-t border-border pt-3 pb-1 first:border-t-0";
const TASK_SKELETON_WIDTHS = ["w-3/4", "w-1/2", "w-2/3"];
const TAG_SKELETON_WIDTHS = ["w-20", "w-16", "w-24"];
const NOTE_SKELETON_ROWS = 2;

function PreviewGroupHeaderSkeleton() {
  return (
    <div className="flex items-center gap-2">
      <Skeleton className="h-6 w-28" />
      <Skeleton className="ml-auto h-5 w-10" />
    </div>
  );
}

export function PreviewSectionSkeleton() {
  return (
    <Surface className="px-4 lg:px-6">
      <div className={GROUP_CLASS}>
        <PreviewGroupHeaderSkeleton />
        {TASK_SKELETON_WIDTHS.map((width) => (
          <div key={width} className="flex min-h-12 items-center py-2">
            <Skeleton className={`h-5 ${width}`} />
          </div>
        ))}
      </div>

      <div className={GROUP_CLASS}>
        <PreviewGroupHeaderSkeleton />
        <div className="flex gap-1.5 overflow-hidden pt-1 pb-3">
          {TAG_SKELETON_WIDTHS.map((width) => (
            <Skeleton key={width} className={`h-7 shrink-0 rounded-full ${width}`} />
          ))}
        </div>
      </div>

      <div className={GROUP_CLASS}>
        <PreviewGroupHeaderSkeleton />
        {Array.from({ length: NOTE_SKELETON_ROWS }).map((_, i) => (
          <div key={i} className="flex min-h-12 items-start gap-3 py-3">
            <Skeleton className="size-7 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    </Surface>
  );
}

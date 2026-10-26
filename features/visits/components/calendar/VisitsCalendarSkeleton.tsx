import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function VisitsCalendarSkeleton() {
  return (
    <div className="space-y-6" aria-hidden="true">
      <div className="flex flex-col gap-4 lg:flex-row-reverse lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-8 lg:gap-y-3">
        <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:justify-between sm:gap-x-6">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-5 w-48" />
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="size-11" />
            <Skeleton className="h-11 w-20" />
            <Skeleton className="size-11" />
          </div>

          <div className="order-first flex gap-x-6 border-b border-border pb-2 lg:order-none">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-7 w-16" />
          </div>
        </div>
      </div>

      <div className="space-y-6 xl:grid xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:gap-6 xl:space-y-0">
        <div className="lg:flex lg:min-h-[calc(100dvh-17.75rem)] lg:flex-col">
          <Surface className="overflow-hidden lg:flex lg:flex-1 lg:flex-col">
            <div className="grid grid-cols-7 border-b border-border">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="px-2 py-3 sm:px-3 lg:py-2">
                  <Skeleton className="mx-auto h-3 w-8" />
                </div>
              ))}
            </div>

            {Array.from({ length: 5 }).map((_, weekIndex) => (
              <div
                key={weekIndex}
                className="grid grid-cols-7 border-b border-border last:border-b-0 lg:flex-1"
              >
                {Array.from({ length: 7 }).map((_, dayIndex) => (
                  <div
                    key={dayIndex}
                    className="min-h-19 border-r border-border px-1.5 py-1.5 last:border-r-0 sm:min-h-25 sm:px-2.5 sm:py-2 lg:min-h-22 lg:py-1.5"
                  >
                    <Skeleton className="size-6 sm:size-8 lg:size-7" />
                    <Skeleton className="mt-2 h-5 w-full lg:mt-1" />
                  </div>
                ))}
              </div>
            ))}
          </Surface>
        </div>

        <Surface className="space-y-3 p-4 sm:p-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-5 w-full max-w-xs" />
          <Skeleton className="h-11 w-full sm:w-40" />
        </Surface>
      </div>
    </div>
  );
}

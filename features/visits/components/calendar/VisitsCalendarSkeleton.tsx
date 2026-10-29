import { Skeleton } from "@/shared/ui/Skeleton";
import { Surface } from "@/shared/ui/Surface";

export function VisitsCalendarSkeleton() {
  return (
    <div className="space-y-3 lg:space-y-6" aria-hidden="true">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2 gap-y-2 lg:hidden">
        <div className="col-span-2 flex min-w-0 flex-wrap gap-x-4 border-b border-border">
          {["w-14", "w-14", "w-16"].map((width, index) => (
            <div key={index} className="flex min-h-11 items-center px-1">
              <Skeleton className={`h-5 ${width}`} />
            </div>
          ))}
        </div>
        <Skeleton className="col-start-3 row-start-1 h-11 w-16" />

        <div className="col-span-3 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-2">
          <Skeleton className="size-11" />
          <Skeleton className="mx-auto h-7 w-40 max-w-full" />
          <Skeleton className="size-11" />
        </div>
      </div>

      <div className="hidden lg:flex lg:flex-row-reverse lg:flex-wrap lg:items-center lg:justify-between lg:gap-x-8 lg:gap-y-3">
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

      <div className="flex flex-col gap-3 lg:gap-6 xl:grid xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start">
        <div className="lg:flex lg:min-h-[calc(100dvh-15.75rem)] lg:flex-col">
          <Surface className="-mx-3.5 overflow-hidden sm:mx-0 lg:flex lg:flex-1 lg:flex-col">
            <div className="grid grid-cols-7 border-b border-border">
              {Array.from({ length: 7 }).map((_, index) => (
                <div key={index} className="px-2 py-2 sm:px-3">
                  <Skeleton className="mx-auto h-3 w-3 sm:w-8" />
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
                    className="min-h-11 border-border px-1.5 py-1.5 sm:px-2.5 sm:py-2 lg:min-h-22 lg:border-r lg:py-1.5 lg:last:border-r-0"
                  >
                    <Skeleton className="size-7 sm:size-8 lg:size-7" />
                    <Skeleton className="mt-1 h-5 w-full" />
                  </div>
                ))}
              </div>
            ))}
          </Surface>
        </div>

        <Surface>
          <div className="flex flex-col gap-3 p-4 lg:p-5">
            <div className="space-y-1 lg:space-y-2">
              <Skeleton className="hidden h-4 w-24 lg:block" />
              <Skeleton className="h-7 w-52 max-w-full" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="hidden h-5 w-full max-w-xs lg:block" />
            <Skeleton className="hidden h-11 w-40 lg:block" />
          </div>
          <div className="border-t border-border px-4 py-5 lg:hidden">
            <Skeleton className="h-5 w-full max-w-xs" />
          </div>
        </Surface>
      </div>
    </div>
  );
}

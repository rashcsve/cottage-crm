"use client";

export function TaskListSkeleton() {
  return (
    <ul className="rounded-2xl border border-stone-200 bg-white">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="group border-b border-stone-200 last:border-b-0">
          <div className="flex gap-3 px-4 py-4 sm:px-5">
            {/* Checkbox skeleton */}
            <div className="shrink-0 pt-0.5">
              <div className="h-8 w-8 rounded-xl border border-stone-200 bg-stone-100 animate-pulse" />
            </div>

            {/* Content skeleton */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  {/* Title skeleton */}
                  <div className="h-5 bg-stone-100 rounded-lg w-3/4 animate-pulse" />

                  {/* Description skeleton */}
                  <div className="mt-3 space-y-2">
                    <div className="h-4 bg-stone-100 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-stone-100 rounded-lg w-5/6 animate-pulse" />
                  </div>

                  {/* Metadata skeleton */}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <div className="h-4 bg-stone-100 rounded-full w-24 animate-pulse" />
                    <div className="h-4 bg-stone-100 rounded-full w-20 animate-pulse" />
                  </div>
                </div>

                {/* Actions skeleton */}
                <div className="flex items-start self-start">
                  <div className="h-8 w-8 rounded-xl border border-stone-200 bg-stone-100 animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

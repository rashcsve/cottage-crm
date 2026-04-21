function SkeletonBlock({ className }: { className: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-stone-100 ${className}`} />
  );
}

export function VisitsCalendarSkeleton() {
  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
        <div className="flex flex-col gap-5 p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <SkeletonBlock className="h-10 w-20" />
                <SkeletonBlock className="h-10 w-24" />
              </div>

              <div className="space-y-3">
                <SkeletonBlock className="h-9 w-48 sm:w-64" />

                <div className="flex flex-wrap gap-2">
                  <SkeletonBlock className="h-8 w-24" />
                  <SkeletonBlock className="h-8 w-24" />
                  <SkeletonBlock className="h-8 w-24" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <SkeletonBlock className="h-12 w-full sm:w-72" />
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
        <section className="overflow-hidden rounded-4xl border border-stone-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50/80">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="px-2 py-3 sm:px-3">
                <SkeletonBlock className="mx-auto h-3 w-8" />
              </div>
            ))}
          </div>

          {Array.from({ length: 5 }).map((_, weekIndex) => (
            <div
              key={weekIndex}
              className="grid grid-cols-7 border-b border-stone-200 last:border-b-0"
            >
              {Array.from({ length: 7 }).map((_, dayIndex) => (
                <div
                  key={dayIndex}
                  className="min-h-18 border-r border-stone-200 p-2 last:border-r-0 sm:min-h-21 sm:p-2.5"
                >
                  <div className="flex items-center justify-between">
                    <SkeletonBlock className="h-8 w-8 rounded-full" />
                    <SkeletonBlock className="h-5 w-6" />
                  </div>
                  <SkeletonBlock className="mt-2 h-4 w-full" />
                </div>
              ))}
            </div>
          ))}
        </section>

        <aside className="rounded-4xl border border-stone-200 bg-stone-50/70 p-5 shadow-sm">
          <div className="space-y-4">
            <div className="space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-8 w-52" />
              <SkeletonBlock className="h-4 w-full max-w-xs" />
            </div>

            <div className="space-y-3">
              <SkeletonBlock className="h-11 w-40" />
              <SkeletonBlock className="h-28 w-full" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

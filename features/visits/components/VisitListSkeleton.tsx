"use client";

export function VisitListSkeleton() {
  return (
    <ul className="rounded-2xl border border-stone-200 bg-white">
      {Array.from({ length: 4 }).map((_, i) => (
        <li key={i} className="border-b border-stone-200 last:border-b-0">
          <div className="flex gap-4 px-4 py-4 sm:px-5">
            <div className="min-w-0 flex-1">
              <div className="h-5 bg-stone-100 rounded-lg w-2/3 animate-pulse" />

              <div className="mt-3 space-y-2">
                <div className="h-4 bg-stone-100 rounded-lg w-full animate-pulse" />
                <div className="h-4 bg-stone-100 rounded-lg w-2/3 animate-pulse" />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="h-6 bg-stone-100 rounded-full w-20 animate-pulse" />
                <div className="h-6 bg-stone-100 rounded-full w-24 animate-pulse" />
              </div>
            </div>

            <div className="shrink-0">
              <div className="h-6 bg-stone-100 rounded-full w-24 animate-pulse" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

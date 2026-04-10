interface TaskListSkeletonProps {
  variant?: "card" | "plain";
}

export function TaskListSkeleton({
  variant = "card",
}: TaskListSkeletonProps) {
  return (
    <ul
      className={
        variant === "plain"
          ? "overflow-hidden"
          : "overflow-hidden rounded-2xl border border-stone-200 bg-white"
      }
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="group border-b border-stone-200 last:border-b-0">
          <div className="flex items-start gap-3 px-4 py-2.5 sm:px-5">
            <div className="shrink-0 pt-0.5 sm:pt-0">
              <div className="h-7 w-7 animate-pulse rounded-lg border border-stone-200 bg-stone-100" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-3/4 animate-pulse rounded-lg bg-stone-100" />

                  <div className="mt-1.5 space-y-1.5">
                    <div className="h-3.5 w-full animate-pulse rounded-lg bg-stone-100" />
                    <div className="h-3.5 w-5/6 animate-pulse rounded-lg bg-stone-100" />
                  </div>

                  <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
                    <div className="h-4.5 w-28 animate-pulse rounded-full bg-stone-100" />
                    <div className="h-3 w-16 animate-pulse rounded-lg bg-stone-100" />
                  </div>
                </div>

                <div className="ml-auto flex items-start self-start pt-0.5">
                  <div className="h-7 w-7 animate-pulse rounded-lg bg-stone-100" />
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

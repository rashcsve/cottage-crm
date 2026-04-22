interface TaskListSkeletonProps {
  variant?: "card" | "plain";
}

export function TaskListSkeleton({
  variant = "card",
}: TaskListSkeletonProps) {
  const listClassName =
    variant === "plain" ? "space-y-2.5 sm:space-y-3" : "space-y-2.5 sm:space-y-3";

  return (
    <ul className={listClassName}>
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="group">
          <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="shrink-0 pt-0.5 sm:pt-0">
                <div className="h-10 w-10 animate-pulse rounded-xl border border-stone-200 bg-stone-100" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="h-4 w-40 animate-pulse rounded-lg bg-stone-100" />
                      <div className="h-5 w-20 animate-pulse rounded-full bg-stone-100" />
                    </div>

                    <div className="mt-2 space-y-1.5">
                      <div className="h-3.5 w-full animate-pulse rounded-lg bg-stone-100" />
                      <div className="h-3.5 w-5/6 animate-pulse rounded-lg bg-stone-100" />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-2.5">
                      <div className="h-3.5 w-28 animate-pulse rounded-full bg-stone-100" />
                      <div className="h-3.5 w-24 animate-pulse rounded-full bg-stone-100" />
                    </div>
                  </div>

                  <div className="ml-auto flex items-start self-start pt-0.5">
                    <div className="h-10 w-10 animate-pulse rounded-xl bg-stone-100" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

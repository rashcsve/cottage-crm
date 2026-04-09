export function ShoppingListSkeleton() {
  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {Array.from({ length: 5 }).map((_, index) => (
        <li
          key={index}
          className="border-b border-stone-200 last:border-b-0"
        >
          <div className="flex gap-3 px-4 py-4 sm:px-5">
            <div className="shrink-0 pt-0.5">
              <div className="h-8 w-8 animate-pulse rounded-xl bg-stone-200" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />

                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                    <div className="h-4 w-20 animate-pulse rounded bg-stone-200" />
                    <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                  </div>
                </div>

                <div className="h-8 w-8 animate-pulse rounded-xl bg-stone-200" />
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

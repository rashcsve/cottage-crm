export function ShoppingListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="rounded-lg border border-stone-200 bg-white p-4 animate-pulse"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-5 w-3/4 bg-stone-200 rounded" />
              <div className="h-4 w-1/2 bg-stone-200 rounded" />
            </div>

            <div className="h-6 w-20 bg-stone-200 rounded-full shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}

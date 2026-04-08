export function NoteListSkeleton() {
  return (
    <ul className="overflow-hidden rounded-2xl border border-stone-200 bg-white">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="border-b border-stone-200 last:border-b-0">
          <div className="flex gap-3 px-4 py-4 sm:px-5">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="space-y-2">
                <div className="h-5 w-full animate-pulse rounded bg-stone-200" />
                <div className="h-5 w-3/4 animate-pulse rounded bg-stone-200" />
              </div>

              <div className="flex gap-2">
                <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
                <div className="h-4 w-24 animate-pulse rounded bg-stone-200" />
              </div>
            </div>

            <div className="h-8 w-8 shrink-0 animate-pulse rounded-xl bg-stone-200" />
          </div>
        </li>
      ))}
    </ul>
  );
}

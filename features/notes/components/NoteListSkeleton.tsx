export function NoteListSkeleton() {
  return (
    <ul className="space-y-2.5 sm:space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="group">
          <div className="rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="h-3.5 w-28 animate-pulse rounded-full bg-stone-100" />
                  <div className="h-3.5 w-32 animate-pulse rounded-full bg-stone-100" />
                </div>

                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-lg bg-stone-100" />
                  <div className="h-4 w-5/6 animate-pulse rounded-lg bg-stone-100" />
                  <div className="h-4 w-2/3 animate-pulse rounded-lg bg-stone-100" />
                </div>
              </div>

              <div className="h-10 w-10 shrink-0 animate-pulse rounded-xl bg-stone-100" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

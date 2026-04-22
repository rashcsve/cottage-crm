interface NoteListSkeletonProps {
  variant?: "card" | "plain";
}

export function NoteListSkeleton({
  variant = "card",
}: NoteListSkeletonProps) {
  return (
    <ul
      className={
        variant === "plain"
          ? "overflow-hidden"
          : "overflow-hidden rounded-2xl border border-stone-200 bg-white"
      }
    >
      {Array.from({ length: 3 }).map((_, index) => (
        <li key={index} className="group border-b border-stone-200 last:border-b-0">
          <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="h-3.5 w-28 animate-pulse rounded-full bg-stone-100" />
                <div className="h-3.5 w-32 animate-pulse rounded-full bg-stone-100" />
              </div>

              <div className="space-y-2">
                <div className="h-4.5 w-full animate-pulse rounded-lg bg-stone-100" />
                <div className="h-4.5 w-5/6 animate-pulse rounded-lg bg-stone-100" />
                <div className="h-4.5 w-2/3 animate-pulse rounded-lg bg-stone-100" />
              </div>
            </div>

            <div className="h-7 w-7 shrink-0 animate-pulse rounded-lg bg-stone-100" />
          </div>
        </li>
      ))}
    </ul>
  );
}

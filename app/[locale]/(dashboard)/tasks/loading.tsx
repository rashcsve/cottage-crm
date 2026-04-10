import { TaskListSkeleton } from "@/features/tasks/components/TaskListSkeleton";
import { Surface } from "@/shared/ui/Surface";
import { PageContent } from "@/shared/ui/page/PageContent";

export default function TasksLoading() {
  return (
    <PageContent className="space-y-6">
      <div className="space-y-3">
        <div className="h-10 w-48 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-stone-200" />
      </div>

      <div className="inline-flex rounded-2xl bg-stone-100 p-1">
        <div className="h-9 w-24 animate-pulse rounded-xl bg-white" />
        <div className="h-9 w-24 animate-pulse rounded-xl bg-stone-100" />
      </div>

      <Surface className="overflow-hidden">
        <div className="flex justify-start border-b border-stone-200 px-4 py-3 sm:justify-end sm:px-5">
          <div className="h-9 w-28 animate-pulse rounded-xl bg-stone-100" />
        </div>

        <TaskListSkeleton variant="plain" />
      </Surface>
    </PageContent>
  );
}

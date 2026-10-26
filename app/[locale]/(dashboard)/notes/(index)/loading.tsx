import { getTranslations } from "next-intl/server";
import { NoteListSkeleton } from "@/features/notes/components/NoteListSkeleton";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { SectionHeader } from "@/shared/ui/SectionHeader";
import { Skeleton } from "@/shared/ui/Skeleton";

export default async function NotesLoading() {
  const t = await getTranslations("notes");
  const tCommon = await getTranslations("common");

  return (
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      size="wide"
    >
      <div className="space-y-4" aria-busy="true">
        <SectionHeader
          title={t("sections.notes")}
          className="border-b border-border pb-3"
          badge={<Skeleton className="h-5 w-6" />}
          actions={<Skeleton className="h-11 w-32" />}
        />

        <NoteListSkeleton />

        <span role="status" className="sr-only">
          {tCommon("loading")}
        </span>
      </div>
    </PageLayout>
  );
}

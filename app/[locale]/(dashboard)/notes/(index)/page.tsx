import { getTranslations } from "next-intl/server";
import { NotesPageBody } from "@/features/notes/components/NotesPageBody";
import { parseNotesSearchParams } from "@/features/notes/schemas";
import { getNotesPageData } from "@/features/notes/server/get-notes-page-data";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { createPageMetadata } from "@/app/[locale]/metadata";

export const generateMetadata = createPageMetadata("notes");

interface SearchParams {
  show?: string | string[];
}

export default async function NotesPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;

  const { activeShow } = parseNotesSearchParams(searchParams);

  const [t, data] = await Promise.all([
    getTranslations("notes"),
    getNotesPageData(),
  ]);

  return (
    <PageLayout
      title={t("pageTitle")}
      size="wide"
    >
      <NotesPageBody
        notes={data.notes}
        canManageNotes={data.canManage}
        activeShow={activeShow}
        currentUserId={data.currentUserId}
        todayIso={data.todayIso}
      />
    </PageLayout>
  );
}

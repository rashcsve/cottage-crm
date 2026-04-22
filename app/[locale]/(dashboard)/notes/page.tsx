import { getTranslations } from "next-intl/server";
import { NotesPageBody } from "@/features/notes/components/NotesPageBody";
import { getNotesPageData } from "@/features/notes/server/get-notes-page-data";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { createPageMetadata } from "@/app/[locale]/metadata";

export const generateMetadata = createPageMetadata("notes");

export default async function NotesPage() {
  const [t, data] = await Promise.all([
    getTranslations("notes"),
    getNotesPageData(),
  ]);

  const sectionLabels = {
    eyebrow: t("sections.eyebrow"),
    title: t("sections.notes"),
    description: t("sections.notesDescription"),
    emptyTitle: t("empty.noNotes"),
    emptyDescription: t("empty.noNotesDescription"),
  };

  return (
    <PageLayout title={t("pageTitle")} description={t("pageDescription")}>
      <NotesPageBody
        notes={data.notes}
        canManageNotes={data.canManage}
        labels={sectionLabels}
      />
    </PageLayout>
  );
}

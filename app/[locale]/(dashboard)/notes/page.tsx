import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { NotesPageBody } from "@/features/notes/components/NotesPageBody";
import { getNotesPageData } from "@/features/notes/server/get-notes-page-data";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

export const metadata: Metadata = {
  title: "Notes",
};

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
    <PageContent className="space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <NotesPageBody
        notes={data.notes}
        canManageNotes={data.canManage}
        labels={sectionLabels}
      />
    </PageContent>
  );
}

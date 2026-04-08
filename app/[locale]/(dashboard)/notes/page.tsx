import { getTranslations } from "next-intl/server";
import { getNotesList } from "@/features/notes/server/queries";
import { NewNoteForm } from "@/features/notes/components/forms/NewNoteForm";
import { NoteList } from "@/features/notes/components/NoteList";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { PageHeader } from "@/shared/ui/page/PageHeader";
import { PageSection } from "@/shared/ui/page/PageSection";
import { PageContent } from "@/shared/ui/page/PageContent";

export default async function NotesPage() {
  const [t, profile, notes] = await Promise.all([
    getTranslations("notes"),
    getCurrentProfile(),
    getNotesList(),
  ]);

  const canManage = isAdminRole(profile.role);

  const totalCount = notes.length;

  const sectionLabels = {
    eyebrow: t("sections.eyebrow"),
    title: t("sections.notes"),
    description: t("sections.notesDescription"),
    emptyTitle: t("empty.noNotes"),
    emptyDescription: t("empty.noNotesDescription"),
  };

  return (
    <PageContent>
      <div className="space-y-6">
        <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-6">
            <PageSection
              variant="card"
              eyebrow={sectionLabels.eyebrow}
              title={sectionLabels.title}
              description={sectionLabels.description}
              count={totalCount}
            >
              <NoteList
                notes={notes}
                canManageNotes={canManage}
                currentUserId={profile.id}
                emptyTitle={sectionLabels.emptyTitle}
                emptyDescription={sectionLabels.emptyDescription}
              />
            </PageSection>
          </div>

          <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
            {canManage && <NewNoteForm />}
          </aside>
        </div>
      </div>
    </PageContent>
  );
}

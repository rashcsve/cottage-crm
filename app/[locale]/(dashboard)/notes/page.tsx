import { getTranslations } from "next-intl/server";
import { getNotesList } from "@/features/notes/server/queries";
import { NewNoteForm } from "@/features/notes/components/forms/NewNoteForm";
import { NoteList } from "@/features/notes/components/NoteList";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { PageContent } from "@/shared/ui/PageContent";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatCard } from "@/shared/ui/StatCard";
import { PageSection } from "@/shared/ui/PageSections";

export default async function NotesPage() {
  const [t, profile, notes] = await Promise.all([
    getTranslations("notes"),
    getCurrentProfile(),
    getNotesList(),
  ]);

  const canManage = isAdminRole(profile.role);

  return (
    <PageContent>
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <section className="grid gap-3 sm:grid-cols-1">
        <StatCard label={t("summary.total")} value={notes.length} />
      </section>

      {canManage && <NewNoteForm />}

      <PageSection title={t("sections.notes")}>
        <NoteList
          notes={notes}
          canManageNotes={canManage}
          currentUserId={profile.id}
          emptyTitle={t("empty.noNotes")}
          emptyDescription={t("empty.noNotesDescription")}
        />
      </PageSection>
    </PageContent>
  );
}

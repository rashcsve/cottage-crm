import { getNotesList } from "@/features/notes/server/queries";
import { NewNoteForm } from "@/features/notes/components/NewNoteForm";
import { NotesList } from "@/features/notes/components/NotesList";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { PageContent } from "@/shared/ui/PageContent";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatCard } from "@/shared/ui/StatCard";
import { PageSection } from "@/shared/ui/PageSections";

export const metadata = {
  title: "Poznámky",
};

export default async function NotesPage() {
  const profile = await getCurrentProfile();
  const canManage = isAdminRole(profile.role);
  const notes = await getNotesList();

  return (
    <PageContent>
      <PageHeader title="Poznámky" />

      <section className="grid gap-3 sm:grid-cols-1">
        <StatCard label="Poznámek" value={notes.length} />
      </section>

      {canManage && <NewNoteForm />}

      <PageSection title="Záznamy">
        <NotesList notes={notes} canManageNotes={canManage} />
      </PageSection>
    </PageContent>
  );
}

import { createClient } from "@/lib/supabase/server";
import { Note } from "@/app/[locale]/components/notes/types";
import { NewNoteForm } from "@/app/[locale]/components/notes/NewNoteForm";
import { NotesList } from "@/app/[locale]/components/notes/NotesList";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { PageContent } from "@/shared/ui/PageContent";
import { PageHeader } from "@/shared/ui/PageHeader";
import { StatCard } from "@/shared/ui/StatCard";
import { PageSection } from "@/shared/ui/PageSections";

export default async function NotesPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const canManage = isAdminRole(profile.role);

  const { data: notesData, error: notesError } = await supabase
    .from("notes")
    .select("id, content, author, author_id, created_at")
    .order("created_at", { ascending: false });

  if (notesError)
    throw new Error(`Nepodařilo se načíst poznámky: ${notesError.message}`);

  const notes = (notesData ?? []) as Note[];

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

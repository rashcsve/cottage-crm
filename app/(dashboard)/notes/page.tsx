import { SectionHeader } from "@/app/components/SectionHeader";
import { createClient } from "@/lib/supabase/server";
import { Note } from "@/app/components/notes/types";
import { NewNoteForm } from "@/app/components/notes/NewNoteForm";
import { NotesList } from "@/app/components/notes/NotesList";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";

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
    <>
      <SectionHeader title="Poznámky" />

      {canManage && <NewNoteForm />}

      <NotesList notes={notes} canManageNotes={canManage} />
    </>
  );
}

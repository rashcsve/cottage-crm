import { AppShell } from "@/components/AppShell";
import { SectionHeader } from "@/components/SectionHeader";
import { createClient } from "../../../lib/supabase/server";
import { Profile } from "../../../lib/types/profile";
import { Note } from "@/components/notes/types";
import { NewNoteForm } from "@/components/notes/NewNoteForm";
import { NotesList } from "@/components/notes/NotesList";

export default async function NotesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("User session chybí v dashboard layout flow.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, display_name, role")
    .eq("id", user.id)
    .single<Profile>();

  if (profileError || !profile) throw new Error("Nepodařilo se načíst profil.");

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

      {profile.role === "admin" && <NewNoteForm />}

      <NotesList notes={notes} canManageNotes={profile.role === "admin"} />
    </>
  );
}

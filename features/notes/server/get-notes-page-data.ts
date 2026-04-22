import "server-only";

import { getAllNotes } from "@/features/notes/server/queries";
import type { NotesPageData } from "@/features/notes/types/notes";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";

export async function getNotesPageData(): Promise<NotesPageData> {
  const [notes, profile] = await Promise.all([
    getAllNotes(),
    getCurrentProfile(),
  ]);

  return {
    notes,
    canManage: isAdminRole(profile.role),
  };
}

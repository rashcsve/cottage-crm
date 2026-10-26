import "server-only";

import { getAllNotes } from "@/features/notes/server/queries";
import type { NotesPageData } from "@/features/notes/types/notes";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { getE2EMockNotes } from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";

export async function getNotesPageData(): Promise<NotesPageData> {
  const [notes, profile] = await Promise.all([
    isE2EMockModeEnabled() ? getE2EMockNotes() : getAllNotes(),
    getCurrentProfile(),
  ]);

  return {
    notes,
    canManage: isAdminRole(profile.role),
  };
}

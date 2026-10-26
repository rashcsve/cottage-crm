import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllNotes } from "@/features/notes/server/queries";
import type { Note } from "@/features/notes/types/notes";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getE2EMockNotes } from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import { getNotesPageData } from "./get-notes-page-data";

vi.mock("@/features/notes/server/queries", () => ({
  getAllNotes: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-profile", () => ({
  getCurrentProfile: vi.fn(),
}));

vi.mock("@/lib/e2e/mock-mode", () => ({
  isE2EMockModeEnabled: vi.fn(),
}));

vi.mock("@/lib/e2e/mock-data", () => ({
  getE2EMockNotes: vi.fn(),
}));

const mockGetAllNotes = vi.mocked(getAllNotes);
const mockGetCurrentProfile = vi.mocked(getCurrentProfile);
const mockGetE2EMockNotes = vi.mocked(getE2EMockNotes);
const mockIsE2EMockModeEnabled = vi.mocked(isE2EMockModeEnabled);

function createNote(id: number): Note {
  return {
    id,
    content: `Note ${id}`,
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    photos: [],
  };
}

describe("getNotesPageData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentProfile.mockResolvedValue({
      role: "admin",
    } as Awaited<ReturnType<typeof getCurrentProfile>>);
  });

  it("reads notes from Supabase outside E2E mock mode", async () => {
    mockIsE2EMockModeEnabled.mockReturnValue(false);
    mockGetAllNotes.mockResolvedValue([createNote(1)]);

    const data = await getNotesPageData();

    expect(mockGetAllNotes).toHaveBeenCalledTimes(1);
    expect(mockGetE2EMockNotes).not.toHaveBeenCalled();
    expect(data).toEqual({ notes: [createNote(1)], canManage: true });
  });

  it("reads mock notes and never queries Supabase in E2E mock mode", async () => {
    mockIsE2EMockModeEnabled.mockReturnValue(true);
    mockGetE2EMockNotes.mockReturnValue([createNote(2)]);

    const data = await getNotesPageData();

    expect(mockGetAllNotes).not.toHaveBeenCalled();
    expect(data).toEqual({ notes: [createNote(2)], canManage: true });
  });

  it("lets viewers read but not manage notes", async () => {
    mockIsE2EMockModeEnabled.mockReturnValue(true);
    mockGetE2EMockNotes.mockReturnValue([]);
    mockGetCurrentProfile.mockResolvedValue({
      role: "viewer",
    } as Awaited<ReturnType<typeof getCurrentProfile>>);

    const data = await getNotesPageData();

    expect(data.canManage).toBe(false);
  });
});

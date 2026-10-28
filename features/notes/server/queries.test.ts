import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAllNotes } from "@/features/notes/server/queries";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const noteRow = {
  id: 7,
  content: "Porch",
  author_id: "user",
  created_at: "2026-10-28T10:00:00Z",
  author: { display_name: "Alice Johnson" },
  note_photos: [
    {
      id: 1,
      file_name: "porch.webp",
      file_size: 1234,
      mime_type: "image/webp",
      sort_order: 0,
      storage_path: "user/7/00-a.webp",
      thumbnail_path: "user/7/00-a.webp.thumb.webp",
    },
  ],
};

describe("features/notes/server/queries", () => {
  const select = vi.fn();
  const createSignedUrls = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    select.mockReturnValue({
      order: vi.fn().mockResolvedValue({ data: [noteRow], error: null }),
    });
    createSignedUrls.mockResolvedValue({
      data: [
        { path: "user/7/00-a.webp", signedUrl: "https://signed/a", error: null },
        { path: "user/7/00-a.webp.thumb.webp", signedUrl: "https://signed/a-thumb", error: null },
      ],
      error: null,
    });
    vi.mocked(createClient).mockResolvedValue({
      from: vi.fn(() => ({ select })),
      storage: { from: vi.fn(() => ({ createSignedUrls })) },
    } as unknown as Awaited<ReturnType<typeof createClient>>);
  });

  it("selects the thumbnail path of each photo", async () => {
    await getAllNotes();

    expect(select.mock.calls[0][0]).toContain(
      "note_photos(id, file_name, file_size, mime_type, sort_order, storage_path, thumbnail_path)"
    );
  });

  it("signs each photo with its thumbnail in one batch and maps both urls", async () => {
    const [note] = await getAllNotes();

    expect(createSignedUrls).toHaveBeenCalledTimes(1);
    expect(createSignedUrls.mock.calls[0][0]).toEqual([
      "user/7/00-a.webp",
      "user/7/00-a.webp.thumb.webp",
    ]);
    expect(note.photos[0]).toMatchObject({
      url: "https://signed/a",
      thumbnailUrl: "https://signed/a-thumb",
    });
  });
});

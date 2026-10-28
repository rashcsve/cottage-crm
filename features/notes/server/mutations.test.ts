import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import {
  createNotePhotos,
  getNotePhotoStoragePaths,
} from "@/features/notes/server/mutations";

describe("features/notes/server/mutations", () => {
  describe("createNotePhotos", () => {
    it("stores each photo with its thumbnail path", async () => {
      const insert = vi.fn().mockResolvedValue({ error: null });
      const supabase = { from: vi.fn(() => ({ insert })) } as unknown as SupabaseClient;

      const result = await createNotePhotos(supabase, 7, [
        {
          fileName: "porch.webp",
          fileSize: 1234,
          mimeType: "image/webp",
          sortOrder: 0,
          storagePath: "user/7/00-a.webp",
          thumbnailPath: "user/7/00-a.webp.thumb.webp",
        },
      ]);

      expect(result).toEqual({ ok: true, data: undefined });
      expect(supabase.from).toHaveBeenCalledWith("note_photos");
      expect(insert).toHaveBeenCalledWith([
        {
          note_id: 7,
          file_name: "porch.webp",
          file_size: 1234,
          mime_type: "image/webp",
          sort_order: 0,
          storage_path: "user/7/00-a.webp",
          thumbnail_path: "user/7/00-a.webp.thumb.webp",
        },
      ]);
    });
  });

  describe("getNotePhotoStoragePaths", () => {
    it("returns every photo and thumbnail path of the note", async () => {
      const eq = vi.fn().mockResolvedValue({
        data: [
          { storage_path: "user/7/00-a.webp", thumbnail_path: "user/7/00-a.webp.thumb.webp" },
          { storage_path: "user/7/01-b.jpg", thumbnail_path: "user/7/01-b.jpg.thumb.jpg" },
        ],
        error: null,
      });
      const select = vi.fn(() => ({ eq }));
      const supabase = { from: vi.fn(() => ({ select })) } as unknown as SupabaseClient;

      const result = await getNotePhotoStoragePaths(supabase, 7);

      expect(select).toHaveBeenCalledWith("storage_path, thumbnail_path");
      expect(eq).toHaveBeenCalledWith("note_id", 7);
      expect(result).toEqual({
        ok: true,
        data: [
          "user/7/00-a.webp",
          "user/7/00-a.webp.thumb.webp",
          "user/7/01-b.jpg",
          "user/7/01-b.jpg.thumb.jpg",
        ],
      });
    });
  });
});

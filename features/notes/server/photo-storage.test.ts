import type { SupabaseClient } from "@supabase/supabase-js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  createSignedNotePhotoUrlMap,
  getNotePhotoThumbnailPath,
  NOTE_PHOTOS_BUCKET,
  removeNotePhotoObjects,
  uploadNotePhotos,
} from "@/features/notes/server/photo-storage";

const upload = vi.fn();
const remove = vi.fn();
const createSignedUrls = vi.fn();
const from = vi.fn(() => ({ upload, remove, createSignedUrls }));
const supabase = { storage: { from } } as unknown as SupabaseClient;

function createPhoto(name: string, thumbnailType = "image/webp") {
  return {
    file: new File([name], `${name}.webp`, { type: "image/webp" }),
    thumbnail: new File([`${name}-thumb`], `${name}.webp`, { type: thumbnailType }),
  };
}

function getUploadedPaths(): string[] {
  return upload.mock.calls.map(([path]) => path as string);
}

describe("features/notes/server/photo-storage", () => {
  const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();
    upload.mockResolvedValue({ error: null });
    remove.mockResolvedValue({ error: null });
  });

  describe("getNotePhotoThumbnailPath", () => {
    it("names a WebP thumbnail after its photo", () => {
      expect(getNotePhotoThumbnailPath("user/7/00-a.webp", "image/webp")).toBe(
        "user/7/00-a.webp.thumb.webp"
      );
    });

    it("names a JPEG thumbnail after its photo", () => {
      expect(getNotePhotoThumbnailPath("user/7/00-a.jpg", "image/jpeg")).toBe(
        "user/7/00-a.jpg.thumb.jpg"
      );
    });
  });

  describe("uploadNotePhotos", () => {
    it("uploads each photo and its thumbnail with their own content types", async () => {
      const photo = createPhoto("porch", "image/jpeg");

      const result = await uploadNotePhotos(supabase, "user", 7, [photo]);

      expect(from).toHaveBeenCalledWith(NOTE_PHOTOS_BUCKET);
      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const [uploaded] = result.data;
      expect(uploaded.storagePath).toMatch(/^user\/7\/00-.+\.webp$/);
      expect(upload).toHaveBeenCalledTimes(2);
      expect(upload).toHaveBeenCalledWith(
        uploaded.storagePath,
        photo.file,
        expect.objectContaining({ contentType: "image/webp", upsert: false })
      );
      expect(upload).toHaveBeenCalledWith(
        `${uploaded.storagePath}.thumb.jpg`,
        photo.thumbnail,
        expect.objectContaining({ contentType: "image/jpeg", upsert: false })
      );
    });

    it("returns each photo record with its thumbnail path", async () => {
      const photo = createPhoto("porch");

      const result = await uploadNotePhotos(supabase, "user", 7, [photo]);

      expect(result.ok && result.data).toEqual([
        {
          fileName: "porch.webp",
          fileSize: photo.file.size,
          mimeType: "image/webp",
          sortOrder: 0,
          storagePath: expect.stringMatching(/^user\/7\/00-.+\.webp$/),
          thumbnailPath: expect.stringMatching(/^user\/7\/00-.+\.webp\.thumb\.webp$/),
        },
      ]);
    });

    it("fails and removes everything uploaded when a thumbnail upload fails", async () => {
      upload.mockImplementation(async (path: string) => ({
        error: path.includes(".thumb.") ? new Error("thumb rejected") : null,
      }));

      const result = await uploadNotePhotos(supabase, "user", 7, [createPhoto("porch")]);

      expect(result).toEqual({ ok: false });
      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove.mock.calls[0][0]).toEqual(expect.arrayContaining(getUploadedPaths()));
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("fails and removes every photo and thumbnail when a photo upload fails", async () => {
      upload.mockImplementation(async (path: string) => ({
        error: path.includes("/01-") && !path.includes(".thumb.") ? new Error("boom") : null,
      }));

      const result = await uploadNotePhotos(supabase, "user", 7, [
        createPhoto("one"),
        createPhoto("two"),
      ]);

      expect(result).toEqual({ ok: false });
      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove.mock.calls[0][0]).toHaveLength(4);
      expect(remove.mock.calls[0][0]).toEqual(expect.arrayContaining(getUploadedPaths()));
    });
  });

  describe("removeNotePhotoObjects", () => {
    it("removes exactly the given paths in one call", async () => {
      await removeNotePhotoObjects(supabase, [
        "user/7/00-a.webp",
        "user/7/00-a.webp.thumb.webp",
      ]);

      expect(remove).toHaveBeenCalledTimes(1);
      expect(remove).toHaveBeenCalledWith(["user/7/00-a.webp", "user/7/00-a.webp.thumb.webp"]);
    });

    it("does nothing without paths", async () => {
      await removeNotePhotoObjects(supabase, []);

      expect(remove).not.toHaveBeenCalled();
    });
  });

  describe("createSignedNotePhotoUrlMap", () => {
    it("signs exactly the given paths in one batch", async () => {
      createSignedUrls.mockResolvedValue({
        data: [
          { path: "user/7/00-a.webp", signedUrl: "https://signed/a", error: null },
          {
            path: "user/7/00-a.webp.thumb.webp",
            signedUrl: "https://signed/a-thumb",
            error: null,
          },
        ],
        error: null,
      });

      const map = await createSignedNotePhotoUrlMap(supabase, [
        "user/7/00-a.webp",
        "user/7/00-a.webp.thumb.webp",
      ]);

      expect(createSignedUrls).toHaveBeenCalledTimes(1);
      expect(createSignedUrls.mock.calls[0][0]).toEqual([
        "user/7/00-a.webp",
        "user/7/00-a.webp.thumb.webp",
      ]);
      expect(map.get("user/7/00-a.webp")).toBe("https://signed/a");
      expect(map.get("user/7/00-a.webp.thumb.webp")).toBe("https://signed/a-thumb");
    });
  });
});

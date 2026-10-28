import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addNoteAction,
  deleteNoteAction,
} from "@/features/notes/server/actions";
import type {
  CreateNoteFormInput,
  DeleteNoteInput,
} from "@/features/notes/schemas";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createNote as createNoteMutation,
  createNotePhotos as createNotePhotosMutation,
  deleteNote as deleteNoteMutation,
  getNotePhotoStoragePaths as getNotePhotoStoragePathsMutation,
} from "@/features/notes/server/mutations";
import { revalidateNotePaths } from "@/features/notes/server/revalidation";
import { AuthError } from "@/lib/auth/errors";
import { NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES } from "@/features/notes/shared/notePhotoValidation";
import {
  uploadNotePhotos,
  removeNotePhotoObjects,
  hasValidImageSignature,
} from "./photo-storage";

vi.mock("next-intl/server", async () => {
  const { createTranslatorMock } = await import(
    "@/tests/utils/create-translator-mock"
  );

  return {
    getTranslations: vi.fn(async () => createTranslatorMock()),
  };
});

vi.mock("@/lib/auth/require-admin", () => ({
  requireAdmin: vi.fn(),
}));

vi.mock("@/features/notes/server/mutations", () => ({
  createNote: vi.fn(),
  createNotePhotos: vi.fn(),
  deleteNote: vi.fn(),
  getNotePhotoStoragePaths: vi.fn(),
}));

vi.mock("@/features/notes/server/revalidation", () => ({
  revalidateNotePaths: vi.fn(),
}));

vi.mock("@/features/notes/server/photo-storage", () => ({
  uploadNotePhotos: vi.fn(),
  removeNotePhotoObjects: vi.fn(),
  hasValidImageSignature: vi.fn(),
}));

type AddNoteInput = CreateNoteFormInput;
type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;
type CreateNoteMutationResult = Awaited<ReturnType<typeof createNoteMutation>>;
type CreateNotePhotosMutationResult = Awaited<
  ReturnType<typeof createNotePhotosMutation>
>;
type DeleteNoteMutationResult = Awaited<ReturnType<typeof deleteNoteMutation>>;
type GetNotePhotoStoragePathsMutationResult = Awaited<
  ReturnType<typeof getNotePhotoStoragePathsMutation>
>;

function createValidNoteInput(
  overrides: Partial<AddNoteInput> = {}
): AddNoteInput {
  return {
    content: "Remember to bring the spare keys.",
    ...overrides,
  };
}

function createUnsafeNoteInput(overrides: Record<string, unknown>): AddNoteInput {
  return {
    ...createValidNoteInput(),
    ...overrides,
  } as unknown as AddNoteInput;
}

function createUnsafeDeleteInput(
  overrides: Record<string, unknown>
): DeleteNoteInput {
  return {
    noteId: 1,
    ...overrides,
  } as unknown as DeleteNoteInput;
}

describe("features/notes/server/actions", () => {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    const adminContext: RequireAdminResult = {
      supabase: {} as RequireAdminResult["supabase"],
      userId: "admin-user-id",
      userRole: "admin",
      displayName: "Alice Johnson",
    };

    vi.mocked(requireAdmin).mockResolvedValue(adminContext);
    vi.mocked(createNoteMutation).mockResolvedValue({
      ok: true,
      data: { id: 24 },
    } as CreateNoteMutationResult);
    vi.mocked(createNotePhotosMutation).mockResolvedValue({
      ok: true,
      data: undefined,
    } as CreateNotePhotosMutationResult);
    vi.mocked(deleteNoteMutation).mockResolvedValue({
      ok: true,
      data: undefined,
    } as DeleteNoteMutationResult);
    vi.mocked(getNotePhotoStoragePathsMutation).mockResolvedValue({
      ok: true,
      data: [],
    } as GetNotePhotoStoragePathsMutationResult);
    vi.mocked(uploadNotePhotos).mockResolvedValue({
      ok: true,
      data: [],
    });
    vi.mocked(hasValidImageSignature).mockResolvedValue(true);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe("addNoteAction", () => {
    it("returns success, forwards admin context, and revalidates", async () => {
      const result = await addNoteAction(createValidNoteInput());

      expect(result).toEqual({
        ok: true,
        data: { id: 24 },
        message: "success",
      });
      expect(createNoteMutation).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        { content: "Remember to bring the spare keys." }
      );
      expect(revalidateNotePaths).toHaveBeenCalledTimes(1);
    });

    it("uploads note photos with their thumbnails from form data before revalidating", async () => {
      const formData = new FormData();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
      const thumbnail = new File(["thumb"], "porch.jpg", { type: "image/jpeg" });
      const uploadedPhoto = {
        fileName: "porch.jpg",
        fileSize: photo.size,
        mimeType: photo.type,
        sortOrder: 0,
        storagePath: "admin-user-id/24/00-file.jpg",
        thumbnailPath: "admin-user-id/24/00-file.jpg.thumb.jpg",
      };

      formData.set("content", "Remember to bring the spare keys.");
      formData.append("photos", photo);
      formData.set("thumbnail-0", thumbnail);

      vi.mocked(uploadNotePhotos).mockResolvedValueOnce({
        ok: true,
        data: [uploadedPhoto],
      });

      const result = await addNoteAction(formData);

      expect(result).toEqual({
        ok: true,
        data: { id: 24 },
        message: "success",
      });
      expect(uploadNotePhotos).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        24,
        [{ file: photo, thumbnail }]
      );
      expect(createNotePhotosMutation).toHaveBeenCalledWith(expect.anything(), 24, [
        uploadedPhoto,
      ]);
      expect(revalidateNotePaths).toHaveBeenCalledTimes(1);
    });

    describe("thumbnails", () => {
      function createPhotoFormData(photoCount: number) {
        const formData = new FormData();
        const photos = Array.from(
          { length: photoCount },
          (_, index) => new File([`photo-${index}`], `${index}.webp`, { type: "image/webp" })
        );

        formData.set("content", "Remember to bring the spare keys.");
        for (const photo of photos) {
          formData.append("photos", photo);
        }

        return { formData, photos };
      }

      function createThumbnail(index: number) {
        return new File([`thumb-${index}`], `${index}.webp`, { type: "image/webp" });
      }

      function expectRejectedBeforeAuth(result: Awaited<ReturnType<typeof addNoteAction>>) {
        expect(result).toEqual({
          ok: false,
          error: "errors.invalidData",
          fieldErrors: { photos: "fields.errors.photoInvalidType" },
        });
        expect(requireAdmin).not.toHaveBeenCalled();
        expect(uploadNotePhotos).not.toHaveBeenCalled();
      }

      it("pairs each photo with the thumbnail at the same position", async () => {
        const { formData, photos } = createPhotoFormData(2);
        const thumbnails = [createThumbnail(0), createThumbnail(1)];

        formData.set("thumbnail-0", thumbnails[0]);
        formData.set("thumbnail-1", thumbnails[1]);

        expect((await addNoteAction(formData)).ok).toBe(true);
        expect(uploadNotePhotos).toHaveBeenCalledWith(expect.anything(), "admin-user-id", 24, [
          { file: photos[0], thumbnail: thumbnails[0] },
          { file: photos[1], thumbnail: thumbnails[1] },
        ]);
      });

      it("ignores thumbnails without a matching photo", async () => {
        const { formData, photos } = createPhotoFormData(1);
        const thumbnail = createThumbnail(0);

        formData.set("thumbnail-0", thumbnail);
        formData.set("thumbnail-1", createThumbnail(1));

        await addNoteAction(formData);

        expect(uploadNotePhotos).toHaveBeenCalledWith(expect.anything(), "admin-user-id", 24, [
          { file: photos[0], thumbnail },
        ]);
      });

      it("rejects the note when a photo has no thumbnail", async () => {
        const { formData } = createPhotoFormData(2);

        formData.set("thumbnail-0", createThumbnail(0));

        expectRejectedBeforeAuth(await addNoteAction(formData));
      });

      it.each([
        ["an unsupported type", new File(["thumb"], "0.png", { type: "image/png" })],
        ["an empty file", new File([], "0.webp", { type: "image/webp" })],
        [
          "an oversized file",
          new File([new Uint8Array(NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES + 1)], "0.webp", {
            type: "image/webp",
          }),
        ],
        ["a non-file value", "not-a-file"],
      ])("rejects the note when a thumbnail is %s", async (_, thumbnail) => {
        const { formData } = createPhotoFormData(1);

        formData.set("thumbnail-0", thumbnail);

        expectRejectedBeforeAuth(await addNoteAction(formData));
      });

      it("rejects the note when a thumbnail's bytes are not an image", async () => {
        const { formData } = createPhotoFormData(1);
        const thumbnail = new File(["not-an-image"], "0.webp", { type: "image/webp" });

        formData.set("thumbnail-0", thumbnail);
        vi.mocked(hasValidImageSignature).mockImplementation(
          async (file) => file !== thumbnail
        );

        expectRejectedBeforeAuth(await addNoteAction(formData));
        expect(hasValidImageSignature).toHaveBeenCalledWith(thumbnail);
      });
    });

    it("returns validation errors before auth runs", async () => {
      const result = await addNoteAction(
        createUnsafeNoteInput({ content: "   " })
      );

      expect(result).toEqual({
        ok: false,
        error: "errors.invalidData",
        fieldErrors: {
          content: "fieldErrors.content",
        },
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(createNoteMutation).not.toHaveBeenCalled();
      expect(revalidateNotePaths).not.toHaveBeenCalled();
    });

    it("returns photo validation errors before auth runs", async () => {
      const result = await addNoteAction(
        createUnsafeNoteInput({
          photos: [
            new File(["photo"], "porch.gif", {
              type: "image/gif",
            }),
          ],
        })
      );

      expect(result).toEqual({
        ok: false,
        error: "errors.invalidData",
        fieldErrors: {
          photos: "fields.errors.photoInvalidType",
        },
      });
      expect(requireAdmin).not.toHaveBeenCalled();
    });

    it("returns translated mutation errors", async () => {
      vi.mocked(createNoteMutation).mockResolvedValueOnce({
        ok: false,
        error: "databaseError",
      } as CreateNoteMutationResult);

      expect(await addNoteAction(createValidNoteInput())).toEqual({
        ok: false,
        error: "errors.databaseError",
      });
      expect(revalidateNotePaths).not.toHaveBeenCalled();
    });

    it("returns auth translation when requireAdmin throws AuthError", async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new AuthError("forbidden"));

      expect(await addNoteAction(createValidNoteInput())).toEqual({
        ok: false,
        error: "errors.forbidden",
      });
      expect(createNoteMutation).not.toHaveBeenCalled();
      expect(revalidateNotePaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when mutation throws", async () => {
      vi.mocked(createNoteMutation).mockRejectedValueOnce(new Error("boom"));

      expect(await addNoteAction(createValidNoteInput())).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateNotePaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("rolls the note back when photo records fail to save", async () => {
      const formData = new FormData();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

      formData.set("content", "Remember to bring the spare keys.");
      formData.append("photos", photo);
      formData.set("thumbnail-0", new File(["thumb"], "porch.jpg", { type: "image/jpeg" }));

      vi.mocked(uploadNotePhotos).mockResolvedValueOnce({
        ok: true,
        data: [
          {
            fileName: "porch.jpg",
            fileSize: photo.size,
            mimeType: photo.type,
            sortOrder: 0,
            storagePath: "admin-user-id/24/00-file.jpg",
            thumbnailPath: "admin-user-id/24/00-file.jpg.thumb.jpg",
          },
        ],
      });
      vi.mocked(createNotePhotosMutation).mockResolvedValueOnce({
        ok: false,
        error: "databaseError",
      } as CreateNotePhotosMutationResult);

      expect(await addNoteAction(formData)).toEqual({
        ok: false,
        error: "errors.photoSaveFailed",
      });
      expect(removeNotePhotoObjects).toHaveBeenCalledWith(expect.anything(), [
        "admin-user-id/24/00-file.jpg",
        "admin-user-id/24/00-file.jpg.thumb.jpg",
      ]);
      expect(deleteNoteMutation).toHaveBeenCalledWith(expect.anything(), 24);
      expect(revalidateNotePaths).not.toHaveBeenCalled();
    });
  });

  describe("deleteNoteAction", () => {
    it("returns success and revalidates on valid delete", async () => {
      expect(await deleteNoteAction({ noteId: 24 })).toEqual({
        ok: true,
        data: undefined,
        message: "success",
      });
      expect(getNotePhotoStoragePathsMutation).toHaveBeenCalledWith(
        expect.anything(),
        24
      );
      expect(deleteNoteMutation).toHaveBeenCalledWith(expect.anything(), 24);
      expect(revalidateNotePaths).not.toHaveBeenCalled();
    });

    it("removes both the photo and thumbnail objects after deleting the note", async () => {
      vi.mocked(getNotePhotoStoragePathsMutation).mockResolvedValueOnce({
        ok: true,
        data: [
          "admin-user-id/24/00-file.jpg",
          "admin-user-id/24/00-file.jpg.thumb.webp",
        ],
      } as GetNotePhotoStoragePathsMutationResult);

      expect((await deleteNoteAction({ noteId: 24 })).ok).toBe(true);
      expect(removeNotePhotoObjects).toHaveBeenCalledWith(expect.anything(), [
        "admin-user-id/24/00-file.jpg",
        "admin-user-id/24/00-file.jpg.thumb.webp",
      ]);
      expect(
        vi.mocked(deleteNoteMutation).mock.invocationCallOrder[0]
      ).toBeLessThan(vi.mocked(removeNotePhotoObjects).mock.invocationCallOrder[0]);
    });

    it("returns validation error for invalid input", async () => {
      expect(
        await deleteNoteAction(createUnsafeDeleteInput({ noteId: "oops" }))
      ).toEqual({
        ok: false,
        error: "errors.invalidData",
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(deleteNoteMutation).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when delete fails", async () => {
      vi.mocked(deleteNoteMutation).mockResolvedValueOnce({
        ok: false,
        error: "notFound",
      } as DeleteNoteMutationResult);

      expect(await deleteNoteAction({ noteId: 24 })).toEqual({
        ok: false,
        error: "errors.notFound",
      });
      expect(revalidateNotePaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when mutation throws", async () => {
      vi.mocked(deleteNoteMutation).mockRejectedValueOnce(new Error("boom"));

      expect(await deleteNoteAction({ noteId: 24 })).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateNotePaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

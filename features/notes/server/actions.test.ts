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
import { uploadNotePhotos, removeNotePhotoObjects } from "./photo-storage";

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
        "Alice Johnson",
        { content: "Remember to bring the spare keys." }
      );
      expect(revalidateNotePaths).toHaveBeenCalledTimes(1);
    });

    it("uploads note photos from form data before revalidating", async () => {
      const formData = new FormData();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

      formData.set("content", "Remember to bring the spare keys.");
      formData.append("photos", photo);

      vi.mocked(uploadNotePhotos).mockResolvedValueOnce({
        ok: true,
        data: [
          {
            fileName: "porch.jpg",
            fileSize: photo.size,
            mimeType: photo.type,
            sortOrder: 0,
            storagePath: "admin-user-id/24/00-file.jpg",
          },
        ],
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
        [photo]
      );
      expect(createNotePhotosMutation).toHaveBeenCalledWith(expect.anything(), 24, [
        {
          fileName: "porch.jpg",
          fileSize: photo.size,
          mimeType: photo.type,
          sortOrder: 0,
          storagePath: "admin-user-id/24/00-file.jpg",
        },
      ]);
      expect(revalidateNotePaths).toHaveBeenCalledTimes(1);
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

      vi.mocked(uploadNotePhotos).mockResolvedValueOnce({
        ok: true,
        data: [
          {
            fileName: "porch.jpg",
            fileSize: photo.size,
            mimeType: photo.type,
            sortOrder: 0,
            storagePath: "admin-user-id/24/00-file.jpg",
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
      expect(revalidateNotePaths).toHaveBeenCalledTimes(1);
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

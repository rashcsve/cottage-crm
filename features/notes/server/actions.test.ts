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
  deleteNote as deleteNoteMutation,
} from "@/features/notes/server/mutations";
import { revalidateNotePaths } from "@/features/notes/server/revalidation";
import { AuthError } from "@/lib/auth/errors";

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
  deleteNote: vi.fn(),
}));

vi.mock("@/features/notes/server/revalidation", () => ({
  revalidateNotePaths: vi.fn(),
}));

type AddNoteInput = CreateNoteFormInput;
type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;
type CreateNoteMutationResult = Awaited<ReturnType<typeof createNoteMutation>>;
type DeleteNoteMutationResult = Awaited<ReturnType<typeof deleteNoteMutation>>;

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
    vi.mocked(deleteNoteMutation).mockResolvedValue({
      ok: true,
      data: undefined,
    } as DeleteNoteMutationResult);
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
  });

  describe("deleteNoteAction", () => {
    it("returns success and revalidates on valid delete", async () => {
      expect(await deleteNoteAction({ noteId: 24 })).toEqual({
        ok: true,
        data: undefined,
        message: "success",
      });
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

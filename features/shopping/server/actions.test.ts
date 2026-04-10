import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addShoppingItemAction,
  deleteShoppingItemAction,
  toggleShoppingItemAction,
} from "@/features/shopping/server/actions";
import type {
  CreateShoppingItemFormInput,
  DeleteShoppingItemInput,
  ToggleShoppingItemInput,
} from "@/features/shopping/schemas";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createShoppingItem as createShoppingItemMutation,
  updateShoppingItem as updateShoppingItemMutation,
  deleteShoppingItem as deleteShoppingItemMutation,
} from "@/features/shopping/server/mutations";
import { revalidateShoppingPaths } from "@/features/shopping/server/revalidation";
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

vi.mock("@/features/shopping/server/mutations", () => ({
  createShoppingItem: vi.fn(),
  updateShoppingItem: vi.fn(),
  deleteShoppingItem: vi.fn(),
}));

vi.mock("@/features/shopping/server/revalidation", () => ({
  revalidateShoppingPaths: vi.fn(),
}));

type AddShoppingItemInput = CreateShoppingItemFormInput;
type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;
type CreateShoppingItemMutationResult = Awaited<
  ReturnType<typeof createShoppingItemMutation>
>;
type UpdateShoppingItemMutationResult = Awaited<
  ReturnType<typeof updateShoppingItemMutation>
>;
type DeleteShoppingItemMutationResult = Awaited<
  ReturnType<typeof deleteShoppingItemMutation>
>;

function createValidShoppingInput(
  overrides: Partial<AddShoppingItemInput> = {}
): AddShoppingItemInput {
  return {
    title: "Fresh bread",
    ...overrides,
  };
}

function createUnsafeShoppingInput(
  overrides: Record<string, unknown>
): AddShoppingItemInput {
  return {
    ...createValidShoppingInput(),
    ...overrides,
  } as unknown as AddShoppingItemInput;
}

function createUnsafeToggleInput(
  overrides: Record<string, unknown>
): ToggleShoppingItemInput {
  return {
    itemId: 1,
    isChecked: false,
    ...overrides,
  } as unknown as ToggleShoppingItemInput;
}

function createUnsafeDeleteInput(
  overrides: Record<string, unknown>
): DeleteShoppingItemInput {
  return {
    itemId: 1,
    ...overrides,
  } as unknown as DeleteShoppingItemInput;
}

describe("features/shopping/server/actions", () => {
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
    vi.mocked(createShoppingItemMutation).mockResolvedValue({
      ok: true,
      data: { id: 42 },
    } as CreateShoppingItemMutationResult);
    vi.mocked(updateShoppingItemMutation).mockResolvedValue({
      ok: true,
      data: undefined,
    } as UpdateShoppingItemMutationResult);
    vi.mocked(deleteShoppingItemMutation).mockResolvedValue({
      ok: true,
      data: undefined,
    } as DeleteShoppingItemMutationResult);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe("addShoppingItemAction", () => {
    it("returns success, forwards admin context, and revalidates", async () => {
      const result = await addShoppingItemAction(createValidShoppingInput());

      expect(result).toEqual({
        ok: true,
        data: { id: 42 },
        message: "success",
      });
      expect(createShoppingItemMutation).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        "Alice Johnson",
        { title: "Fresh bread" }
      );
      expect(revalidateShoppingPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation errors before auth runs", async () => {
      const result = await addShoppingItemAction(
        createUnsafeShoppingInput({ title: "   " })
      );

      expect(result).toEqual({
        ok: false,
        error: "errors.invalidData",
        fieldErrors: {
          title: "fieldErrors.title",
        },
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(createShoppingItemMutation).not.toHaveBeenCalled();
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
    });

    it("returns translated mutation errors", async () => {
      vi.mocked(createShoppingItemMutation).mockResolvedValueOnce({
        ok: false,
        error: "databaseError",
      } as CreateShoppingItemMutationResult);

      expect(await addShoppingItemAction(createValidShoppingInput())).toEqual({
        ok: false,
        error: "errors.databaseError",
      });
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
    });

    it("returns auth translation when requireAdmin throws AuthError", async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new AuthError("forbidden"));

      expect(await addShoppingItemAction(createValidShoppingInput())).toEqual({
        ok: false,
        error: "errors.forbidden",
      });
      expect(createShoppingItemMutation).not.toHaveBeenCalled();
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when mutation throws", async () => {
      vi.mocked(createShoppingItemMutation).mockRejectedValueOnce(
        new Error("boom")
      );

      expect(await addShoppingItemAction(createValidShoppingInput())).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("toggleShoppingItemAction", () => {
    it("returns success, flips checked state, and revalidates", async () => {
      const result = await toggleShoppingItemAction({
        itemId: 7,
        isChecked: false,
      });

      expect(result).toEqual({
        ok: true,
        data: undefined,
        message: "success",
      });
      expect(updateShoppingItemMutation).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        "Alice Johnson",
        {
          id: 7,
          isChecked: true,
        }
      );
      expect(revalidateShoppingPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation error for invalid input", async () => {
      expect(
        await toggleShoppingItemAction(
          createUnsafeToggleInput({ isChecked: "yes" })
        )
      ).toEqual({
        ok: false,
        error: "errors.invalidData",
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(updateShoppingItemMutation).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when update fails", async () => {
      vi.mocked(updateShoppingItemMutation).mockResolvedValueOnce({
        ok: false,
        error: "notFound",
      } as UpdateShoppingItemMutationResult);

      expect(
        await toggleShoppingItemAction({ itemId: 7, isChecked: true })
      ).toEqual({
        ok: false,
        error: "errors.notFound",
      });
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
    });

    it("returns auth translation when requireAdmin throws AuthError", async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(
        new AuthError("notAuthenticated")
      );

      expect(
        await toggleShoppingItemAction({ itemId: 7, isChecked: false })
      ).toEqual({
        ok: false,
        error: "errors.notAuthenticated",
      });
      expect(updateShoppingItemMutation).not.toHaveBeenCalled();
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
    });
  });

  describe("deleteShoppingItemAction", () => {
    it("returns success and revalidates on valid delete", async () => {
      expect(await deleteShoppingItemAction({ itemId: 42 })).toEqual({
        ok: true,
        data: undefined,
        message: "success",
      });
      expect(deleteShoppingItemMutation).toHaveBeenCalledWith(
        expect.anything(),
        42
      );
      expect(revalidateShoppingPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation error for invalid input", async () => {
      expect(
        await deleteShoppingItemAction(
          createUnsafeDeleteInput({ itemId: "oops" })
        )
      ).toEqual({
        ok: false,
        error: "errors.invalidData",
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(deleteShoppingItemMutation).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when delete fails", async () => {
      vi.mocked(deleteShoppingItemMutation).mockResolvedValueOnce({
        ok: false,
        error: "notFound",
      } as DeleteShoppingItemMutationResult);

      expect(await deleteShoppingItemAction({ itemId: 42 })).toEqual({
        ok: false,
        error: "errors.notFound",
      });
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when mutation throws", async () => {
      vi.mocked(deleteShoppingItemMutation).mockRejectedValueOnce(
        new Error("boom")
      );

      expect(await deleteShoppingItemAction({ itemId: 42 })).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateShoppingPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createVisitAction,
  deleteVisitAction,
} from "@/features/visits/server/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createVisit as createVisitMutation,
  deleteVisit as deleteVisitMutation,
} from "@/features/visits/server/mutations";
import { revalidateVisitPaths } from "@/features/visits/server/revalidation";
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

vi.mock("@/features/visits/server/mutations", () => ({
  createVisit: vi.fn(),
  deleteVisit: vi.fn(),
}));

vi.mock("@/features/visits/server/revalidation", () => ({
  revalidateVisitPaths: vi.fn(),
}));

type CreateVisitInput = Parameters<typeof createVisitAction>[0];
type DeleteVisitInput = Parameters<typeof deleteVisitAction>[0];
type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;
type CreateVisitMutationResult = Awaited<ReturnType<typeof createVisitMutation>>;
type DeleteVisitMutationResult = Awaited<ReturnType<typeof deleteVisitMutation>>;

function createValidVisitInput(
  overrides: Partial<CreateVisitInput> = {}
): CreateVisitInput {
  return {
    visitorName: "Svetlana and Filip",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    note: "Bringing the grill",
    ...overrides,
  };
}

function createUnsafeVisitInput(
  overrides: Record<string, unknown>
): CreateVisitInput {
  return {
    ...createValidVisitInput(),
    ...overrides,
  } as unknown as CreateVisitInput;
}

function createUnsafeDeleteInput(
  overrides: Record<string, unknown>
): DeleteVisitInput {
  return {
    visitId: 1,
    ...overrides,
  } as unknown as DeleteVisitInput;
}

function createVisitRecord() {
  return {
    id: 42,
    visitorName: "Svetlana and Filip",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming" as const,
    note: "Bringing the grill",
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
  };
}

describe("features/visits/server/actions", () => {
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
    vi.mocked(createVisitMutation).mockResolvedValue({
      ok: true,
      data: createVisitRecord(),
    } as CreateVisitMutationResult);
    vi.mocked(deleteVisitMutation).mockResolvedValue({
      ok: true,
      data: undefined,
    } as DeleteVisitMutationResult);
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe("createVisitAction", () => {
    it("returns success, forwards displayName, and revalidates", async () => {
      const result = await createVisitAction(createValidVisitInput());

      expect(result).toEqual({
        ok: true,
        data: createVisitRecord(),
      });
      expect(createVisitMutation).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        expect.objectContaining({
          visitorName: "Svetlana and Filip",
          author: "Alice Johnson",
        }),
        expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/)
      );
      expect(revalidateVisitPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation errors for invalid input before auth", async () => {
      const result = await createVisitAction(
        createUnsafeVisitInput({
          visitorName: "   ",
          dateFrom: "not-a-date",
        })
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe("errors.invalidData");
        expect(result.fieldErrors).toMatchObject({
          visitorName: "fieldErrors.visitorName",
          dateFrom: "fieldErrors.dateFrom",
        });
      }

      expect(requireAdmin).not.toHaveBeenCalled();
      expect(createVisitMutation).not.toHaveBeenCalled();
      expect(revalidateVisitPaths).not.toHaveBeenCalled();
    });

    it("returns date range error before auth", async () => {
      const result = await createVisitAction(
        createValidVisitInput({
          dateFrom: "2026-04-12",
          dateTo: "2026-04-10",
        })
      );

      expect(result).toEqual({
        ok: false,
        error: "errors.dateRangeInvalid",
        fieldErrors: {
          dateTo: "errors.dateFromAfterDateTo",
        },
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(createVisitMutation).not.toHaveBeenCalled();
    });

    it("returns translated mutation errors", async () => {
      vi.mocked(createVisitMutation).mockResolvedValueOnce({
        ok: false,
        error: "databaseError",
      } as CreateVisitMutationResult);

      expect(await createVisitAction(createValidVisitInput())).toEqual({
        ok: false,
        error: "errors.databaseError",
      });
      expect(revalidateVisitPaths).not.toHaveBeenCalled();
    });

    it("returns auth translation when requireAdmin throws AuthError", async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new AuthError("forbidden"));

      expect(await createVisitAction(createValidVisitInput())).toEqual({
        ok: false,
        error: "errors.forbidden",
      });
      expect(createVisitMutation).not.toHaveBeenCalled();
      expect(revalidateVisitPaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when mutation throws", async () => {
      vi.mocked(createVisitMutation).mockRejectedValueOnce(new Error("boom"));

      expect(await createVisitAction(createValidVisitInput())).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateVisitPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("deleteVisitAction", () => {
    it("returns success and revalidates on valid delete", async () => {
      expect(await deleteVisitAction({ visitId: 42 })).toEqual({
        ok: true,
        data: undefined,
      });
      expect(deleteVisitMutation).toHaveBeenCalledWith(expect.anything(), 42);
      expect(revalidateVisitPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation error for invalid input", async () => {
      expect(
        await deleteVisitAction(createUnsafeDeleteInput({ visitId: "oops" }))
      ).toEqual({
        ok: false,
        error: "errors.invalidData",
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(deleteVisitMutation).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when delete fails", async () => {
      vi.mocked(deleteVisitMutation).mockResolvedValueOnce({
        ok: false,
        error: "notFound",
      } as DeleteVisitMutationResult);

      expect(await deleteVisitAction({ visitId: 42 })).toEqual({
        ok: false,
        error: "errors.notFound",
      });
      expect(revalidateVisitPaths).not.toHaveBeenCalled();
    });
  });
});

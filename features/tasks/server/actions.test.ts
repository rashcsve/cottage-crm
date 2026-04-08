import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addTaskAction,
  deleteTaskAction,
  toggleTaskAction,
} from "@/features/tasks/server/actions";
import { requireAdmin } from "@/lib/auth/require-admin";
import {
  createTask as createTaskMutation,
  deleteTask as deleteTaskMutation,
  toggleTask as toggleTaskMutation,
} from "@/features/tasks/server/mutations";
import { revalidateTaskPaths } from "@/features/tasks/server/revalidation";
import {
  createCompletedTask,
  createTask,
} from "@/tests/fixtures/task-fixtures";

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

vi.mock("@/features/tasks/server/mutations", () => ({
  createTask: vi.fn(),
  toggleTask: vi.fn(),
  deleteTask: vi.fn(),
}));

vi.mock("@/features/tasks/server/revalidation", () => ({
  revalidateTaskPaths: vi.fn(),
}));

type AddTaskInput = Parameters<typeof addTaskAction>[0];
type ToggleTaskInput = Parameters<typeof toggleTaskAction>[0];
type DeleteTaskInput = Parameters<typeof deleteTaskAction>[0];
type RequireAdminResult = Awaited<ReturnType<typeof requireAdmin>>;

type CreateTaskMutationResult = Awaited<ReturnType<typeof createTaskMutation>>;
type ToggleTaskMutationResult = Awaited<ReturnType<typeof toggleTaskMutation>>;
type DeleteTaskMutationResult = Awaited<ReturnType<typeof deleteTaskMutation>>;

type CreateTaskMutationErrorCode = Extract<
  CreateTaskMutationResult,
  { ok: false }
>["error"];

type ToggleTaskMutationErrorCode = Extract<
  ToggleTaskMutationResult,
  { ok: false }
>["error"];

type DeleteTaskMutationErrorCode = Extract<
  DeleteTaskMutationResult,
  { ok: false }
>["error"];

function createValidAddTaskInput(
  overrides: Partial<AddTaskInput> = {}
): AddTaskInput {
  return {
    title: "New task",
    description: "Task description",
    priority: "high",
    dueDate: "2026-04-08",
    ...overrides,
  };
}

function createUnsafeAddTaskInput(
  overrides: Record<string, unknown>
): AddTaskInput {
  return {
    ...createValidAddTaskInput(),
    ...overrides,
  } as unknown as AddTaskInput;
}

function createUnsafeToggleTaskInput(
  overrides: Record<string, unknown>
): ToggleTaskInput {
  return {
    taskId: 1,
    ...overrides,
  } as unknown as ToggleTaskInput;
}

function createUnsafeDeleteTaskInput(
  overrides: Record<string, unknown>
): DeleteTaskInput {
  return {
    taskId: 1,
    ...overrides,
  } as unknown as DeleteTaskInput;
}

function createCreateTaskSuccess(
  data = createTask()
): CreateTaskMutationResult {
  return {
    ok: true,
    data,
  };
}

function createCreateTaskFailure(
  error: CreateTaskMutationErrorCode
): CreateTaskMutationResult {
  return {
    ok: false,
    error,
  };
}

function createToggleTaskSuccess(): ToggleTaskMutationResult {
  return {
    ok: true,
    data: undefined,
  };
}

function createToggleTaskFailure(
  error: ToggleTaskMutationErrorCode
): ToggleTaskMutationResult {
  return {
    ok: false,
    error,
  };
}

function createDeleteTaskSuccess(): DeleteTaskMutationResult {
  return {
    ok: true,
    data: undefined,
  };
}

function createDeleteTaskFailure(
  error: DeleteTaskMutationErrorCode
): DeleteTaskMutationResult {
  return {
    ok: false,
    error,
  };
}

describe("features/tasks/server/actions", () => {
  const consoleErrorSpy = vi
    .spyOn(console, "error")
    .mockImplementation(() => undefined);

  beforeEach(() => {
    vi.clearAllMocks();

    const adminContext: RequireAdminResult = {
      supabase: {} as RequireAdminResult["supabase"],
      userId: "admin-user-id",
      displayName: "Alice Johnson",
    };

    vi.mocked(requireAdmin).mockResolvedValue(adminContext);
    vi.mocked(createTaskMutation).mockResolvedValue(createCreateTaskSuccess());
    vi.mocked(toggleTaskMutation).mockResolvedValue(createToggleTaskSuccess());
    vi.mocked(deleteTaskMutation).mockResolvedValue(createDeleteTaskSuccess());
  });

  afterEach(() => {
    consoleErrorSpy.mockClear();
  });

  describe("addTaskAction", () => {
    it("returns success and revalidates when task is created", async () => {
      const createdTask = createTask({ id: 42, title: "Created task" });

      vi.mocked(createTaskMutation).mockResolvedValueOnce(
        createCreateTaskSuccess(createdTask)
      );

      const result = await addTaskAction(createValidAddTaskInput());

      expect(result).toEqual({
        ok: true,
        data: createdTask,
      });
      expect(requireAdmin).toHaveBeenCalledTimes(1);
      expect(createTaskMutation).toHaveBeenCalledTimes(1);
      expect(revalidateTaskPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation error with real fieldErrors for invalid input", async () => {
      const result = await addTaskAction(
        createUnsafeAddTaskInput({
          title: "",
          priority: "invalid-priority",
        })
      );

      expect(result.ok).toBe(false);

      if (!result.ok) {
        expect(result.error).toBe("errors.invalidData");
        expect(result.fieldErrors).toBeDefined();
        expect(result.fieldErrors).toHaveProperty("title");
      }

      expect(requireAdmin).not.toHaveBeenCalled();
      expect(createTaskMutation).not.toHaveBeenCalled();
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when createTask returns domain failure", async () => {
      const errorCode: CreateTaskMutationErrorCode = "databaseError";

      vi.mocked(createTaskMutation).mockResolvedValueOnce(
        createCreateTaskFailure(errorCode)
      );

      const result = await addTaskAction(createValidAddTaskInput());

      expect(result).toEqual({
        ok: false,
        error: `errors.${errorCode}`,
      });
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when requireAdmin throws", async () => {
      vi.mocked(requireAdmin).mockRejectedValueOnce(new Error("boom"));

      const result = await addTaskAction(createValidAddTaskInput());

      expect(result).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(createTaskMutation).not.toHaveBeenCalled();
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("returns unexpected error when createTask throws", async () => {
      vi.mocked(createTaskMutation).mockRejectedValueOnce(new Error("boom"));

      const result = await addTaskAction(createValidAddTaskInput());

      expect(result).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it("accepts empty optional fields", async () => {
      const result = await addTaskAction(
        createValidAddTaskInput({
          description: "",
          dueDate: "",
          priority: "medium",
        })
      );

      expect(result.ok).toBe(true);
    });
  });

  describe("toggleTaskAction", () => {
    it("returns success and revalidates on valid toggle", async () => {
      const task = createTask({ id: 11, status: "pending" });

      const result = await toggleTaskAction({ taskId: task.id });

      expect(result).toEqual({
        ok: true,
        data: undefined,
      });
      expect(requireAdmin).toHaveBeenCalledTimes(1);
      expect(toggleTaskMutation).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        task.id
      );
      expect(revalidateTaskPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation error for invalid input", async () => {
      const result = await toggleTaskAction(
        createUnsafeToggleTaskInput({ taskId: "not-a-number" })
      );

      expect(result).toEqual({
        ok: false,
        error: "errors.invalidData",
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(toggleTaskMutation).not.toHaveBeenCalled();
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when toggleTask returns domain failure", async () => {
      const errorCode: ToggleTaskMutationErrorCode = "databaseError";

      vi.mocked(toggleTaskMutation).mockResolvedValueOnce(
        createToggleTaskFailure(errorCode)
      );

      const task = createCompletedTask({ id: 12 });

      const result = await toggleTaskAction({ taskId: task.id });

      expect(result).toEqual({
        ok: false,
        error: `errors.${errorCode}`,
      });
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when toggleTask throws", async () => {
      vi.mocked(toggleTaskMutation).mockRejectedValueOnce(new Error("boom"));

      const result = await toggleTaskAction({ taskId: 1 });

      expect(result).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("deleteTaskAction", () => {
    it("returns success and revalidates on valid delete", async () => {
      const task = createTask({ id: 21 });

      const result = await deleteTaskAction({ taskId: task.id });

      expect(result).toEqual({
        ok: true,
        data: undefined,
      });
      expect(requireAdmin).toHaveBeenCalledTimes(1);
      expect(deleteTaskMutation).toHaveBeenCalledWith(
        expect.anything(),
        "admin-user-id",
        task.id
      );
      expect(revalidateTaskPaths).toHaveBeenCalledTimes(1);
    });

    it("returns validation error for invalid input", async () => {
      const result = await deleteTaskAction(
        createUnsafeDeleteTaskInput({ taskId: "not-a-number" })
      );

      expect(result).toEqual({
        ok: false,
        error: "errors.invalidData",
      });
      expect(requireAdmin).not.toHaveBeenCalled();
      expect(deleteTaskMutation).not.toHaveBeenCalled();
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
    });

    it("returns translated mutation error when deleteTask returns domain failure", async () => {
      const errorCode: DeleteTaskMutationErrorCode = "databaseError";

      vi.mocked(deleteTaskMutation).mockResolvedValueOnce(
        createDeleteTaskFailure(errorCode)
      );

      const task = createTask({ id: 22 });

      const result = await deleteTaskAction({ taskId: task.id });

      expect(result).toEqual({
        ok: false,
        error: `errors.${errorCode}`,
      });
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
    });

    it("returns unexpected error when deleteTask throws", async () => {
      vi.mocked(deleteTaskMutation).mockRejectedValueOnce(new Error("boom"));

      const result = await deleteTaskAction({ taskId: 1 });

      expect(result).toEqual({
        ok: false,
        error: "errors.unexpected",
      });
      expect(revalidateTaskPaths).not.toHaveBeenCalled();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

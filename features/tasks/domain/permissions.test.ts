import { describe, expect, it } from "vitest";
import { createTask } from "@/tests/fixtures/task-fixtures";
import { canModifyTask } from "./permissions";

describe("features/tasks/domain/permissions", () => {
  it("lets a task manager modify any task", () => {
    const task = createTask({ authorId: "someone-else" });

    expect(
      canModifyTask(task, { canManageTasks: true, currentUserId: "user-1" }),
    ).toBe(true);
  });

  it("lets the author modify their own task without manager rights", () => {
    const task = createTask({ authorId: "user-1" });

    expect(
      canModifyTask(task, { canManageTasks: false, currentUserId: "user-1" }),
    ).toBe(true);
  });

  it("denies other users without manager rights", () => {
    const task = createTask({ authorId: "someone-else" });

    expect(
      canModifyTask(task, { canManageTasks: false, currentUserId: "user-1" }),
    ).toBe(false);
  });
});

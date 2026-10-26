import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useRouter } from "@/i18n/navigation";
import { toggleTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { createCompletedTask, createTask } from "@/tests/fixtures/task-fixtures";
import { TaskToggleButton } from "./TaskToggleButton";

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/tasks/server/actions", () => ({
  toggleTaskAction: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockToggleTaskAction = vi.mocked(toggleTaskAction);

describe("TaskToggleButton", () => {
  const refresh = vi.fn();
  const showError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    mockUseRouter.mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh,
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    mockUseToast.mockReturnValue({
      toasts: [],
      showToast: vi.fn(),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: showError,
    } as unknown as ReturnType<typeof useToast>);

    mockToggleTaskAction.mockResolvedValue({
      ok: true,
      data: undefined,
      message: "tasks.toggle.success",
    });
  });

  it("exposes the pending state and refreshes after a successful toggle", async () => {
    const user = userEvent.setup();
    const task = createTask();

    render(
      <TaskToggleButton
        taskId={task.id}
        isDone={false}
        canToggle
        ariaLabel="Mark task as completed: Test Task"
        readOnlyStateLabel="Not completed"
        errorMessage="Toggle failed"
      />,
    );

    const toggle = screen.getByRole("button", {
      name: "Mark task as completed: Test Task",
    });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    await user.click(toggle);

    await waitFor(() => {
      expect(mockToggleTaskAction).toHaveBeenCalledWith({ taskId: task.id });
    });
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("exposes the done state with aria-pressed", () => {
    render(
      <TaskToggleButton
        taskId={createCompletedTask().id}
        isDone
        canToggle
        ariaLabel="Reopen task: Test Task"
        readOnlyStateLabel="Completed"
        errorMessage="Toggle failed"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Reopen task: Test Task" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("renders an interactive toggle when the user can toggle", () => {
    render(
      <TaskToggleButton
        taskId={createTask().id}
        isDone={false}
        canToggle
        ariaLabel="Mark task as completed: Test Task"
        readOnlyStateLabel="Not completed"
        errorMessage="Toggle failed"
      />,
    );

    expect(
      screen.getByRole("button", { name: "Mark task as completed: Test Task" }),
    ).toBeInTheDocument();
  });

  it("shows an error toast and skips refresh when the toggle fails", async () => {
    const user = userEvent.setup();
    mockToggleTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.toggle.error",
    });

    render(
      <TaskToggleButton
        taskId={createTask().id}
        isDone={false}
        canToggle
        ariaLabel="Mark task as completed: Test Task"
        readOnlyStateLabel="Not completed"
        errorMessage="Toggle failed"
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Mark task as completed: Test Task" }),
    );

    await waitFor(() => {
      expect(showError).toHaveBeenCalledWith("tasks.toggle.error");
    });
    expect(refresh).not.toHaveBeenCalled();
  });

  it("announces the state as text when the user cannot toggle", () => {
    render(
      <TaskToggleButton
        taskId={createCompletedTask().id}
        isDone
        canToggle={false}
        ariaLabel="Reopen task: Test Task"
        readOnlyStateLabel="Completed"
        errorMessage="Toggle failed"
      />,
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(
      screen.getByText("Completed").closest('[aria-hidden="true"]'),
    ).toBeNull();
  });
});

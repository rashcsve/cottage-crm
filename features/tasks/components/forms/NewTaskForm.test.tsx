import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addTaskAction } from "@/features/tasks/server/actions";
import { NewTaskForm } from "./NewTaskForm";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/tasks/server/actions", () => ({
  addTaskAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseLocale = vi.mocked(useLocale);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockAddTaskAction = vi.mocked(addTaskAction);

type MockRouter = {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

type MockToastApi = {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

function setupTranslations() {
  mockUseTranslations.mockImplementation((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return ((key: string) => `${prefix}${key}`) as ReturnType<
      typeof useTranslations
    >;
  });
}

function getFormElements() {
  return {
    titleInput: screen.getByLabelText("tasks.form.fields.taskName"),
    descriptionInput: screen.getByLabelText("tasks.form.fields.description"),
    dueDateInput: screen.getByLabelText("tasks.form.fields.dueDate"),
    submitButton: screen.getByRole("button", { name: "tasks.form.submit" }),
    closeButton: screen.getByRole("button", {
      name: "tasks.form.closeComposer",
    }),
  };
}

describe("NewTaskForm", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    setupTranslations();
    mockUseLocale.mockReturnValue("en");

    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    mockUseRouter.mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>
    );

    mockToastApi = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>
    );

    mockAddTaskAction.mockResolvedValue({
      ok: true,
      data: { id: 1 },
    });
  });

  it("renders the full composer UI", () => {
    render(<NewTaskForm onClose={onClose} />);

    expect(screen.getByText("tasks.form.title")).toBeInTheDocument();
    expect(screen.getByText("tasks.form.supportingCopy")).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.taskName")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.dueDate")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.description")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tasks.form.closeComposer" })
    ).toBeInTheDocument();
  });

  it("shows the selected due date preview when a date is entered", async () => {
    render(<NewTaskForm onClose={onClose} />);

    fireEvent.change(screen.getByLabelText("tasks.form.fields.dueDate"), {
      target: { value: "2026-04-10" },
    });

    expect(screen.getByText("tasks.form.selectedDueDate")).toBeInTheDocument();
  });

  it("submits valid form data, redirects to the open list, and closes", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 42 },
      message: "tasks.form.success.custom",
    });

    render(<NewTaskForm onClose={onClose} />);

    const { titleInput, descriptionInput, dueDateInput, submitButton } =
      getFormElements();

    await user.type(titleInput, "Buy groceries");
    await user.type(descriptionInput, "Milk and bread");
    await user.type(dueDateInput, "2026-04-10");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Buy groceries",
        description: "Milk and bread",
        dueDate: "2026-04-10",
        priority: "medium",
      });
    });

    expect(mockToastApi.success).toHaveBeenCalledWith(
      "tasks.form.success.custom"
    );
    expect(mockRouter.replace).toHaveBeenCalledWith("/tasks?filter=open#task-42");
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("falls back to the default success message", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm onClose={onClose} />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "New task");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastApi.success).toHaveBeenCalledWith("tasks.form.success");
    });
  });

  it("maps server field errors, keeps the form open, and shows error toast", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.invalidData",
      fieldErrors: {
        title: "tasks.form.errors.titleRequired",
        dueDate: "tasks.form.errors.invalidDate",
      },
    });

    render(<NewTaskForm onClose={onClose} />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "Valid title");
    await user.click(submitButton);

    expect(
      await screen.findByText("tasks.form.errors.invalidData")
    ).toBeInTheDocument();
    expect(
      screen.getByText("tasks.form.errors.titleRequired")
    ).toBeInTheDocument();
    expect(
      screen.getByText("tasks.form.errors.invalidDate")
    ).toBeInTheDocument();

    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith(
      "tasks.form.errors.invalidData"
    );
    expect(onClose).not.toHaveBeenCalled();
  });

  it("handles thrown action errors", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewTaskForm onClose={onClose} />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "Valid title");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Network failed");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm onClose={onClose} />);

    const { submitButton } = getFormElements();

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTaskAction).not.toHaveBeenCalled();
    });

    expect(screen.getByLabelText("tasks.form.fields.taskName")).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("submits empty optional fields correctly", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm onClose={onClose} />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "Simple task");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Simple task",
        description: "",
        dueDate: undefined,
        priority: "medium",
      });
    });
  });

  it("resets and closes when the close button is pressed", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm onClose={onClose} />);

    const { titleInput, closeButton } = getFormElements();

    await user.type(titleInput, "Task to discard");
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(titleInput).toHaveValue("");
  });
});

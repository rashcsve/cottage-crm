import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addTaskAction } from "@/features/tasks/server/actions";
import { NewTaskForm } from "./NewTaskForm";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/tasks/server/actions", () => ({
  addTaskAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
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
    prioritySelect: screen.getByLabelText("tasks.form.fields.priority"),
    dueDateInput: screen.getByLabelText("tasks.form.fields.dueDate"),
    submitButton: screen.getByRole("button", { name: "tasks.form.submit" }),
  };
}

describe("NewTaskForm", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    vi.clearAllMocks();

    setupTranslations();

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

  it("renders all form fields and submit button", () => {
    render(<NewTaskForm />);

    expect(screen.getByText("tasks.form.eyebrow")).toBeInTheDocument();
    expect(screen.getByText("tasks.form.title")).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.taskName")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.description")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.priority")
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("tasks.form.fields.dueDate")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "tasks.form.submit" })
    ).toBeInTheDocument();
  });

  it("submits valid form data, shows success toast, and resets the form", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "tasks.form.success.custom",
    });

    render(<NewTaskForm />);

    const {
      titleInput,
      descriptionInput,
      prioritySelect,
      dueDateInput,
      submitButton,
    } = getFormElements();

    await user.type(titleInput, "Buy groceries");
    await user.type(descriptionInput, "Milk and bread");
    await user.selectOptions(prioritySelect, "high");
    await user.type(dueDateInput, "2026-04-10");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Buy groceries",
        description: "Milk and bread",
        priority: "high",
        dueDate: "2026-04-10",
      });
    });

    expect(mockToastApi.success).toHaveBeenCalledWith(
      "tasks.form.success.custom"
    );
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
      expect(descriptionInput).toHaveValue("");
      expect(prioritySelect).toHaveValue("medium");
      expect(dueDateInput).toHaveValue("");
    });
  });

  it("falls back to default success message when action does not return one", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
    });

    render(<NewTaskForm />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "New task");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockToastApi.success).toHaveBeenCalledWith("tasks.form.success");
    });

    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
  });

  it("maps server field errors, shows root error, and shows error toast", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.invalidData",
      fieldErrors: {
        title: "tasks.form.errors.titleRequired",
        dueDate: "tasks.form.errors.invalidDate",
      },
    });

    render(<NewTaskForm />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "Valid title");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalled();
    });

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
  });

  it("handles thrown action errors and shows fallback root error", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewTaskForm />);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "Valid title");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Network failed");
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm />);

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

    render(<NewTaskForm />);

    const { titleInput, prioritySelect, submitButton } = getFormElements();

    await user.type(titleInput, "Simple task");
    await user.selectOptions(prioritySelect, "low");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Simple task",
        description: "",
        priority: "low",
        dueDate: undefined,
      });
    });
  });
});

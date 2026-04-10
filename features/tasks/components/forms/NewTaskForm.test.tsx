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

async function openComposer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: "tasks.form.openComposer" })
  );
}

function getFormElements() {
  return {
    titleInput: screen.getByLabelText("tasks.form.fields.taskName"),
    descriptionInput: screen.getByLabelText("tasks.form.fields.description"),
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

  it("renders a collapsed quick-add trigger by default", () => {
    render(<NewTaskForm />);

    expect(
      screen.getByRole("button", { name: "tasks.form.openComposer" })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("tasks.form.fields.taskName")
    ).not.toBeInTheDocument();
  });

  it("opens the full form immediately", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm />);

    await openComposer(user);

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

  it("submits valid form data, redirects to the open list, and collapses", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 42 },
      message: "tasks.form.success.custom",
    });

    render(<NewTaskForm />);

    await openComposer(user);

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

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "tasks.form.openComposer" })
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText("tasks.form.fields.taskName")
      ).not.toBeInTheDocument();
    });
  });

  it("falls back to the default success message", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm />);

    await openComposer(user);

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

    render(<NewTaskForm />);

    await openComposer(user);

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
    expect(
      screen.getByLabelText("tasks.form.fields.taskName")
    ).toBeInTheDocument();
  });

  it("handles thrown action errors", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewTaskForm />);

    await openComposer(user);

    const { titleInput, submitButton } = getFormElements();

    await user.type(titleInput, "Valid title");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Network failed");
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewTaskForm />);

    await openComposer(user);

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

    await openComposer(user);

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
});

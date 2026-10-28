import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addTaskAction } from "@/features/tasks/server/actions";
import { TaskQuickAdd } from "./TaskQuickAdd";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
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

    return ((key: string, values?: Record<string, string>) =>
      values?.title
        ? `${prefix}${key}: ${values.title}`
        : `${prefix}${key}`) as ReturnType<typeof useTranslations>;
  });
}

function getTitleInput() {
  return screen.getByLabelText("tasks.quickAdd.label", { exact: false });
}

function getDescriptionInput() {
  return screen.getByLabelText("tasks.form.fields.description");
}

function getDueDateInput() {
  return screen.getByLabelText("tasks.form.fields.dueDate");
}

function getDetailsToggle() {
  return screen.getByRole("button", {
    name: /tasks\.quickAdd\.(showDetails|hideDetails)/,
  });
}

function getLiveRegion() {
  return screen.getByRole("status");
}

const TITLE_ONLY_PAYLOAD = {
  description: "",
  priority: "medium",
  dueDate: undefined,
};

describe("TaskQuickAdd", () => {
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
  });

  it("renders a labelled title field, a visible submit button and a collapsed details toggle", () => {
    render(<TaskQuickAdd />);

    const input = getTitleInput();
    const toggle = getDetailsToggle();

    expect(input).toHaveAttribute("enterkeyhint", "enter");
    expect(input).toHaveAttribute("placeholder", "tasks.quickAdd.placeholder");
    expect(input).not.toHaveFocus();
    expect(
      screen.getByRole("button", { name: "tasks.quickAdd.submit" })
    ).toBeInTheDocument();
    expect(toggle).toHaveAccessibleName("tasks.quickAdd.showDetails");
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const detailsId = toggle.getAttribute("aria-controls");

    expect(detailsId).toBeTruthy();
    expect(document.getElementById(detailsId ?? "")).not.toBeVisible();
    expect(getDescriptionInput()).not.toBeVisible();
    expect(getDueDateInput()).not.toBeVisible();
  });

  it("has no priority field", () => {
    render(<TaskQuickAdd />);

    expect(
      screen.queryByLabelText("tasks.form.fields.priority")
    ).not.toBeInTheDocument();
  });

  it("renders an empty polite live region from the first render", () => {
    render(<TaskQuickAdd />);

    expect(getLiveRegion()).toHaveTextContent("");
  });

  it("adds a title-only task with Enter using defaults, clears the field, keeps focus and announces it without a toast or refresh", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({ ok: true, data: { id: 1 } });

    render(<TaskQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Mow the lawn{Enter}");

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Mow the lawn",
        ...TITLE_ONLY_PAYLOAD,
      });
    });
    await waitFor(() => {
      expect(input).toHaveValue("");
    });

    expect(input).toHaveFocus();
    expect(getLiveRegion()).toHaveTextContent(
      "tasks.quickAdd.added: Mow the lawn"
    );
    expect(getDetailsToggle()).toHaveAttribute("aria-expanded", "false");
    expect(mockToastApi.success).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("announces again when the same title is added twice", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValue({ ok: true, data: { id: 2 } });

    render(<TaskQuickAdd />);

    await user.click(getTitleInput());
    await user.keyboard("Fix gate{Enter}");

    await waitFor(() => {
      expect(getLiveRegion()).toHaveTextContent("tasks.quickAdd.added: Fix gate");
    });
    const firstAnnouncement = getLiveRegion().firstElementChild;

    await user.keyboard("Fix gate{Enter}");

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(getLiveRegion().firstElementChild).not.toBe(firstAnnouncement);
    });
    expect(getLiveRegion()).toHaveTextContent("tasks.quickAdd.added: Fix gate");
    expect(firstAnnouncement).not.toBeInTheDocument();
  });

  it("opens and closes the details with the keyboard", async () => {
    const user = userEvent.setup();

    render(<TaskQuickAdd />);

    const toggle = getDetailsToggle();

    toggle.focus();
    await user.keyboard("{Enter}");

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAccessibleName("tasks.quickAdd.hideDetails");
    expect(getDescriptionInput()).toBeVisible();
    expect(getDueDateInput()).toBeVisible();

    await user.keyboard(" ");

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAccessibleName("tasks.quickAdd.showDetails");
    expect(getDescriptionInput()).not.toBeVisible();
  });

  it("submits the details with the keyboard, clears them and keeps the details open", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({ ok: true, data: { id: 3 } });

    render(<TaskQuickAdd />);

    await user.click(getDetailsToggle());
    await user.type(getTitleInput(), "Clean gutters");
    await user.type(getDescriptionInput(), "Both sides of the roof");
    await user.type(getDueDateInput(), "2026-11-05");
    await user.click(getTitleInput());
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Clean gutters",
        description: "Both sides of the roof",
        priority: "medium",
        dueDate: "2026-11-05",
      });
    });
    await waitFor(() => {
      expect(getTitleInput()).toHaveValue("");
    });

    expect(getDescriptionInput()).toHaveValue("");
    expect(getDueDateInput()).toHaveValue("");
    expect(getTitleInput()).toHaveFocus();
    expect(getDetailsToggle()).toHaveAttribute("aria-expanded", "true");
    expect(getDescriptionInput()).toBeVisible();
    expect(getLiveRegion()).toHaveTextContent(
      "tasks.quickAdd.added: Clean gutters"
    );
  });

  it("shows the min-length error under the field, keeps the text and focus and does not submit", async () => {
    const user = userEvent.setup();

    render(<TaskQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("ab");
    await user.tab();

    expect(
      screen.queryByText("tasks.form.errors.titleMinLength")
    ).not.toBeInTheDocument();

    await user.click(input);
    await user.keyboard("{Enter}");

    const fieldError = await screen.findByText(
      "tasks.form.errors.titleMinLength"
    );

    expect(mockAddTaskAction).not.toHaveBeenCalled();
    expect(input).toHaveValue("ab");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(fieldError.id);
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("keeps the text and focus and shows the server title error under the field", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.invalidData",
      fieldErrors: { title: "tasks.form.fieldErrors.title" },
    });

    render(<TaskQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Paint fence{Enter}");

    const fieldError = await screen.findByText("tasks.form.fieldErrors.title");

    expect(
      screen.queryByText("tasks.form.errors.invalidData")
    ).not.toBeInTheDocument();
    expect(input).toHaveValue("Paint fence");
    expect(input.getAttribute("aria-describedby")).toContain(fieldError.id);
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(getLiveRegion()).toHaveTextContent("");
    expect(mockToastApi.success).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("opens the details and focuses the field when the server rejects a hidden detail field", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.invalidData",
      fieldErrors: { dueDate: "tasks.form.fieldErrors.dueDate" },
    });

    render(<TaskQuickAdd />);

    await user.click(getTitleInput());
    await user.keyboard("Paint fence{Enter}");

    const fieldError = await screen.findByText("tasks.form.fieldErrors.dueDate");

    expect(fieldError).toBeVisible();
    expect(getDetailsToggle()).toHaveAttribute("aria-expanded", "true");
    expect(getTitleInput()).toHaveValue("Paint fence");
    await waitFor(() => {
      expect(getDueDateInput()).toHaveFocus();
    });
  });

  it("opens the details and focuses the field when client validation rejects a hidden detail field", async () => {
    const user = userEvent.setup();

    render(<TaskQuickAdd />);

    await user.click(getDetailsToggle());
    fireEvent.change(getDescriptionInput(), {
      target: { value: "a".repeat(1001) },
    });
    await user.click(getDetailsToggle());

    expect(getDescriptionInput()).not.toBeVisible();

    await user.click(getTitleInput());
    await user.keyboard("Paint fence{Enter}");

    const fieldError = await screen.findByText(
      "tasks.form.errors.descriptionMaxLength"
    );

    expect(mockAddTaskAction).not.toHaveBeenCalled();
    expect(fieldError).toBeVisible();
    expect(getDetailsToggle()).toHaveAttribute("aria-expanded", "true");
    await waitFor(() => {
      expect(getDescriptionInput()).toHaveFocus();
    });
  });

  it("shows a form-level server error without field errors and keeps the text", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.forbidden",
    });

    render(<TaskQuickAdd />);

    const input = getTitleInput();

    await user.type(input, "Paint fence");
    await user.click(screen.getByRole("button", { name: "tasks.quickAdd.submit" }));

    expect(
      await screen.findByText("tasks.form.errors.forbidden")
    ).toBeInTheDocument();
    expect(input).toHaveValue("Paint fence");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("shows the generic error for a caught exception and keeps the text", async () => {
    const user = userEvent.setup();

    mockAddTaskAction.mockRejectedValueOnce(new Error("Request failed"));

    render(<TaskQuickAdd />);

    const input = getTitleInput();

    await user.type(input, "Paint fence");
    await user.click(screen.getByRole("button", { name: "tasks.quickAdd.submit" }));

    expect(await screen.findByText("tasks.form.error")).toBeInTheDocument();
    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();
    expect(input).toHaveValue("Paint fence");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("blocks a second submit while the first is pending", async () => {
    const user = userEvent.setup();
    let resolveAction: (value: Awaited<ReturnType<typeof addTaskAction>>) => void = () => {};

    mockAddTaskAction.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );

    render(<TaskQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Paint fence{Enter}");

    const pendingButton = await screen.findByRole("button", {
      name: "tasks.form.submitting",
    });

    expect(pendingButton).toBeDisabled();
    expect(input).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(mockAddTaskAction).toHaveBeenCalledTimes(1);

    resolveAction({ ok: true, data: { id: 1 } });

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
    expect(mockAddTaskAction).toHaveBeenCalledTimes(1);
  });
});

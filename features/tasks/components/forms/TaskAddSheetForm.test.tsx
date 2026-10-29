import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { addTaskAction } from "@/features/tasks/server/actions";
import { TaskAddSheetForm } from "./TaskAddSheetForm";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/server/actions", () => ({
  addTaskAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockAddTaskAction = vi.mocked(addTaskAction);

const TODAY_ISO = "2026-10-29";

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
  return screen.getByLabelText("tasks.form.fields.title", { exact: false });
}

function getDescriptionInput() {
  return screen.getByLabelText("tasks.form.fields.description", {
    exact: false,
  });
}

function getChoice(choice: string) {
  return screen.getByRole("radio", { name: `tasks.form.dueChoices.${choice}` });
}

function queryPickDateInput() {
  return screen.queryByLabelText("tasks.form.fields.pickDate", { exact: false });
}

function getSubmitButton() {
  return screen.getByRole("button", { name: "tasks.form.submitSheet" });
}

function renderForm() {
  const onAdded = vi.fn();

  render(<TaskAddSheetForm todayIso={TODAY_ISO} onAdded={onAdded} />);

  return { onAdded };
}

describe("TaskAddSheetForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupTranslations();
  });

  it("renders the task name focused, the due-date chips defaulting to No date, the description and the submit button", async () => {
    renderForm();

    const dueDateGroup = screen.getByRole("group", {
      name: "tasks.form.fields.dueDateChoice",
    });
    expect(within(dueDateGroup).getAllByRole("radio")).toEqual(
      ["today", "tomorrow", "weekend", "pick", "none"].map(getChoice),
    );
    expect(getChoice("none")).toBeChecked();
    expect(queryPickDateInput()).not.toBeInTheDocument();
    expect(getDescriptionInput()).toBeInTheDocument();
    expect(getSubmitButton()).toHaveAttribute("type", "submit");
    expect(
      screen.queryByLabelText("tasks.form.fields.priority"),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(getTitleInput()).toHaveFocus();
    });
  });

  it("adds a task without a due date by default and reports the title", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    mockAddTaskAction.mockResolvedValueOnce({ ok: true, data: { id: 1 } });

    await user.type(getTitleInput(), "Mow the lawn");
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(onAdded).toHaveBeenCalledWith("Mow the lawn");
    });
    expect(mockAddTaskAction).toHaveBeenCalledTimes(1);
    expect(mockAddTaskAction).toHaveBeenCalledWith({
      title: "Mow the lawn",
      description: "",
      priority: "medium",
      dueDate: "",
    });
  });

  it.each([
    { choice: "today", expected: "2026-10-29" },
    { choice: "tomorrow", expected: "2026-10-30" },
    { choice: "weekend", expected: "2026-10-31" },
  ])(
    "submits $expected when $choice is chosen",
    async ({ choice, expected }) => {
      const user = userEvent.setup();
      const { onAdded } = renderForm();

      mockAddTaskAction.mockResolvedValueOnce({ ok: true, data: { id: 2 } });

      await user.type(getTitleInput(), "Check the chimney");
      await user.click(getChoice(choice));
      await user.type(getDescriptionInput(), "Before winter");
      await user.click(getSubmitButton());

      await waitFor(() => {
        expect(onAdded).toHaveBeenCalledWith("Check the chimney");
      });
      expect(mockAddTaskAction).toHaveBeenCalledWith({
        title: "Check the chimney",
        description: "Before winter",
        priority: "medium",
        dueDate: expected,
      });
    },
  );

  it("reveals a focused date input for Pick date, submits the picked date and hides it again for another choice", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    mockAddTaskAction.mockResolvedValueOnce({ ok: true, data: { id: 3 } });

    await user.type(getTitleInput(), "Clean gutters");
    await user.click(getChoice("pick"));

    const pickDateInput = queryPickDateInput();

    expect(pickDateInput).toHaveAttribute("type", "date");
    await waitFor(() => {
      expect(pickDateInput).toHaveFocus();
    });

    await user.click(getChoice("tomorrow"));

    expect(queryPickDateInput()).not.toBeInTheDocument();

    await user.click(getChoice("pick"));
    await user.type(queryPickDateInput() as HTMLElement, "2026-11-15");
    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(onAdded).toHaveBeenCalledWith("Clean gutters");
    });
    expect(mockAddTaskAction).toHaveBeenCalledWith({
      title: "Clean gutters",
      description: "",
      priority: "medium",
      dueDate: "2026-11-15",
    });
  });

  it("moves between due-date chips with the arrow keys", async () => {
    const user = userEvent.setup();

    renderForm();

    getChoice("none").focus();
    await user.keyboard("{ArrowLeft}");

    expect(getChoice("pick")).toBeChecked();
  });

  it("shows the min-length error on blur and does not submit a too-short name", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    await user.type(getTitleInput(), "ab");
    await user.tab();

    const fieldError = await screen.findByText(
      "tasks.form.errors.titleMinLength",
    );

    expect(getTitleInput()).toHaveAttribute("aria-invalid", "true");
    expect(getTitleInput().getAttribute("aria-describedby")).toContain(
      fieldError.id,
    );

    await user.click(getSubmitButton());

    expect(mockAddTaskAction).not.toHaveBeenCalled();
    expect(onAdded).not.toHaveBeenCalled();
    expect(getTitleInput()).toHaveValue("ab");
  });

  it("shows the server title error under the field, focuses it and keeps the sheet's values", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.invalidData",
      fieldErrors: { title: "tasks.form.fieldErrors.title" },
    });

    await user.type(getTitleInput(), "Paint fence");
    await user.click(getChoice("tomorrow"));
    await user.click(getSubmitButton());

    const fieldError = await screen.findByText("tasks.form.fieldErrors.title");

    expect(getTitleInput().getAttribute("aria-describedby")).toContain(
      fieldError.id,
    );
    expect(
      screen.queryByText("tasks.form.errors.invalidData"),
    ).not.toBeInTheDocument();
    await waitFor(() => {
      expect(getTitleInput()).toHaveFocus();
    });
    expect(getTitleInput()).toHaveValue("Paint fence");
    expect(getChoice("tomorrow")).toBeChecked();
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("shows a server due-date error under the picked date input", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.invalidData",
      fieldErrors: { dueDate: "tasks.form.fieldErrors.dueDate" },
    });

    await user.type(getTitleInput(), "Paint fence");
    await user.click(getChoice("pick"));
    await user.type(queryPickDateInput() as HTMLElement, "2026-11-15");
    await user.click(getSubmitButton());

    const fieldError = await screen.findByText("tasks.form.fieldErrors.dueDate");

    expect(queryPickDateInput()?.getAttribute("aria-describedby")).toContain(
      fieldError.id,
    );
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("shows a form-level server error and keeps the values", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    mockAddTaskAction.mockResolvedValueOnce({
      ok: false,
      error: "tasks.form.errors.forbidden",
    });

    await user.type(getTitleInput(), "Paint fence");
    await user.click(getSubmitButton());

    expect(
      await screen.findByText("tasks.form.errors.forbidden"),
    ).toBeInTheDocument();
    expect(getTitleInput()).toHaveValue("Paint fence");
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("shows the generic error for a caught exception without leaking its message", async () => {
    const user = userEvent.setup();
    const { onAdded } = renderForm();

    mockAddTaskAction.mockRejectedValueOnce(new Error("Request failed"));

    await user.type(getTitleInput(), "Paint fence");
    await user.click(getSubmitButton());

    expect(await screen.findByText("tasks.form.error")).toBeInTheDocument();
    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();
    expect(getTitleInput()).toHaveValue("Paint fence");
    expect(onAdded).not.toHaveBeenCalled();
  });

  it("disables the submit button while the action is pending and submits only once", async () => {
    const user = userEvent.setup();
    let resolveAction: (
      value: Awaited<ReturnType<typeof addTaskAction>>,
    ) => void = () => {};
    const { onAdded } = renderForm();

    mockAddTaskAction.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        }),
    );

    await user.type(getTitleInput(), "Paint fence");
    await user.click(getSubmitButton());

    const pendingButton = await screen.findByRole("button", {
      name: "tasks.form.submitting",
    });

    expect(pendingButton).toBeDisabled();

    await user.click(getTitleInput());
    await user.keyboard("{Enter}");

    expect(mockAddTaskAction).toHaveBeenCalledTimes(1);

    resolveAction({ ok: true, data: { id: 1 } });

    await waitFor(() => {
      expect(onAdded).toHaveBeenCalledTimes(1);
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/shared/Toast/useToast";
import { createVisitAction } from "@/features/visits/server/actions";
import { NewVisitForm } from "./NewVisitForm";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/visits/server/actions", () => ({
  createVisitAction: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);
const mockUseToast = vi.mocked(useToast);
const mockCreateVisitAction = vi.mocked(createVisitAction);

type MockToastApi = {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

function setupTranslations() {
  mockUseLocale.mockReturnValue("en");
  mockUseTranslations.mockImplementation((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return ((key: string, values?: Record<string, string | number>) => {
      if (!values) {
        return `${prefix}${key}`;
      }

      const suffix = Object.values(values).join(" | ");
      return `${prefix}${key}:${suffix}`;
    }) as ReturnType<typeof useTranslations>;
  });
}

function getFormElements() {
  return {
    visitorNameInput: screen.getByLabelText("visits.form.visitorName"),
    dateFromInput: screen.getByLabelText("visits.form.dateFrom"),
    dateToInput: screen.getByLabelText("visits.form.dateTo"),
    noteInput: screen.getByLabelText("visits.form.note"),
    submitButton: screen.getByRole("button", { name: "visits.form.submit" }),
  };
}

function setDateInputValue(element: HTMLElement, value: string) {
  fireEvent.change(element, {
    target: { value },
  });
}

function renderForm(
  overrides: Partial<ComponentProps<typeof NewVisitForm>> = {},
) {
  const props: ComponentProps<typeof NewVisitForm> = {
    draftRange: null,
    currentUserName: "Svetlana Admin",
    onClose: vi.fn(),
    onCreateSuccess: vi.fn(),
    ...overrides,
  };

  render(<NewVisitForm {...props} />);

  return props;
}

describe("NewVisitForm", () => {
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    vi.clearAllMocks();
    setupTranslations();

    mockToastApi = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>,
    );
  });

  it("renders the composer and prefills the selected range", async () => {
    renderForm({
      draftRange: {
        dateFrom: "2026-04-12",
        dateTo: "2026-04-14",
      },
    });

    expect(screen.getByText("visits.form.title")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "visits.form.closeComposer" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("visits.form.visitorName")).toHaveValue(
      "Svetlana Admin",
    );

    await waitFor(() => {
      expect(screen.getByLabelText("visits.form.dateFrom")).toHaveValue(
        "2026-04-12",
      );
      expect(screen.getByLabelText("visits.form.dateTo")).toHaveValue(
        "2026-04-14",
      );
    });
  });

  it("submits valid form data, normalizes an empty note, and reports success", async () => {
    const user = userEvent.setup();
    const props = renderForm();

    mockCreateVisitAction.mockResolvedValueOnce({
      ok: true,
      data: {
        id: 1,
        visitorName: "Eva Novak",
        dateFrom: "2026-04-12",
        dateTo: "2026-04-14",
        status: "upcoming",
        note: null,
        author: "Admin",
        authorId: "user-1",
        createdAt: "2026-04-09T10:00:00.000Z",
      },
      message: "visits.form.success.custom",
    });

    const {
      visitorNameInput,
      dateFromInput,
      dateToInput,
      submitButton,
      noteInput,
    } = getFormElements();

    await user.clear(visitorNameInput);
    await user.type(visitorNameInput, "Eva Novak");
    setDateInputValue(dateFromInput, "2026-04-12");
    setDateInputValue(dateToInput, "2026-04-14");
    await user.type(noteInput, "   ");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateVisitAction).toHaveBeenCalledWith({
        visitorName: "Eva Novak",
        dateFrom: "2026-04-12",
        dateTo: "2026-04-14",
        note: null,
      });
    });

    expect(mockToastApi.success).toHaveBeenCalledWith(
      "visits.form.success.custom",
    );
    expect(props.onCreateSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        visitorName: "Eva Novak",
      }),
    );
  });

  it("maps server field errors and shows the root error", async () => {
    const user = userEvent.setup();

    mockCreateVisitAction.mockResolvedValueOnce({
      ok: false,
      error: "visits.form.errors.invalidData",
      fieldErrors: {
        visitorName: "visits.form.errors.visitorNameRequired",
        dateTo: "visits.form.errors.dateFromAfterDateTo",
      },
    });

    renderForm();

    const {
      visitorNameInput,
      dateFromInput,
      dateToInput,
      submitButton,
    } =
      getFormElements();

    await user.clear(visitorNameInput);
    await user.type(visitorNameInput, "Eva Novak");
    setDateInputValue(dateFromInput, "2026-04-12");
    setDateInputValue(dateToInput, "2026-04-14");
    await user.click(submitButton);

    expect(
      await screen.findByText("visits.form.errors.invalidData"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.form.errors.visitorNameRequired"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.form.errors.dateFromAfterDateTo"),
    ).toBeInTheDocument();
    expect(visitorNameInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith(
      "visits.form.errors.invalidData",
    );
  });

  it("adjusts the end date when the start date moves forward", async () => {
    renderForm({
      draftRange: {
        dateFrom: "2026-04-12",
        dateTo: "2026-04-12",
      },
    });

    const { dateFromInput, dateToInput } = getFormElements();

    setDateInputValue(dateFromInput, "2026-04-15");

    await waitFor(() => {
      expect(dateToInput).toHaveValue("2026-04-15");
    });
  });

  it("preserves typed values when the draft range changes", async () => {
    const user = userEvent.setup();
    const rendered = render(
      <NewVisitForm
        draftRange={{
          dateFrom: "2026-04-12",
          dateTo: "2026-04-12",
        }}
        onClose={vi.fn()}
        onCreateSuccess={vi.fn()}
      />,
    );

    const {
      visitorNameInput,
      dateFromInput,
      dateToInput,
      noteInput,
    } =
      getFormElements();

    await user.clear(visitorNameInput);
    await user.type(visitorNameInput, "Eva Novak");
    await user.type(noteInput, "Bring spare keys");

    rendered.rerender(
      <NewVisitForm
        draftRange={{
          dateFrom: "2026-04-19",
          dateTo: "2026-04-21",
        }}
        onClose={vi.fn()}
        onCreateSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(dateFromInput).toHaveValue("2026-04-19");
      expect(dateToInput).toHaveValue("2026-04-21");
    });

    expect(visitorNameInput).toHaveValue("Eva Novak");
    expect(noteInput).toHaveValue("Bring spare keys");
  });

  it("blocks submit when the selected range ends before it starts", async () => {
    const user = userEvent.setup();

    renderForm();

    const {
      visitorNameInput,
      dateFromInput,
      dateToInput,
      submitButton,
    } =
      getFormElements();

    await user.clear(visitorNameInput);
    await user.type(visitorNameInput, "Eva Novak");
    setDateInputValue(dateToInput, "2026-04-12");
    setDateInputValue(dateFromInput, "2026-04-15");
    setDateInputValue(dateToInput, "2026-04-12");
    await user.click(submitButton);

    expect(mockCreateVisitAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("visits.form.errors.dateFromAfterDateTo"),
    ).toBeInTheDocument();
  });

  it("calls onClose when the composer close button is clicked", async () => {
    const user = userEvent.setup();
    const props = renderForm();

    await user.click(
      screen.getByRole("button", { name: "visits.form.closeComposer" }),
    );

    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it("allows editing the prefilled visitor name", async () => {
    const user = userEvent.setup();

    renderForm();

    const { visitorNameInput } = getFormElements();

    await user.clear(visitorNameInput);
    await user.type(visitorNameInput, "Eva Novak");

    expect(visitorNameInput).toHaveValue("Eva Novak");
  });
});

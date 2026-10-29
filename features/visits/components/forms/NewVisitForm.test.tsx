import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useToast } from "@/shared/Toast/useToast";
import { createVisitAction } from "@/features/visits/server/actions";
import type { Couple } from "@/features/visits/domain/couples";
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
    dateFromInput: screen.getByLabelText("visits.form.dateFrom", {
      exact: false,
    }),
    dateToInput: screen.getByLabelText("visits.form.dateTo", {
      exact: false,
    }),
    noteInput: screen.getByLabelText("visits.form.note"),
    submitButton: screen.getByRole("button", { name: "visits.form.submit" }),
  };
}

async function waitForCouplePickerAutoFocus() {
  await waitFor(() => {
    expect(screen.getAllByRole("radio")[0]).toHaveFocus();
  });
}

function setDateInputValue(element: HTMLElement, value: string) {
  fireEvent.change(element, {
    target: { value },
  });
}

const TEST_COUPLES: Couple[] = [
  { id: "couple-1", label: "Jana a Tomáš" },
  { id: "couple-2", label: "Eva a Karel" },
  { id: "couple-3", label: "Lucie a Jakub" },
  { id: "couple-4", label: "Babička s dědou" },
  { id: "admin", label: "Admin" },
];

function renderForm(
  overrides: Partial<ComponentProps<typeof NewVisitForm>> = {},
) {
  const props: ComponentProps<typeof NewVisitForm> = {
    draftRange: null,
    currentUserName: "Jana Admin",
    currentUserCouple: "couple-1",
    couples: TEST_COUPLES,
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
    mockCreateVisitAction.mockReset();
    setupTranslations();

    mockToastApi = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>,
    );
  });

  it("prefills the selected range and leaves the title and close to the panel", async () => {
    renderForm({
      draftRange: {
        dateFrom: "2026-04-12",
        dateTo: "2026-04-14",
      },
    });

    expect(screen.queryByText("visits.form.title")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "visits.form.closeComposer" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/visits\.form\.selectedRange/)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByLabelText("visits.form.dateFrom", { exact: false }),
      ).toHaveValue("2026-04-12");
      expect(
        screen.getByLabelText("visits.form.dateTo", { exact: false }),
      ).toHaveValue("2026-04-14");
    });
  });

  it("submits the picked couple as the visitor name, normalizes an empty note, and reports success", async () => {
    const user = userEvent.setup();
    const props = renderForm();

    mockCreateVisitAction.mockResolvedValueOnce({
      ok: true,
      data: {
        id: 1,
        visitorName: "Eva a Karel",
        couple: "couple-2",
        coupleLabel: "Eva a Karel",
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

    const { dateFromInput, dateToInput, submitButton, noteInput } =
      getFormElements();

    await waitForCouplePickerAutoFocus();
    await user.click(screen.getByRole("radio", { name: "Eva a Karel" }));
    setDateInputValue(dateFromInput, "2026-04-12");
    setDateInputValue(dateToInput, "2026-04-14");
    await user.type(noteInput, "   ");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateVisitAction).toHaveBeenCalledWith({
        visitorName: "Eva a Karel",
        couple: "couple-2",
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
        visitorName: "Eva a Karel",
      }),
    );
  });

  it("maps server field errors and shows the root error", async () => {
    const user = userEvent.setup();

    mockCreateVisitAction.mockResolvedValueOnce({
      ok: false,
      error: "visits.form.errors.invalidData",
      fieldErrors: {
        dateTo: "visits.form.errors.dateFromAfterDateTo",
      },
    });

    renderForm();

    const { dateFromInput, dateToInput, submitButton } = getFormElements();

    setDateInputValue(dateFromInput, "2026-04-12");
    setDateInputValue(dateToInput, "2026-04-14");
    await user.click(submitButton);

    expect(
      await screen.findByText("visits.form.errors.invalidData"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.form.errors.dateFromAfterDateTo"),
    ).toBeInTheDocument();
    expect(dateToInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).not.toHaveBeenCalled();
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
        currentUserCouple={null}
        couples={TEST_COUPLES}
        onCreateSuccess={vi.fn()}
      />,
    );

    const { dateFromInput, dateToInput, noteInput } = getFormElements();

    await waitForCouplePickerAutoFocus();
    await user.type(noteInput, "Bring spare keys");

    rendered.rerender(
      <NewVisitForm
        draftRange={{
          dateFrom: "2026-04-19",
          dateTo: "2026-04-21",
        }}
        currentUserCouple={null}
        couples={TEST_COUPLES}
        onCreateSuccess={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(dateFromInput).toHaveValue("2026-04-19");
      expect(dateToInput).toHaveValue("2026-04-21");
    });

    expect(noteInput).toHaveValue("Bring spare keys");
  });

  it("blocks submit when the selected range ends before it starts", async () => {
    const user = userEvent.setup();

    renderForm();

    const { dateFromInput, dateToInput, submitButton } = getFormElements();

    setDateInputValue(dateToInput, "2026-04-12");
    setDateInputValue(dateFromInput, "2026-04-15");
    setDateInputValue(dateToInput, "2026-04-12");
    await user.click(submitButton);

    expect(mockCreateVisitAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("visits.form.errors.dateFromAfterDateTo"),
    ).toBeInTheDocument();
  });

  it("does not flag the couple while focus moves off an unpicked couple", async () => {
    renderForm({ currentUserCouple: null });

    const [firstCouple] = screen.getAllByRole("radio");
    await waitForCouplePickerAutoFocus();
    fireEvent.blur(firstCouple);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(
      screen.queryByText("visits.form.errors.coupleRequired"),
    ).not.toBeInTheDocument();
  });

  it("clears the couple error on submit as soon as a couple is picked", async () => {
    const user = userEvent.setup();

    renderForm({
      currentUserCouple: null,
      draftRange: { dateFrom: "2026-04-12", dateTo: "2026-04-14" },
    });

    await user.click(getFormElements().submitButton);
    expect(
      await screen.findByText("visits.form.errors.coupleRequired"),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Eva a Karel" }));

    await waitFor(() => {
      expect(
        screen.queryByText("visits.form.errors.coupleRequired"),
      ).not.toBeInTheDocument();
    });
  });

  it("shows the calendar draft hint with an icon next to the selected dates", () => {
    renderForm({
      draftRange: { dateFrom: "2026-04-12", dateTo: "2026-04-12" },
    });

    const hint = screen.getByText("visits.calendar.selectedDayHintEditing");

    expect(hint).toHaveClass("text-ink-secondary");
    expect(
      hint.parentElement?.querySelector("svg[aria-hidden='true']"),
    ).not.toBeNull();
  });

  it("hides the visitor name field when there are couples to pick", () => {
    renderForm();

    expect(
      screen.queryByLabelText("visits.form.visitorName", { exact: false }),
    ).not.toBeInTheDocument();
  });

  it("shows the visitor name field when there are no couples", () => {
    renderForm({ couples: [] });

    expect(
      screen.getByLabelText("visits.form.visitorName", { exact: false }),
    ).toHaveValue("Jana Admin");
  });

  it("shows a radio for each couple label it is given", () => {
    renderForm();

    expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual(
      ["couple-1", "couple-2", "couple-3", "couple-4", "admin"],
    );
    for (const couple of TEST_COUPLES) {
      expect(screen.getByRole("radio", { name: couple.label })).toBeInTheDocument();
    }
  });

  it("preselects the user's couple and leaves none picked without one", () => {
    const { unmount } = render(
      <NewVisitForm
        draftRange={null}
        currentUserName="Jana Admin"
        currentUserCouple="couple-2"
        couples={TEST_COUPLES}
        onCreateSuccess={vi.fn()}
      />,
    );

    expect(screen.getByRole("radio", { name: "Eva a Karel" })).toBeChecked();

    unmount();
    renderForm({ currentUserCouple: null });

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }
  });

  it("makes the user pick a couple when their own couple is not offered", async () => {
    const user = userEvent.setup();
    renderForm({
      currentUserCouple: "couple-3",
      couples: TEST_COUPLES.filter((couple) => couple.id !== "couple-3"),
    });

    for (const radio of screen.getAllByRole("radio")) {
      expect(radio).not.toBeChecked();
    }

    const { dateFromInput, submitButton } = getFormElements();
    setDateInputValue(dateFromInput, "2026-04-14");
    await user.click(submitButton);

    expect(
      await screen.findAllByText("visits.form.errors.coupleRequired"),
    ).not.toHaveLength(0);
    expect(mockCreateVisitAction).not.toHaveBeenCalled();
  });

  it("explains and blocks saving instead of booking as admin when there are no couples to pick", () => {
    renderForm({ couples: [] });

    expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    expect(
      screen.getByText("visits.form.errors.couplesUnavailable"),
    ).toBeInTheDocument();
    expect(getFormElements().submitButton).toBeDisabled();
  });

  it("marks the couple group invalid and describes each radio once when the server rejects the couple", async () => {
    const user = userEvent.setup();
    mockCreateVisitAction.mockResolvedValueOnce({
      ok: false,
      error: "visits.form.errors.invalidData",
      fieldErrors: { couple: "visits.form.errors.coupleRequired" },
    });
    renderForm();

    const { dateFromInput, submitButton } = getFormElements();
    setDateInputValue(dateFromInput, "2026-04-14");
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: "Jana a Tomáš" })).toHaveAccessibleDescription(
        "visits.form.errors.coupleRequired",
      );
    });
    const group = screen.getByRole("radiogroup", { name: /visits\.form\.couple/ });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).not.toHaveAttribute("aria-describedby");
  });

  it.each([
    ["Friday", "2026-04-17"],
    ["Saturday", "2026-04-18"],
  ])("ends a visit starting on %s on Sunday, and the end stays editable", async (_day, start) => {
    renderForm();

    const { dateFromInput, dateToInput } = getFormElements();
    setDateInputValue(dateFromInput, start);

    await waitFor(() => {
      expect(dateToInput).toHaveValue("2026-04-19");
    });

    setDateInputValue(dateToInput, start);

    expect(dateToInput).toHaveValue(start);
  });

  it("shows the server message when the couple is already booked", async () => {
    const user = userEvent.setup();
    mockCreateVisitAction.mockResolvedValueOnce({
      ok: false,
      error: "visits.form.errors.coupleAlreadyBooked",
      fieldErrors: {
        couple: "visits.form.errors.coupleOverlapsVisit",
        dateFrom: "visits.form.errors.coupleOverlapsVisit",
      },
    });
    renderForm();

    const { dateFromInput, submitButton } = getFormElements();
    setDateInputValue(dateFromInput, "2026-04-14");
    await user.click(submitButton);

    expect(
      await screen.findByText("visits.form.errors.coupleAlreadyBooked"),
    ).toBeInTheDocument();
    expect(dateFromInput).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("radiogroup")).toHaveAttribute("aria-invalid", "true");
    const pickedCouple = screen.getByRole("radio", { name: "Jana a Tomáš" });
    await waitFor(() => {
      expect(pickedCouple).toHaveFocus();
    });
  });
});

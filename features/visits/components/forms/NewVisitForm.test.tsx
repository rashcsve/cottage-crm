import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { createVisitAction } from "@/features/visits/server/actions";
import { NewVisitForm } from "./NewVisitForm";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/visits/server/actions", () => ({
  createVisitAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockCreateVisitAction = vi.mocked(createVisitAction);

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
    visitorNameInput: screen.getByLabelText("visits.form.visitorName"),
    dateFromInput: screen.getByLabelText("visits.form.dateFrom"),
    dateToInput: screen.getByLabelText("visits.form.dateTo"),
    noteInput: screen.getByLabelText("visits.form.note"),
    submitButton: screen.getByRole("button", { name: "visits.form.submit" }),
  };
}

describe("NewVisitForm", () => {
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

  it("renders the visit form fields", () => {
    render(<NewVisitForm />);

    const {
      visitorNameInput,
      dateFromInput,
      dateToInput,
      noteInput,
      submitButton,
    } = getFormElements();

    expect(visitorNameInput).toBeInTheDocument();
    expect(dateFromInput).toBeInTheDocument();
    expect(dateToInput).toBeInTheDocument();
    expect(noteInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
  });

  it("submits valid form data, normalizes an empty note, and refreshes the route", async () => {
    const user = userEvent.setup();

    mockCreateVisitAction.mockResolvedValueOnce({
      ok: true,
      data: {
        id: 1,
        visitorName: "Eva Novak",
        dateFrom: "2026-04-12",
        dateTo: "2026-04-14",
        note: null,
        author: "Admin",
        authorId: "user-1",
        createdAt: "2026-04-09T10:00:00.000Z",
      },
      message: "visits.form.success.custom",
    });

    render(<NewVisitForm />);

    const {
      visitorNameInput,
      dateFromInput,
      dateToInput,
      submitButton,
      noteInput,
    } = getFormElements();

    await user.type(visitorNameInput, "Eva Novak");
    await user.type(dateFromInput, "2026-04-12");
    await user.type(dateToInput, "2026-04-14");
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
      "visits.form.success.custom"
    );
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(visitorNameInput).toHaveValue("");
      expect(dateFromInput).toHaveValue("");
      expect(dateToInput).toHaveValue("");
      expect(noteInput).toHaveValue("");
    });
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

    render(<NewVisitForm />);

    const { visitorNameInput, dateFromInput, dateToInput, submitButton } =
      getFormElements();

    await user.type(visitorNameInput, "Eva Novak");
    await user.type(dateFromInput, "2026-04-12");
    await user.type(dateToInput, "2026-04-14");
    await user.click(submitButton);

    expect(
      await screen.findByText("visits.form.errors.invalidData")
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.form.errors.visitorNameRequired")
    ).toBeInTheDocument();
    expect(
      screen.getByText("visits.form.errors.dateFromAfterDateTo")
    ).toBeInTheDocument();
    expect(visitorNameInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith(
      "visits.form.errors.invalidData"
    );
  });

  it("handles thrown action errors and shows a fallback error message", async () => {
    const user = userEvent.setup();
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    mockCreateVisitAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewVisitForm />);

    const { visitorNameInput, dateFromInput, dateToInput, submitButton } =
      getFormElements();

    await user.type(visitorNameInput, "Eva Novak");
    await user.type(dateFromInput, "2026-04-12");
    await user.type(dateToInput, "2026-04-14");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Network failed");

    consoleErrorSpy.mockRestore();
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewVisitForm />);

    const { submitButton, visitorNameInput } = getFormElements();

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockCreateVisitAction).not.toHaveBeenCalled();
    });

    expect(visitorNameInput).toHaveAttribute("aria-invalid", "true");
  });
});

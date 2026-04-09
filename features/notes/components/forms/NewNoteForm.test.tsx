import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addNoteAction } from "@/features/notes/server/actions";
import { NewNoteForm } from "./NewNoteForm";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/notes/server/actions", () => ({
  addNoteAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockAddNoteAction = vi.mocked(addNoteAction);

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

describe("NewNoteForm", () => {
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

  it("submits valid form data, refreshes the route, and resets the form", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "notes.form.success.custom",
    });

    render(<NewNoteForm />);

    const contentInput = screen.getByLabelText("notes.form.fields.content");
    const submitButton = screen.getByRole("button", {
      name: "notes.form.submit",
    });

    await user.type(contentInput, "Remember to call the gardener.");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddNoteAction).toHaveBeenCalledWith({
        content: "Remember to call the gardener.",
      });
    });

    expect(mockToastApi.success).toHaveBeenCalledWith(
      "notes.form.success.custom"
    );
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(contentInput).toHaveValue("");
    });
  });

  it("maps server errors and shows the error toast", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: false,
      error: "notes.form.error",
      fieldErrors: {
        content: "notes.form.errors.contentRequired",
      },
    });

    render(<NewNoteForm />);

    const contentInput = screen.getByLabelText("notes.form.fields.content");
    const submitButton = screen.getByRole("button", {
      name: "notes.form.submit",
    });

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("notes.form.error")).toBeInTheDocument();
    expect(
      screen.getByText("notes.form.errors.contentRequired")
    ).toBeInTheDocument();
    expect(contentInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith("notes.form.error");
  });
});

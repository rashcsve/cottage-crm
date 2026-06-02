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

    return ((key: string) => `${prefix}${key}`) as ReturnType<typeof useTranslations>;
  });
}

function getFormElements() {
  return {
    contentInput: screen.getByLabelText("notes.form.fields.content"),
    photosInput: screen.getByLabelText("notes.form.fields.photos"),
    submitButton: screen.getByRole("button", { name: "notes.form.submit" }),
  };
}

describe("NewNoteForm", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;
  let mockOnClose: () => void;

  beforeEach(() => {
    vi.clearAllMocks();

    setupTranslations();

    mockOnClose = vi.fn();

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

    vi.spyOn(URL, "createObjectURL").mockImplementation(
      () => "blob:note-photo-preview"
    );
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);
  });

  it("renders the form composer with content and photos fields", () => {
    render(<NewNoteForm onClose={mockOnClose} />);

    expect(screen.getByText("notes.form.eyebrow")).toBeInTheDocument();
    expect(screen.getByText("notes.form.title")).toBeInTheDocument();
    expect(screen.getByText("notes.form.supportingCopy")).toBeInTheDocument();
    expect(
      screen.getByLabelText("notes.form.fields.content")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "notes.form.closeComposer" })
    ).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm onClose={mockOnClose} />);

    await user.click(
      screen.getByRole("button", { name: "notes.form.closeComposer" })
    );

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("submits valid form data, calls onClose, refreshes the route", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "notes.form.success.custom",
    });

    render(<NewNoteForm onClose={mockOnClose} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Remember to call the gardener.");
    await user.click(submitButton);

    await waitFor(() => {
      const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

      expect(submittedFormData).toBeInstanceOf(FormData);
      expect(submittedFormData.get("content")).toBe(
        "Remember to call the gardener."
      );
      expect(submittedFormData.getAll("photos")).toHaveLength(0);
    });

    expect(mockToastApi.success).toHaveBeenCalledWith(
      "notes.form.success.custom"
    );
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/notes#note-1");
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("maps server errors, keeps the form open, and shows the error toast", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: false,
      error: "notes.form.error",
      fieldErrors: {
        content: "notes.form.errors.contentRequired",
      },
    });

    render(<NewNoteForm onClose={mockOnClose} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("notes.form.error")).toBeInTheDocument();
    expect(
      screen.getByText("notes.form.errors.contentRequired")
    ).toBeInTheDocument();
    expect(contentInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith("notes.form.error");
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("adds and removes photo previews before submit", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    render(<NewNoteForm onClose={mockOnClose} />);

    const { photosInput } = getFormElements();

    await user.upload(photosInput, photo);

    expect(
      screen.getByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("notes.form.fields.selectedPhotosCount")
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "notes.form.fields.removePhoto" })
    );

    expect(
      screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).not.toBeInTheDocument();
  });

  it("maps server photo errors and keeps the form open", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: false,
      error: "notes.form.error",
      fieldErrors: {
        photos: "notes.form.fields.errors.photoInvalidType",
      },
    });

    render(<NewNoteForm onClose={mockOnClose} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("notes.form.fields.errors.photoInvalidType")
    ).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("handles thrown action errors", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewNoteForm onClose={mockOnClose} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Network failed");
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm onClose={mockOnClose} />);

    await user.click(
      screen.getByRole("button", { name: "notes.form.submit" })
    );

    expect(mockAddNoteAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("notes.form.fields.errors.required")
    ).toBeInTheDocument();
  });
});

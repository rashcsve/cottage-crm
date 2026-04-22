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

async function openComposer(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: "notes.form.openComposer" })
  );
}

function getFormElements() {
  return {
    contentInput: screen.getByLabelText("notes.form.fields.content"),
    submitButton: screen.getByRole("button", { name: "notes.form.submit" }),
  };
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

  it("renders a collapsed quick-add trigger by default", () => {
    render(<NewNoteForm />);

    expect(
      screen.getByRole("button", { name: "notes.form.openComposer" })
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText("notes.form.fields.content")
    ).not.toBeInTheDocument();
  });

  it("opens the full form immediately", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm />);

    await openComposer(user);

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

  it("submits valid form data, refreshes the route, and collapses back to the trigger", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "notes.form.success.custom",
    });

    render(<NewNoteForm />);

    await openComposer(user);

    const { contentInput, submitButton } = getFormElements();

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
    expect(mockRouter.replace).toHaveBeenCalledWith("/notes#note-1");

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "notes.form.openComposer" })
      ).toBeInTheDocument();
      expect(
        screen.queryByLabelText("notes.form.fields.content")
      ).not.toBeInTheDocument();
    });
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

    render(<NewNoteForm />);

    await openComposer(user);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("notes.form.error")).toBeInTheDocument();
    expect(
      screen.getByText("notes.form.errors.contentRequired")
    ).toBeInTheDocument();
    expect(contentInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith("notes.form.error");
    expect(
      screen.getByRole("button", { name: "notes.form.closeComposer" })
    ).toBeInTheDocument();
  });

  it("handles thrown action errors", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewNoteForm />);

    await openComposer(user);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Network failed");
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm />);

    await openComposer(user);

    await user.click(
      screen.getByRole("button", { name: "notes.form.submit" })
    );

    expect(mockAddNoteAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("notes.form.fields.errors.required")
    ).toBeInTheDocument();
  });
});

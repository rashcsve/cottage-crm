import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addNoteAction } from "@/features/notes/server/actions";
import { downscaleNotePhoto } from "@/features/notes/shared/downscaleNotePhoto";
import {
  NOTE_PHOTO_MAX_COUNT,
  NOTE_PHOTO_MAX_SIZE_BYTES,
} from "@/features/notes/shared/notePhotoValidation";
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

vi.mock("@/features/notes/shared/downscaleNotePhoto", () => ({
  downscaleNotePhoto: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockDownscaleNotePhoto = vi.mocked(downscaleNotePhoto);
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
    contentInput: screen.getByLabelText("notes.form.fields.content", {
      exact: false,
    }),
    photosInput: screen.getByLabelText("notes.form.fields.photos"),
    submitButton: screen.getByRole("button", { name: "notes.form.submit" }),
  };
}

describe("NewNoteForm", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;
  let mockOnClose: () => void;
  let mockOnDirtyChange: (isDirty: boolean) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    setupTranslations();

    mockOnClose = vi.fn();
    mockOnDirtyChange = vi.fn();

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

    mockDownscaleNotePhoto.mockImplementation(async (file) => file);
  });

  it("renders the supporting copy with content and photos fields, leaving title and close to the panel", () => {
    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    expect(screen.getByText("notes.form.supportingCopy")).toBeInTheDocument();
    expect(
      screen.getByLabelText("notes.form.fields.content", { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("notes.form.fields.photos")).toBeInTheDocument();
    expect(screen.queryByText("notes.form.eyebrow")).not.toBeInTheDocument();
    expect(screen.queryByText("notes.form.title")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "notes.form.closeComposer" })
    ).not.toBeInTheDocument();
  });

  it("describes the photo input with the photo requirements", () => {
    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    expect(getFormElements().photosInput).toHaveAccessibleDescription(
      "notes.form.fields.photoRequirements"
    );
  });

  it("shows the selected photo count only once a photo is picked", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    expect(
      screen.queryByText("notes.form.fields.selectedPhotosCount")
    ).not.toBeInTheDocument();

    await user.upload(getFormElements().photosInput, photo);

    expect(
      screen.getByText("notes.form.fields.selectedPhotosCount")
    ).toBeInTheDocument();
  });

  it("focuses the content field on mount", async () => {
    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("notes.form.fields.content", { exact: false })
      ).toHaveFocus();
    });
  });

  it("reports dirty while content is typed and clean once it is cleared", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { contentInput } = getFormElements();

    await user.type(contentInput, "Gardener");
    expect(mockOnDirtyChange).toHaveBeenLastCalledWith(true);

    await user.clear(contentInput);
    expect(mockOnDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it("reports dirty when only photos are selected", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { photosInput } = getFormElements();

    await user.upload(photosInput, photo);
    expect(mockOnDirtyChange).toHaveBeenLastCalledWith(true);

    await user.click(
      screen.getByRole("button", { name: "notes.form.fields.removePhoto" })
    );
    expect(mockOnDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it("submits valid form data and calls onClose without refreshing the route", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "notes.form.success.custom",
    });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

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
    expect(mockOnClose).toHaveBeenCalledTimes(1);
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("maps server errors and keeps the form open", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: false,
      error: "notes.form.error",
      fieldErrors: {
        content: "notes.form.errors.contentRequired",
      },
    });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("notes.form.error")).toBeInTheDocument();
    expect(
      screen.getByText("notes.form.errors.contentRequired")
    ).toBeInTheDocument();
    expect(contentInput).toHaveAttribute("aria-invalid", "true");
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("adds and removes photo previews before submit", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

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

  it("rejects an unsupported file type with an alert linked to the input", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const file = new File(["gif"], "porch.gif", { type: "image/gif" });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { photosInput } = getFormElements();

    await user.upload(photosInput, file);

    const describedByIds =
      photosInput.getAttribute("aria-describedby")?.split(" ") ?? [];
    const alert = screen
      .getAllByRole("alert")
      .find((element) => describedByIds.includes(element.id));

    expect(alert).toBeDefined();
    expect(alert).toHaveTextContent("notes.form.fields.errors.photoInvalidType");
    expect(photosInput).toHaveAccessibleDescription(
      expect.stringContaining("notes.form.fields.errors.photoInvalidType")
    );
    expect(
      screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).not.toBeInTheDocument();
  });

  it("rejects a photo over the size limit", async () => {
    const user = userEvent.setup();
    const file = new File(
      [new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES + 1)],
      "huge.jpg",
      { type: "image/jpeg" }
    );

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    await user.upload(getFormElements().photosInput, file);

    expect(
      await screen.findByText("notes.form.fields.errors.photoTooLarge")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).not.toBeInTheDocument();
  });

  it("rejects selecting more than the maximum number of photos at once", async () => {
    const user = userEvent.setup();
    const photos = Array.from(
      { length: NOTE_PHOTO_MAX_COUNT + 1 },
      (_, index) => new File(["photo"], `photo-${index}.jpg`, { type: "image/jpeg" })
    );

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    await user.upload(getFormElements().photosInput, photos);

    expect(
      await screen.findByText("notes.form.fields.errors.photosTooMany")
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).not.toBeInTheDocument();
  });

  it("keeps the previously selected photos when a later selection is rejected", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
    const gif = new File(["gif"], "porch.gif", { type: "image/gif" });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { photosInput } = getFormElements();

    await user.upload(photosInput, photo);
    await user.upload(photosInput, gif);

    expect(
      await screen.findByText("notes.form.fields.errors.photoInvalidType")
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).toHaveLength(1);
  });

  it("does not submit while a photo error is shown", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const gif = new File(["gif"], "porch.gif", { type: "image/gif" });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { contentInput, photosInput, submitButton } = getFormElements();

    await user.type(contentInput, "Porch photo");
    await user.upload(photosInput, gif);
    await user.click(submitButton);

    expect(mockAddNoteAction).not.toHaveBeenCalled();
  });

  it("disables adding more photos once the maximum is selected", async () => {
    const user = userEvent.setup();
    const photos = Array.from(
      { length: 4 },
      (_, index) => new File(["photo"], `photo-${index}.jpg`, { type: "image/jpeg" })
    );

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { photosInput } = getFormElements();

    await user.upload(photosInput, photos);

    expect(
      screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
    ).toHaveLength(4);
    expect(photosInput).toBeDisabled();
  });

  it("submits the selected photos with the note content", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    mockAddNoteAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "notes.form.success",
    });

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { contentInput, photosInput, submitButton } = getFormElements();

    await user.type(contentInput, "Porch photo");
    await user.upload(photosInput, photo);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
    });

    const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

    expect(submittedFormData.getAll("photos")).toEqual([photo]);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
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

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

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

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  describe("photo downscaling", () => {
    it("downscales selected photos and previews and submits the result", async () => {
      const user = userEvent.setup();
      const photo = new File(["original"], "porch.jpg", { type: "image/jpeg" });
      const downscaled = new File(["small"], "porch.webp", { type: "image/webp" });

      mockDownscaleNotePhoto.mockResolvedValueOnce(downscaled);
      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      const { contentInput, photosInput, submitButton } = getFormElements();

      await user.type(contentInput, "Porch photo");
      await user.upload(photosInput, photo);

      expect(mockDownscaleNotePhoto).toHaveBeenCalledWith(photo, {
        maxEdgePx: 2048,
        quality: 0.82,
        maxBytes: NOTE_PHOTO_MAX_SIZE_BYTES,
        retryQuality: 0.7,
      });
      expect(
        await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toBeInTheDocument();
      expect(URL.createObjectURL).toHaveBeenCalledWith(downscaled);

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
      });

      const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

      expect(submittedFormData.getAll("photos")).toEqual([downscaled]);
    });

    it("accepts a large phone photo once downscaling brings it under the limit", async () => {
      const user = userEvent.setup();
      const phonePhoto = new File(
        [new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES * 6)],
        "IMG_0001.jpg",
        { type: "image/jpeg" }
      );

      mockDownscaleNotePhoto.mockResolvedValueOnce(
        new File(["small"], "IMG_0001.webp", { type: "image/webp" })
      );

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      await user.upload(getFormElements().photosInput, phonePhoto);

      expect(
        await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toBeInTheDocument();
      expect(
        screen.queryByText("notes.form.fields.errors.photoTooLarge")
      ).not.toBeInTheDocument();
    });

    it("keeps the original file when downscaling fails", async () => {
      const user = userEvent.setup();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

      mockDownscaleNotePhoto.mockRejectedValueOnce(new Error("decode failed"));
      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      const { contentInput, photosInput, submitButton } = getFormElements();

      await user.type(contentInput, "Porch photo");
      await user.upload(photosInput, photo);

      expect(
        await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toBeInTheDocument();

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
      });

      const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

      expect(submittedFormData.getAll("photos")).toEqual([photo]);
    });

    it("rejects a large original as too large when downscaling fails", async () => {
      const user = userEvent.setup();
      const phonePhoto = new File(
        [new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES + 1)],
        "IMG_0001.jpg",
        { type: "image/jpeg" }
      );

      mockDownscaleNotePhoto.mockRejectedValueOnce(new Error("decode failed"));

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      await user.upload(getFormElements().photosInput, phonePhoto);

      expect(
        await screen.findByText("notes.form.fields.errors.photoTooLarge")
      ).toBeInTheDocument();
    });

    it("shows the too-large error when the downscaled photo is still over the limit", async () => {
      const user = userEvent.setup();
      const photo = new File(["photo"], "forest.jpg", { type: "image/jpeg" });

      mockDownscaleNotePhoto.mockResolvedValueOnce(
        new File([new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES + 1)], "forest.jpg", {
          type: "image/jpeg",
        })
      );

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      await user.upload(getFormElements().photosInput, photo);

      expect(
        await screen.findByText("notes.form.fields.errors.photoTooLarge")
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).not.toBeInTheDocument();
    });

    it("processes selected photos one at a time", async () => {
      const user = userEvent.setup();
      const photos = [
        new File(["one"], "one.jpg", { type: "image/jpeg" }),
        new File(["two"], "two.jpg", { type: "image/jpeg" }),
      ];
      const pending: Array<() => void> = [];

      mockDownscaleNotePhoto.mockImplementation(
        (file) =>
          new Promise<File>((resolve) => {
            pending.push(() => resolve(file));
          })
      );

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      await user.upload(getFormElements().photosInput, photos);

      expect(mockDownscaleNotePhoto).toHaveBeenCalledTimes(1);
      expect(mockDownscaleNotePhoto).toHaveBeenLastCalledWith(photos[0], expect.anything());

      pending[0]?.();

      await waitFor(() => {
        expect(mockDownscaleNotePhoto).toHaveBeenCalledTimes(2);
      });
      expect(mockDownscaleNotePhoto).toHaveBeenLastCalledWith(photos[1], expect.anything());

      pending[1]?.();

      expect(
        await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toHaveLength(2);
    });

    it("does not downscale when the selection is over the maximum count", async () => {
      const user = userEvent.setup();
      const photos = Array.from(
        { length: NOTE_PHOTO_MAX_COUNT + 1 },
        (_, index) => new File(["photo"], `photo-${index}.jpg`, { type: "image/jpeg" })
      );

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      await user.upload(getFormElements().photosInput, photos);

      expect(
        await screen.findByText("notes.form.fields.errors.photosTooMany")
      ).toBeInTheDocument();
      expect(mockDownscaleNotePhoto).not.toHaveBeenCalled();
    });

    it("does not downscale unsupported file types", async () => {
      const user = userEvent.setup({ applyAccept: false });
      const gif = new File(["gif"], "porch.gif", { type: "image/gif" });

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      await user.upload(getFormElements().photosInput, gif);

      expect(mockDownscaleNotePhoto).not.toHaveBeenCalled();
      expect(
        await screen.findByText("notes.form.fields.errors.photoInvalidType")
      ).toBeInTheDocument();
    });

    it("shows the pending state while photos are processed", async () => {
      const user = userEvent.setup();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
      let finishDownscale: (file: File) => void = () => undefined;

      mockDownscaleNotePhoto.mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishDownscale = resolve;
          })
      );

      const { container } = render(
        <NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />
      );

      const { photosInput } = getFormElements();

      await user.upload(photosInput, photo);

      const form = container.querySelector("form");
      const submitButton = screen.getByRole("button", {
        name: "notes.form.processingPhotos",
      });

      expect(form).toHaveAttribute("aria-busy", "true");
      expect(submitButton).toBeDisabled();
      expect(photosInput).toBeDisabled();
      expect(screen.getByRole("status")).toHaveTextContent(
        "notes.form.processingPhotos"
      );

      finishDownscale(photo);

      expect(
        await screen.findByRole("button", { name: "notes.form.submit" })
      ).toBeEnabled();
      expect(form).toHaveAttribute("aria-busy", "false");
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    });

    it("disables removing photos while new photos are processed, so removals aren't lost", async () => {
      const user = userEvent.setup();
      const first = new File(["one"], "one.jpg", { type: "image/jpeg" });
      const second = new File(["two"], "two.jpg", { type: "image/jpeg" });
      let finishDownscale: (file: File) => void = () => undefined;

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      const { photosInput } = getFormElements();

      await user.upload(photosInput, first);

      mockDownscaleNotePhoto.mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishDownscale = resolve;
          })
      );

      await user.upload(photosInput, second);

      const removeButton = screen.getByRole("button", {
        name: "notes.form.fields.removePhoto",
      });

      expect(removeButton).toBeDisabled();

      finishDownscale(second);

      await waitFor(() => {
        expect(
          screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toHaveLength(2);
      });
      for (const button of screen.getAllByRole("button", {
        name: "notes.form.fields.removePhoto",
      })) {
        expect(button).toBeEnabled();
      }
    });

    it("ignores a second selection while photos are still processing", async () => {
      const user = userEvent.setup();
      const first = new File(["one"], "one.jpg", { type: "image/jpeg" });
      const second = new File(["two"], "two.jpg", { type: "image/jpeg" });
      let finishDownscale: (file: File) => void = () => undefined;

      mockDownscaleNotePhoto.mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishDownscale = resolve;
          })
      );

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      const { photosInput } = getFormElements();

      await user.upload(photosInput, first);
      await user.upload(photosInput, second);

      expect(mockDownscaleNotePhoto).toHaveBeenCalledTimes(1);

      finishDownscale(first);

      expect(
        await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toHaveLength(1);
      expect(mockDownscaleNotePhoto).toHaveBeenCalledTimes(1);
    });

    it("keeps the originals of failed photos and the downscaled results of the others", async () => {
      const user = userEvent.setup();
      const photos = [
        new File(["one"], "one.jpg", { type: "image/jpeg" }),
        new File(["two"], "two.jpg", { type: "image/jpeg" }),
        new File(["three"], "three.jpg", { type: "image/jpeg" }),
      ];
      const downscaledOne = new File(["small-one"], "one.webp", { type: "image/webp" });
      const downscaledThree = new File(["small-three"], "three.webp", {
        type: "image/webp",
      });

      mockDownscaleNotePhoto
        .mockResolvedValueOnce(downscaledOne)
        .mockRejectedValueOnce(new Error("decode failed"))
        .mockResolvedValueOnce(downscaledThree);
      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

      const { contentInput, photosInput, submitButton } = getFormElements();

      await user.type(contentInput, "Porch photos");
      await user.upload(photosInput, photos);

      expect(
        await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toHaveLength(3);

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
      });

      const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

      expect(submittedFormData.getAll("photos")).toEqual([
        downscaledOne,
        photos[1],
        downscaledThree,
      ]);
    });

    it("does not create previews when the form is closed while photos are processing", async () => {
      const user = userEvent.setup();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
      let finishDownscale: (file: File) => void = () => undefined;

      mockDownscaleNotePhoto.mockImplementationOnce(
        () =>
          new Promise<File>((resolve) => {
            finishDownscale = resolve;
          })
      );

      const { unmount } = render(
        <NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />
      );

      await user.upload(getFormElements().photosInput, photo);
      unmount();

      finishDownscale(photo);
      await Promise.resolve();
      await Promise.resolve();

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm onClose={mockOnClose} onDirtyChange={mockOnDirtyChange} />);

    await user.click(
      screen.getByRole("button", { name: "notes.form.submit" })
    );

    expect(mockAddNoteAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("notes.form.fields.errors.required")
    ).toBeInTheDocument();
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { addNoteAction } from "@/features/notes/server/actions";
import { downscaleNotePhoto } from "@/features/notes/shared/downscaleNotePhoto";
import {
  NOTE_PHOTO_MAX_COUNT,
  NOTE_PHOTO_MAX_SIZE_BYTES,
  NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES,
} from "@/features/notes/shared/notePhotoValidation";
import { NewNoteForm } from "./NewNoteForm";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
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
const mockAddNoteAction = vi.mocked(addNoteAction);

type MockRouter = {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

function setupTranslations() {
  mockUseTranslations.mockImplementation((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return ((key: string) => `${prefix}${key}`) as ReturnType<typeof useTranslations>;
  });
}

const FULL_SIZE_MAX_EDGE_PX = 2048;

function getFullSizeCalls() {
  return mockDownscaleNotePhoto.mock.calls.filter(
    ([, options]) => options.maxEdgePx === FULL_SIZE_MAX_EDGE_PX
  );
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
  let mockOnAdded: (message: string) => void;

  beforeEach(() => {
    vi.clearAllMocks();

    setupTranslations();

    mockOnAdded = vi.fn();

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

    vi.spyOn(URL, "createObjectURL").mockImplementation(
      () => "blob:note-photo-preview"
    );
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => undefined);

    mockDownscaleNotePhoto.mockReset();
    mockDownscaleNotePhoto.mockImplementation(async (file) => file);
  });

  it("renders the supporting copy with content and photos fields, leaving title and close to the panel", () => {
    render(<NewNoteForm onAdded={mockOnAdded} />);

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
    render(<NewNoteForm onAdded={mockOnAdded} />);

    expect(getFormElements().photosInput).toHaveAccessibleDescription(
      "notes.form.fields.photoRequirements"
    );
  });

  it("shows the selected photo count only once a photo is picked", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    render(<NewNoteForm onAdded={mockOnAdded} />);

    expect(
      screen.queryByText("notes.form.fields.selectedPhotosCount")
    ).not.toBeInTheDocument();

    await user.upload(getFormElements().photosInput, photo);

    expect(
      screen.getByText("notes.form.fields.selectedPhotosCount")
    ).toBeInTheDocument();
  });

  it("focuses the content field on mount", async () => {
    render(<NewNoteForm onAdded={mockOnAdded} />);

    await waitFor(() => {
      expect(
        screen.getByLabelText("notes.form.fields.content", { exact: false })
      ).toHaveFocus();
    });
  });

  it("submits valid form data and reports the added message without refreshing the route", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "notes.form.success.custom",
    });

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

    expect(mockOnAdded).toHaveBeenCalledExactlyOnceWith(
      "notes.form.success.custom"
    );
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

    render(<NewNoteForm onAdded={mockOnAdded} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("notes.form.error")).toBeInTheDocument();
    expect(
      screen.getByText("notes.form.errors.contentRequired")
    ).toBeInTheDocument();
    expect(contentInput).toHaveAttribute("aria-invalid", "true");
    expect(mockOnAdded).not.toHaveBeenCalled();
  });

  it("adds and removes photo previews before submit", async () => {
    const user = userEvent.setup();
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

  it("submits the remaining photos after a rejected pick and clears the error", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
    const gif = new File(["gif"], "porch.gif", { type: "image/gif" });

    mockAddNoteAction.mockResolvedValueOnce({
      ok: false,
      error: "notes.form.error",
    });

    render(<NewNoteForm onAdded={mockOnAdded} />);

    const { contentInput, photosInput, submitButton } = getFormElements();

    await user.type(contentInput, "Porch photo");
    await user.upload(photosInput, photo);
    await user.upload(photosInput, gif);
    expect(
      await screen.findByText("notes.form.fields.errors.photoInvalidType")
    ).toBeInTheDocument();

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
    });

    const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

    expect(submittedFormData.getAll("photos")).toEqual([photo]);
    expect(
      screen.queryByText("notes.form.fields.errors.photoInvalidType")
    ).not.toBeInTheDocument();
  });

  it("disables adding more photos once the maximum is selected", async () => {
    const user = userEvent.setup();
    const photos = Array.from(
      { length: 4 },
      (_, index) => new File(["photo"], `photo-${index}.jpg`, { type: "image/jpeg" })
    );

    render(<NewNoteForm onAdded={mockOnAdded} />);

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

    render(<NewNoteForm onAdded={mockOnAdded} />);

    const { contentInput, photosInput, submitButton } = getFormElements();

    await user.type(contentInput, "Porch photo");
    await user.upload(photosInput, photo);
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
    });

    const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

    expect(submittedFormData.getAll("photos")).toEqual([photo]);
    expect(mockOnAdded).toHaveBeenCalledTimes(1);
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

    render(<NewNoteForm onAdded={mockOnAdded} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
    expect(
      screen.getByText("notes.form.fields.errors.photoInvalidType")
    ).toBeInTheDocument();
    expect(mockOnAdded).not.toHaveBeenCalled();
  });

  it("handles thrown action errors", async () => {
    const user = userEvent.setup();

    mockAddNoteAction.mockRejectedValueOnce(new Error("Network failed"));

    render(<NewNoteForm onAdded={mockOnAdded} />);

    const { contentInput, submitButton } = getFormElements();

    await user.type(contentInput, "Valid content");
    await user.click(submitButton);

    expect(await screen.findByText("Network failed")).toBeInTheDocument();
    expect(mockOnAdded).not.toHaveBeenCalled();
  });

  describe("preview urls", () => {
    const porch = new File(["porch"], "porch.jpg", { type: "image/jpeg" });
    const garden = new File(["garden"], "garden.jpg", { type: "image/jpeg" });

    beforeEach(() => {
      vi.mocked(URL.createObjectURL).mockImplementation(
        (file) => `blob:${(file as File).name}`
      );
    });

    it("keeps earlier previews and creates one only for each newly picked photo", async () => {
      const user = userEvent.setup();

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, porch);
      await user.upload(getFormElements().photosInput, garden);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(2);
      expect(URL.revokeObjectURL).not.toHaveBeenCalled();
      expect(
        screen
          .getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
          .map((image) => image.getAttribute("src"))
      ).toEqual(["blob:porch.jpg", "blob:garden.jpg"]);
    });

    it("revokes only the removed photo's preview", async () => {
      const user = userEvent.setup();

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, [porch, garden]);
      await user.click(
        screen.getAllByRole("button", { name: "notes.form.fields.removePhoto" })[0]
      );

      expect(URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:porch.jpg");
    });

    it("revokes every preview after a successful submit", async () => {
      const user = userEvent.setup();

      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      render(<NewNoteForm onAdded={mockOnAdded} />);

      const { contentInput, photosInput, submitButton } = getFormElements();

      await user.type(contentInput, "Porch and garden");
      await user.upload(photosInput, [porch, garden]);
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnAdded).toHaveBeenCalledTimes(1);
      });
      expect(vi.mocked(URL.revokeObjectURL).mock.calls.flat().sort()).toEqual([
        "blob:garden.jpg",
        "blob:porch.jpg",
      ]);
    });

    it("revokes the remaining previews when the form unmounts", async () => {
      const user = userEvent.setup();

      const { unmount } = render(
        <NewNoteForm onAdded={mockOnAdded} />
      );

      await user.upload(getFormElements().photosInput, [porch, garden]);
      unmount();

      expect(vi.mocked(URL.revokeObjectURL).mock.calls.flat().sort()).toEqual([
        "blob:garden.jpg",
        "blob:porch.jpg",
      ]);
    });
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

      render(<NewNoteForm onAdded={mockOnAdded} />);

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

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, phonePhoto);

      expect(
        await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toBeInTheDocument();
      expect(
        screen.queryByText("notes.form.fields.errors.photoTooLarge")
      ).not.toBeInTheDocument();
    });

    it("rejects a photo that can't be downscaled instead of keeping the original", async () => {
      const user = userEvent.setup();
      const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });

      mockDownscaleNotePhoto.mockRejectedValueOnce(new Error("decode failed"));

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, photo);

      expect(
        await screen.findByText("notes.form.fields.errors.photoProcessingFailed")
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).not.toBeInTheDocument();
      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });

    it("shows the too-large error when the downscaled photo is still over the limit", async () => {
      const user = userEvent.setup();
      const photo = new File(["photo"], "forest.jpg", { type: "image/jpeg" });

      mockDownscaleNotePhoto.mockResolvedValueOnce(
        new File([new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES + 1)], "forest.jpg", {
          type: "image/jpeg",
        })
      );

      render(<NewNoteForm onAdded={mockOnAdded} />);

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

      mockDownscaleNotePhoto.mockImplementation((file, options) =>
        options.maxEdgePx === FULL_SIZE_MAX_EDGE_PX
          ? new Promise<File>((resolve) => {
              pending.push(() => resolve(file));
            })
          : Promise.resolve(file)
      );

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, photos);

      expect(getFullSizeCalls()).toHaveLength(1);
      expect(getFullSizeCalls()[0]?.[0]).toBe(photos[0]);

      pending[0]?.();

      await waitFor(() => {
        expect(getFullSizeCalls()).toHaveLength(2);
      });
      expect(getFullSizeCalls()[1]?.[0]).toBe(photos[1]);

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

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, photos);

      expect(
        await screen.findByText("notes.form.fields.errors.photosTooMany")
      ).toBeInTheDocument();
      expect(mockDownscaleNotePhoto).not.toHaveBeenCalled();
    });

    it("does not downscale unsupported file types", async () => {
      const user = userEvent.setup({ applyAccept: false });
      const gif = new File(["gif"], "porch.gif", { type: "image/gif" });

      render(<NewNoteForm onAdded={mockOnAdded} />);

      await user.upload(getFormElements().photosInput, gif);

      expect(mockDownscaleNotePhoto).not.toHaveBeenCalled();
      expect(
        await screen.findByText("notes.form.fields.errors.photoInvalidType")
      ).toBeInTheDocument();
    });

    describe("HEIC", () => {
      it("converts a HEIC photo and submits the converted file", async () => {
        const user = userEvent.setup();
        const heic = new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" });
        const converted = new File(["small"], "IMG_0001.webp", { type: "image/webp" });

        mockDownscaleNotePhoto.mockResolvedValueOnce(converted);
        mockAddNoteAction.mockResolvedValueOnce({
          ok: true,
          data: { id: 1 },
          message: "notes.form.success",
        });

        render(<NewNoteForm onAdded={mockOnAdded} />);

        const { contentInput, photosInput, submitButton } = getFormElements();

        await user.type(contentInput, "Sauna photo");
        await user.upload(photosInput, heic);

        expect(mockDownscaleNotePhoto).toHaveBeenCalledWith(heic, expect.anything());
        expect(
          await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toBeInTheDocument();

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
        });

        const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

        expect(submittedFormData.getAll("photos")).toEqual([converted]);
      });

      it("recognises a .heic file the browser reports without a type", async () => {
        const user = userEvent.setup();
        const heic = new File(["heic"], "IMG_0001.heic", { type: "" });

        mockDownscaleNotePhoto.mockResolvedValueOnce(
          new File(["small"], "IMG_0001.webp", { type: "image/webp" })
        );

        render(<NewNoteForm onAdded={mockOnAdded} />);

        await user.upload(getFormElements().photosInput, heic);

        expect(mockDownscaleNotePhoto).toHaveBeenCalledWith(heic, expect.anything());
        expect(
          await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toBeInTheDocument();
      });

      it("shows the HEIC message when the browser cannot convert it", async () => {
        const user = userEvent.setup();
        const heic = new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" });

        mockDownscaleNotePhoto.mockRejectedValueOnce(new Error("decode failed"));

        render(<NewNoteForm onAdded={mockOnAdded} />);

        await user.upload(getFormElements().photosInput, heic);

        expect(
          await screen.findByText("notes.form.fields.errors.photoHeicUnsupported")
        ).toBeInTheDocument();
        expect(
          screen.queryByText("notes.form.fields.errors.photoInvalidType")
        ).not.toBeInTheDocument();
        expect(
          screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).not.toBeInTheDocument();
      });

      it("keeps already selected photos when a HEIC cannot be converted", async () => {
        const user = userEvent.setup();
        const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
        const heic = new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" });

        render(<NewNoteForm onAdded={mockOnAdded} />);

        const { photosInput } = getFormElements();

        await user.upload(photosInput, photo);
        expect(
          await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toBeInTheDocument();

        mockDownscaleNotePhoto.mockRejectedValueOnce(new Error("decode failed"));
        await user.upload(photosInput, heic);

        expect(
          await screen.findByText("notes.form.fields.errors.photoHeicUnsupported")
        ).toBeInTheDocument();
        expect(
          screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toHaveLength(1);
      });

      it("submits the already selected photos after a HEIC cannot be converted", async () => {
        const user = userEvent.setup();
        const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
        const heic = new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" });

        mockAddNoteAction.mockResolvedValueOnce({
          ok: true,
          data: { id: 1 },
          message: "notes.form.success",
        });

        render(<NewNoteForm onAdded={mockOnAdded} />);

        const { contentInput, photosInput, submitButton } = getFormElements();

        await user.type(contentInput, "Porch photo");
        await user.upload(photosInput, photo);
        await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" });

        mockDownscaleNotePhoto.mockRejectedValueOnce(new Error("decode failed"));
        await user.upload(photosInput, heic);
        await screen.findByText("notes.form.fields.errors.photoHeicUnsupported");

        await user.click(submitButton);

        await waitFor(() => {
          expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
        });

        const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

        expect(submittedFormData.getAll("photos")).toEqual([photo]);
        expect(mockOnAdded).toHaveBeenCalledTimes(1);
      });

      it("keeps the convertible photos of a mixed pick and shows the HEIC message", async () => {
        const user = userEvent.setup();
        const photo = new File(["photo"], "porch.jpg", { type: "image/jpeg" });
        const heic = new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" });

        mockDownscaleNotePhoto.mockImplementation(async (file) => {
          if (file === heic) {
            throw new Error("decode failed");
          }
          return file;
        });

        render(<NewNoteForm onAdded={mockOnAdded} />);

        await user.upload(getFormElements().photosInput, [photo, heic]);

        expect(
          await screen.findByText("notes.form.fields.errors.photoHeicUnsupported")
        ).toBeInTheDocument();
        expect(
          screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toHaveLength(1);
        expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
        expect(vi.mocked(URL.createObjectURL).mock.calls[0]?.[0]).toBe(photo);
      });

      it("shows the too-large error when the converted HEIC is still over the limit", async () => {
        const user = userEvent.setup();
        const heic = new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" });

        mockDownscaleNotePhoto.mockResolvedValueOnce(
          new File([new Uint8Array(NOTE_PHOTO_MAX_SIZE_BYTES + 1)], "IMG_0001.jpg", {
            type: "image/jpeg",
          })
        );

        render(<NewNoteForm onAdded={mockOnAdded} />);

        await user.upload(getFormElements().photosInput, heic);

        expect(
          await screen.findByText("notes.form.fields.errors.photoTooLarge")
        ).toBeInTheDocument();
        expect(
          screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).not.toBeInTheDocument();
      });

      it("rejects a HEIC pick that goes over the maximum count without converting it", async () => {
        const user = userEvent.setup();
        const photos = Array.from(
          { length: NOTE_PHOTO_MAX_COUNT - 1 },
          (_, index) => new File(["photo"], `photo-${index}.jpg`, { type: "image/jpeg" })
        );
        const heics = [
          new File(["heic"], "IMG_0001.HEIC", { type: "image/heic" }),
          new File(["heic"], "IMG_0002.HEIC", { type: "image/heic" }),
        ];

        render(<NewNoteForm onAdded={mockOnAdded} />);

        const { photosInput } = getFormElements();

        await user.upload(photosInput, photos);
        expect(
          await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toHaveLength(NOTE_PHOTO_MAX_COUNT - 1);

        mockDownscaleNotePhoto.mockClear();
        await user.upload(photosInput, heics);

        expect(
          await screen.findByText("notes.form.fields.errors.photosTooMany")
        ).toBeInTheDocument();
        expect(mockDownscaleNotePhoto).not.toHaveBeenCalled();
        expect(
          screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
        ).toHaveLength(NOTE_PHOTO_MAX_COUNT - 1);
      });
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
        <NewNoteForm onAdded={mockOnAdded} />
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

      render(<NewNoteForm onAdded={mockOnAdded} />);

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

      render(<NewNoteForm onAdded={mockOnAdded} />);

      const { photosInput } = getFormElements();

      await user.upload(photosInput, first);
      await user.upload(photosInput, second);

      expect(getFullSizeCalls()).toHaveLength(1);

      finishDownscale(first);

      expect(
        await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toHaveLength(1);
      expect(getFullSizeCalls()).toHaveLength(1);
    });

    it("rejects only the photos that can't be downscaled and keeps the others", async () => {
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

      mockDownscaleNotePhoto.mockImplementation(async (file, options) => {
        if (options.maxEdgePx !== FULL_SIZE_MAX_EDGE_PX) return file;
        if (file === photos[1]) throw new Error("decode failed");
        return file === photos[0] ? downscaledOne : downscaledThree;
      });
      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      render(<NewNoteForm onAdded={mockOnAdded} />);

      const { contentInput, photosInput, submitButton } = getFormElements();

      await user.type(contentInput, "Porch photos");
      await user.upload(photosInput, photos);

      expect(
        await screen.findByText("notes.form.fields.errors.photoProcessingFailed")
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toHaveLength(2);

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
      });

      const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

      expect(submittedFormData.getAll("photos")).toEqual([downscaledOne, downscaledThree]);
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
        <NewNoteForm onAdded={mockOnAdded} />
      );

      await user.upload(getFormElements().photosInput, photo);
      unmount();

      finishDownscale(photo);
      await Promise.resolve();
      await Promise.resolve();

      expect(URL.createObjectURL).not.toHaveBeenCalled();
    });
  });

  describe("thumbnails", () => {
    const THUMBNAIL_OPTIONS = {
      maxEdgePx: 320,
      quality: 0.82,
      maxBytes: NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES,
      retryQuality: 0.6,
    };

    function mockThumbnails(createThumbnail: (file: File) => Promise<File>) {
      mockDownscaleNotePhoto.mockImplementation(async (file, options) =>
        options.maxEdgePx === THUMBNAIL_OPTIONS.maxEdgePx ? createThumbnail(file) : file
      );
    }

    async function pickPhotos(photos: File[]) {
      const user = userEvent.setup();

      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      render(<NewNoteForm onAdded={mockOnAdded} />);

      const { contentInput, photosInput, submitButton } = getFormElements();

      await user.type(contentInput, "Porch photos");
      await user.upload(photosInput, photos);

      return { user, submitButton };
    }

    async function getSubmittedFormData() {
      await waitFor(() => {
        expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
      });

      return mockAddNoteAction.mock.calls[0]?.[0] as FormData;
    }

    it("makes a thumbnail from each downscaled photo when it is picked", async () => {
      const photo = new File(["original"], "porch.jpg", { type: "image/jpeg" });
      const downscaled = new File(["small"], "porch.webp", { type: "image/webp" });

      mockDownscaleNotePhoto.mockImplementation(async (file, options) =>
        options.maxEdgePx === THUMBNAIL_OPTIONS.maxEdgePx ? file : downscaled
      );

      await pickPhotos([photo]);
      await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" });

      expect(mockDownscaleNotePhoto).toHaveBeenCalledWith(downscaled, THUMBNAIL_OPTIONS);
      expect(mockAddNoteAction).not.toHaveBeenCalled();
    });

    it("submits each photo's thumbnail at the photo's position", async () => {
      const first = new File(["one"], "one.webp", { type: "image/webp" });
      const second = new File(["two"], "two.webp", { type: "image/webp" });
      const thumbnails = new Map([
        [first, new File(["t1"], "one.webp", { type: "image/webp" })],
        [second, new File(["t2"], "two.jpg", { type: "image/jpeg" })],
      ]);

      mockThumbnails(async (file) => thumbnails.get(file)!);

      const { user, submitButton } = await pickPhotos([first, second]);
      await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" });
      await user.click(submitButton);

      const formData = await getSubmittedFormData();

      expect(formData.getAll("photos")).toEqual([first, second]);
      expect(formData.get("thumbnail-0")).toBe(thumbnails.get(first));
      expect(formData.get("thumbnail-1")).toBe(thumbnails.get(second));
    });

    it("rejects a photo whose thumbnail can't be made and keeps the others", async () => {
      const first = new File(["one"], "one.webp", { type: "image/webp" });
      const second = new File(["two"], "two.webp", { type: "image/webp" });
      const secondThumbnail = new File(["t2"], "two.webp", { type: "image/webp" });

      mockThumbnails(async (file) => {
        if (file === first) throw new Error("decode failed");
        return secondThumbnail;
      });

      const { user, submitButton } = await pickPhotos([first, second]);

      expect(
        await screen.findByText("notes.form.fields.errors.photoProcessingFailed")
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).toHaveLength(1);

      await user.click(submitButton);

      const formData = await getSubmittedFormData();

      expect(formData.getAll("photos")).toEqual([second]);
      expect(formData.get("thumbnail-0")).toBe(secondThumbnail);
      expect(formData.has("thumbnail-1")).toBe(false);
    });

    it("rejects a photo whose thumbnail is still over the thumbnail limit", async () => {
      const photo = new File(["one"], "one.webp", { type: "image/webp" });

      mockThumbnails(
        async () =>
          new File([new Uint8Array(NOTE_PHOTO_THUMBNAIL_MAX_SIZE_BYTES + 1)], "one.webp", {
            type: "image/webp",
          })
      );

      await pickPhotos([photo]);

      expect(
        await screen.findByText("notes.form.fields.errors.photoProcessingFailed")
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("img", { name: "notes.form.fields.photoPreviewAlt" })
      ).not.toBeInTheDocument();
    });

    it("numbers thumbnails by the remaining photos after a removal", async () => {
      const first = new File(["one"], "one.webp", { type: "image/webp" });
      const second = new File(["two"], "two.webp", { type: "image/webp" });
      const secondThumbnail = new File(["t2"], "two.webp", { type: "image/webp" });

      mockThumbnails(async (file) =>
        file === second ? secondThumbnail : new File(["t1"], "one.webp", { type: "image/webp" })
      );

      const { user, submitButton } = await pickPhotos([first, second]);
      await screen.findAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" });

      await user.click(
        screen.getAllByRole("button", { name: "notes.form.fields.removePhoto" })[0]
      );
      await user.click(submitButton);

      const formData = await getSubmittedFormData();

      expect(formData.getAll("photos")).toEqual([second]);
      expect(formData.get("thumbnail-0")).toBe(secondThumbnail);
      expect(formData.has("thumbnail-1")).toBe(false);
    });
  });

  describe("duplicate picks", () => {
    const DUPLICATE_MESSAGE = "notes.form.fields.errors.photoDuplicate";

    function createPhoto(
      name: string,
      { content = name, lastModified = 1 }: { content?: string; lastModified?: number } = {}
    ) {
      return new File([content], name, { type: "image/jpeg", lastModified });
    }

    function getPreviews() {
      return screen.queryAllByRole("img", { name: "notes.form.fields.photoPreviewAlt" });
    }

    function renderForm() {
      render(<NewNoteForm onAdded={mockOnAdded} />);
      return getFormElements();
    }

    it("adds a photo picked twice only once and submits it once", async () => {
      const user = userEvent.setup();

      mockAddNoteAction.mockResolvedValueOnce({
        ok: true,
        data: { id: 1 },
        message: "notes.form.success",
      });

      const { contentInput, photosInput, submitButton } = renderForm();
      const firstPick = createPhoto("porch.jpg");

      await user.type(contentInput, "Porch photo");
      await user.upload(photosInput, firstPick);
      await user.upload(photosInput, createPhoto("porch.jpg"));

      expect(await screen.findByText(DUPLICATE_MESSAGE)).toBeInTheDocument();
      expect(getPreviews()).toHaveLength(1);
      expect(getFullSizeCalls()).toHaveLength(1);

      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddNoteAction).toHaveBeenCalledTimes(1);
      });

      const submittedFormData = mockAddNoteAction.mock.calls[0]?.[0] as FormData;

      expect(submittedFormData.getAll("photos")).toEqual([firstPick]);
      expect(submittedFormData.has("thumbnail-1")).toBe(false);
    });

    it("adds a photo repeated within one pick only once", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, [
        createPhoto("porch.jpg"),
        createPhoto("porch.jpg"),
        createPhoto("garden.jpg"),
      ]);

      expect(await screen.findByText(DUPLICATE_MESSAGE)).toBeInTheDocument();
      expect(getPreviews()).toHaveLength(2);
      expect(getFullSizeCalls().map(([file]) => file.name)).toEqual([
        "porch.jpg",
        "garden.jpg",
      ]);
    });

    it("recognises an already selected photo after it was downscaled", async () => {
      const user = userEvent.setup();

      mockDownscaleNotePhoto.mockImplementation(
        async (file) => new File(["small"], `${file.name}.webp`, { type: "image/webp" })
      );

      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("porch.jpg"));
      await screen.findByRole("img", { name: "notes.form.fields.photoPreviewAlt" });
      await user.upload(photosInput, createPhoto("porch.jpg"));

      expect(await screen.findByText(DUPLICATE_MESSAGE)).toBeInTheDocument();
      expect(getPreviews()).toHaveLength(1);
      expect(getFullSizeCalls()).toHaveLength(1);
    });

    it("adds a photo again after it was removed", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("porch.jpg"));
      await user.click(
        screen.getByRole("button", { name: "notes.form.fields.removePhoto" })
      );
      await user.upload(photosInput, createPhoto("porch.jpg"));

      expect(getPreviews()).toHaveLength(1);
      expect(screen.queryByText(DUPLICATE_MESSAGE)).not.toBeInTheDocument();
    });

    it("keeps two different photos that share a name", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("IMG_0001.jpg"));
      await user.upload(photosInput, [
        createPhoto("IMG_0001.jpg", { content: "a different photo" }),
        createPhoto("IMG_0001.jpg", { lastModified: 2 }),
      ]);

      expect(getPreviews()).toHaveLength(3);
      expect(screen.queryByText(DUPLICATE_MESSAGE)).not.toBeInTheDocument();
    });

    it("checks the maximum count after dropping duplicates", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("porch.jpg"));
      await user.upload(photosInput, [
        createPhoto("porch.jpg"),
        createPhoto("garden.jpg"),
        createPhoto("lake.jpg"),
        createPhoto("dock.jpg"),
      ]);

      expect(await screen.findByText(DUPLICATE_MESSAGE)).toBeInTheDocument();
      expect(getPreviews()).toHaveLength(NOTE_PHOTO_MAX_COUNT);
      expect(
        screen.queryByText("notes.form.fields.errors.photosTooMany")
      ).not.toBeInTheDocument();
    });

    it("shows the processing error instead of the duplicate message", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("porch.jpg"));

      mockDownscaleNotePhoto.mockImplementation(async (file) => {
        if (file.name === "broken.jpg") throw new Error("decode failed");
        return file;
      });

      await user.upload(photosInput, [createPhoto("porch.jpg"), createPhoto("broken.jpg")]);

      expect(
        await screen.findByText("notes.form.fields.errors.photoProcessingFailed")
      ).toBeInTheDocument();
      expect(screen.queryByText(DUPLICATE_MESSAGE)).not.toBeInTheDocument();
      expect(getPreviews()).toHaveLength(1);
    });

    it("shows the HEIC message instead of the duplicate message", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("porch.jpg"));

      mockDownscaleNotePhoto.mockImplementation(async (file) => {
        if (file.type === "image/heic") throw new Error("decode failed");
        return file;
      });

      await user.upload(photosInput, [
        createPhoto("porch.jpg"),
        new File(["heic"], "IMG_0002.heic", { type: "image/heic", lastModified: 1 }),
      ]);

      expect(
        await screen.findByText("notes.form.fields.errors.photoHeicUnsupported")
      ).toBeInTheDocument();
      expect(screen.queryByText(DUPLICATE_MESSAGE)).not.toBeInTheDocument();
    });

    it("clears the duplicate message on the next pick without duplicates", async () => {
      const user = userEvent.setup();
      const { photosInput } = renderForm();

      await user.upload(photosInput, createPhoto("porch.jpg"));
      await user.upload(photosInput, createPhoto("porch.jpg"));
      await screen.findByText(DUPLICATE_MESSAGE);
      await user.upload(photosInput, createPhoto("garden.jpg"));

      await waitFor(() => {
        expect(screen.queryByText(DUPLICATE_MESSAGE)).not.toBeInTheDocument();
      });
      expect(getPreviews()).toHaveLength(2);
    });
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();

    render(<NewNoteForm onAdded={mockOnAdded} />);

    await user.click(
      screen.getByRole("button", { name: "notes.form.submit" })
    );

    expect(mockAddNoteAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("notes.form.fields.errors.required")
    ).toBeInTheDocument();
  });
});

import type { ImgHTMLAttributes } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { NotePhotoGallery } from "@/features/notes/components/NotePhotoGallery";
import type { NotePhoto } from "@/features/notes/types/notes";

vi.mock("next/image", () => ({
  default: ({
    unoptimized,
    ...props
  }: ImgHTMLAttributes<HTMLImageElement> & { unoptimized?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} data-unoptimized={unoptimized ? "true" : undefined} />
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(() => {
    return (key: string, values?: Record<string, unknown>) =>
      values && "index" in values ? `${key}:${String(values.index)}` : key;
  }),
}));

const originalShowModal = HTMLDialogElement.prototype.showModal;
const originalClose = HTMLDialogElement.prototype.close;

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close() {
    if (!this.hasAttribute("open")) return;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterAll(() => {
  HTMLDialogElement.prototype.showModal = originalShowModal;
  HTMLDialogElement.prototype.close = originalClose;
});

function createPhoto(
  id: number,
  url: string | null = `https://example.com/${id}.jpg`,
  thumbnailUrl: string | null = `https://example.com/${id}.thumb.jpg`,
): NotePhoto {
  return {
    id,
    fileName: `photo-${id}.jpg`,
    fileSize: 1234,
    mimeType: "image/jpeg",
    storagePath: `admin-user-id/7/0${id}-photo.jpg`,
    url,
    thumbnailUrl,
  };
}

function renderGallery(photos: NotePhoto[]) {
  return render(<NotePhotoGallery authorName="Alice Johnson" photos={photos} />);
}

function getDialog() {
  const dialog = screen.getByRole("dialog", { hidden: true });

  if (!(dialog instanceof HTMLDialogElement)) {
    throw new Error("Expected a native <dialog> element.");
  }

  return dialog;
}

describe("NotePhotoGallery", () => {
  it("lists one expand button per available photo in a labelled list", () => {
    renderGallery([createPhoto(1), createPhoto(2)]);

    const list = screen.getByRole("list", { name: "photoGalleryLabel" });

    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByRole("button", { name: "photoExpand:1" })).toBeInTheDocument();
    expect(within(list).getByRole("button", { name: "photoExpand:2" })).toBeInTheDocument();
    expect(within(list).getByRole("img", { name: "photoAlt:1" })).toHaveAttribute(
      "src",
      "https://example.com/1.thumb.jpg",
    );
  });

  describe("thumbnails", () => {
    it("shows the thumbnail in the grid without next/image optimization", () => {
      renderGallery([createPhoto(1)]);

      const list = screen.getByRole("list", { name: "photoGalleryLabel" });
      const image = within(list).getByRole("img", { name: "photoAlt:1" });

      expect(image).toHaveAttribute("src", "https://example.com/1.thumb.jpg");
      expect(image).toHaveAttribute("data-unoptimized", "true");
    });

    it("shows the full photo in the lightbox without next/image optimization", async () => {
      const user = userEvent.setup();
      renderGallery([createPhoto(1)]);

      await user.click(screen.getByRole("button", { name: "photoExpand:1" }));

      const image = within(getDialog()).getByRole("img", { name: "photoAlt:1" });

      expect(image).toHaveAttribute("src", "https://example.com/1.jpg");
      expect(image).toHaveAttribute("data-unoptimized", "true");
    });

    it("shows the unavailable tile when the thumbnail url is missing", () => {
      renderGallery([createPhoto(1, "https://example.com/1.jpg", null)]);

      expect(screen.getByText("photoUnavailable")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "photoExpand:1" })).not.toBeInTheDocument();
    });

    it("shows the unavailable tile when the photo url is missing even with a thumbnail", () => {
      renderGallery([createPhoto(1, null, "https://example.com/1.thumb.jpg")]);

      expect(screen.getByText("photoUnavailable")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "photoExpand:1" })).not.toBeInTheDocument();
    });
  });

  it("shows an unavailable tile with no button when the photo url is missing", () => {
    renderGallery([createPhoto(1, null)]);

    expect(screen.getByText("photoUnavailable")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "photoExpand:1" })).not.toBeInTheDocument();
  });

  it("switches to the unavailable tile when the thumbnail fails to load even with a full photo url", () => {
    renderGallery([createPhoto(1)]);

    fireEvent.error(screen.getByRole("img", { name: "photoAlt:1" }));

    expect(screen.getByText("photoUnavailable")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "photoExpand:1" })).not.toBeInTheDocument();
  });

  it("marks the unavailable tile with a decorative icon next to the text", () => {
    renderGallery([createPhoto(1, null)]);

    const tile = screen.getByText("photoUnavailable").closest("li");

    expect(tile).not.toBeNull();
    expect(tile?.querySelector('svg[aria-hidden="true"]')).not.toBeNull();
  });

  it("opens the lightbox on the clicked photo with a close button", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));

    const dialog = getDialog();

    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAccessibleName("photoAlt:1");
    expect(within(dialog).getByRole("img", { name: "photoAlt:1" })).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "photoClose" })).toBeInTheDocument();
  });

  it("has no previous, next or counter for a single photo", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));

    const dialog = getDialog();

    expect(within(dialog).queryByRole("button", { name: "photoPrev" })).not.toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "photoNext" })).not.toBeInTheDocument();
    expect(within(dialog).queryByText("1 / 1")).not.toBeInTheDocument();
  });

  it("moves between photos with the arrow keys and announces the position", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1), createPhoto(2), createPhoto(3)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:2" }));

    const dialog = getDialog();

    expect(within(dialog).getByText("2 / 3")).toHaveAttribute("aria-live", "polite");

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByRole("img", { name: "photoAlt:3" })).toBeInTheDocument();
    expect(within(dialog).getByText("3 / 3")).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(within(dialog).getByText("3 / 3")).toBeInTheDocument();

    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(within(dialog).getByRole("img", { name: "photoAlt:1" })).toBeInTheDocument();
    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument();
  });

  it("hides previous on the first photo and next on the last", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1), createPhoto(2)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));
    const dialog = getDialog();

    expect(within(dialog).queryByRole("button", { name: "photoPrev" })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "photoNext" }));

    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: "photoNext" })).not.toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "photoPrev" }));

    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();
  });

  it("moves focus to the close button when the focused previous button disappears on the first photo", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1), createPhoto(2), createPhoto(3)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:2" }));
    const dialog = getDialog();

    await user.click(within(dialog).getByRole("button", { name: "photoPrev" }));

    expect(within(dialog).getByText("1 / 3")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "photoClose" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");

    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();
  });

  it("moves focus to the close button when the focused next button disappears on the last photo", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1), createPhoto(2)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));
    const dialog = getDialog();

    await user.click(within(dialog).getByRole("button", { name: "photoNext" }));

    expect(within(dialog).getByText("2 / 2")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "photoClose" })).toHaveFocus();

    await user.keyboard("{ArrowLeft}");

    expect(within(dialog).getByText("1 / 2")).toBeInTheDocument();
  });

  it("closes with the close button", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));
    await user.click(within(getDialog()).getByRole("button", { name: "photoClose" }));

    expect(getDialog()).not.toHaveAttribute("open");
    expect(within(getDialog()).queryByRole("img")).not.toBeInTheDocument();
  });

  it("resets when the dialog closes natively (Esc)", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));
    getDialog().close();

    expect(within(getDialog()).queryByRole("img")).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1)]);

    await user.click(screen.getByRole("button", { name: "photoExpand:1" }));
    fireEvent.click(getDialog());

    expect(getDialog()).not.toHaveAttribute("open");
  });

  it("returns focus to the thumbnail that opened the lightbox", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1), createPhoto(2)]);

    const trigger = screen.getByRole("button", { name: "photoExpand:2" });

    await user.click(trigger);
    await user.click(within(getDialog()).getByRole("button", { name: "photoClose" }));

    expect(trigger).toHaveFocus();
  });

  it("returns focus to the trigger after a native close (Esc)", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1)]);

    const trigger = screen.getByRole("button", { name: "photoExpand:1" });

    await user.click(trigger);
    within(getDialog()).getByRole("button", { name: "photoClose" }).focus();
    getDialog().close();

    expect(trigger).toHaveFocus();
  });

  it("moves focus to the gallery when the trigger thumbnail is gone after close", async () => {
    const user = userEvent.setup();
    renderGallery([createPhoto(1), createPhoto(2)]);

    const list = screen.getByRole("list", { name: "photoGalleryLabel" });

    await user.click(screen.getByRole("button", { name: "photoExpand:2" }));
    fireEvent.error(within(list).getByRole("img", { name: "photoAlt:2" }));
    await user.click(within(getDialog()).getByRole("button", { name: "photoClose" }));

    expect(screen.queryByRole("button", { name: "photoExpand:2" })).not.toBeInTheDocument();
    expect(list).toHaveFocus();
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { NoteItem } from "@/features/notes/components/NoteItem";
import type { Note } from "@/features/notes/types/notes";
import type { ImgHTMLAttributes } from "react";

vi.mock("next/image", () => ({
  default: (props: ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img {...props} />
  ),
}));

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string, values?: Record<string, unknown>) => {
      if (key === "photoAlt") {
        return `${prefix}${key}:${String(values?.index)}`;
      }

      return `${prefix}${key}`;
    };
  }),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/features/notes/components/NoteActions", () => ({
  NoteActions: ({ deleteAriaLabel }: { deleteAriaLabel: string }) => (
    <button type="button" aria-label={deleteAriaLabel}>
      Actions
    </button>
  ),
}));

vi.mock("@/lib/utils/formatRelativeTimestamp", () => ({
  formatFullTimestamp: vi.fn(() => "Apr 1, 2026, 12:00"),
  formatRelativeTimestamp: vi.fn(() => "2 days ago"),
}));

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 7,
    content: "Remember the spare towels.",
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    photos: [],
    ...overrides,
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("NoteItem", () => {
  it("renders the note as an anchorable list item with content, time and actions", () => {
    render(<NoteItem note={createNote()} canManageNotes onDelete={vi.fn()} />);

    const item = screen.getByRole("listitem");

    expect(item).toHaveAttribute("id", "note-7");
    expect(screen.getByText("Remember the spare towels.")).toBeInTheDocument();
    const time = screen.getByText("2 days ago");
    expect(time).toHaveAttribute("datetime", "2026-04-01T10:00:00.000Z");
    expect(time).toHaveAttribute("title", "Apr 1, 2026, 12:00");
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("shows the author by name and keeps the 'added by' context for screen readers", () => {
    render(<NoteItem note={createNote()} canManageNotes onDelete={vi.fn()} />);

    expect(screen.getByText("Alice Johnson")).toBeInTheDocument();
    expect(screen.getByText("Alice Johnson")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("notes.item.addedBy")).toBeInTheDocument();
  });

  it("shows the author's initial as a decorative avatar", () => {
    render(
      <NoteItem
        note={createNote({ author: "alice Johnson" })}
        canManageNotes
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("A")).toHaveAttribute("aria-hidden", "true");
  });

  it("falls back to a neutral avatar glyph when the author name is blank", () => {
    render(
      <NoteItem
        note={createNote({ author: "   " })}
        canManageNotes
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("?")).toHaveAttribute("aria-hidden", "true");
  });

  it("offers 'show more' for content that overflows the clamp", () => {
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(120);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(60);

    render(<NoteItem note={createNote()} canManageNotes onDelete={vi.fn()} />);

    expect(
      screen.getByRole("button", { name: "notes.item.showMore" })
    ).toHaveAttribute("aria-expanded", "false");
  });

  it("keeps the delete action keyboard-reachable and reveals it on focus", async () => {
    const user = userEvent.setup();
    render(<NoteItem note={createNote()} canManageNotes onDelete={vi.fn()} />);

    await user.tab();

    const deleteButton = screen.getByRole("button", {
      name: "notes.aria.deleteNoteFrom",
    });
    expect(deleteButton).toHaveFocus();
    expect(deleteButton.parentElement).toHaveClass("group-focus-within:opacity-100");
  });

  it("renders no gallery when the note has no photos", () => {
    render(<NoteItem note={createNote()} canManageNotes onDelete={vi.fn()} />);

    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it("renders note photos in a gallery", () => {
    render(
      <NoteItem
        note={createNote({
          photos: [
            {
              id: 1,
              fileName: "porch.jpg",
              fileSize: 1234,
              mimeType: "image/jpeg",
              storagePath: "admin-user-id/7/00-porch.jpg",
              url: "https://example.com/photo-1.jpg",
              thumbnailUrl: "https://example.com/photo-1.thumb.jpg",
            },
          ],
        })}
        canManageNotes
        onDelete={vi.fn()}
      />
    );

    const image = screen.getByRole("img", {
      name: "notes.item.photoAlt:1",
    });

    expect(image).toHaveAttribute("src", "https://example.com/photo-1.thumb.jpg");
  });

  it("renders a fallback tile when a photo url is unavailable", () => {
    render(
      <NoteItem
        note={createNote({
          photos: [
            {
              id: 1,
              fileName: "porch.jpg",
              fileSize: 1234,
              mimeType: "image/jpeg",
              storagePath: "admin-user-id/7/00-porch.jpg",
              url: null,
              thumbnailUrl: null,
            },
          ],
        })}
        canManageNotes
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText("notes.item.photoUnavailable")).toBeInTheDocument();
  });
});

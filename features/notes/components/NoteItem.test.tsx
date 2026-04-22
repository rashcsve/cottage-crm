import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { NoteItem } from "@/features/notes/components/NoteItem";
import type { Note } from "@/features/notes/types/notes";

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
  NoteActions: () => <div>Actions</div>,
}));

vi.mock("@/features/notes/shared/formatNoteDate", () => ({
  formatNoteTimestamp: vi.fn(() => "Apr 1, 2026, 10:00"),
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

describe("NoteItem", () => {
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

    expect(image).toHaveAttribute("src", "https://example.com/photo-1.jpg");
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

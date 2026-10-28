import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import { NoteList } from "./NoteList";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { Note } from "@/features/notes/types/notes";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/features/notes/components/NoteItem", () => ({
  NoteItem: ({
    note,
    onDelete,
  }: {
    note: Note;
    canManageNotes: boolean;
    onDelete: (note: Note) => void;
  }) => (
    <li data-testid={`note-item-${note.id}`}>
      <span>{note.content}</span>
      <button type="button" onClick={() => onDelete(note)}>
        Delete
      </button>
    </li>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 1,
    content: "First note",
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    photos: [],
    ...overrides,
  };
}

function renderNoteList(
  props: Partial<React.ComponentProps<typeof NoteList>> = {}
) {
  return render(
    <NoteList
      notes={[]}
      onDelete={vi.fn()}
      canManageNotes
      {...props}
    />
  );
}

describe("NoteList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders custom empty state", () => {
    renderNoteList({
      notes: [],
      emptyTitle: "No notes here",
      emptyDescription: "Add a note",
    });

    expect(
      screen.getByRole("heading", { name: "No notes here" })
    ).toBeInTheDocument();
    expect(screen.getByText("Add a note")).toBeInTheDocument();
  });

  it("renders the default translated empty state", () => {
    renderNoteList({ notes: [] });

    expect(
      screen.getByRole("heading", { name: "notes.empty.noNotes" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("notes.empty.noNotesDescription")
    ).toBeInTheDocument();
  });

  it("calls onDelete with the note when its delete button is clicked", () => {
    const onDelete = vi.fn();
    const note = createNote({ id: 1, content: "First note" });

    renderNoteList({ notes: [note], onDelete });

    fireEvent.click(
      within(screen.getByTestId("note-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(note);
    expect(screen.getByTestId("note-item-1")).toBeInTheDocument();
  });

  it("renders updated notes when props change", () => {
    const { rerender } = renderNoteList({
      notes: [createNote({ id: 1, content: "First note" })],
    });

    expect(screen.getByText("First note")).toBeInTheDocument();

    rerender(
      <NoteList
        notes={[
          createNote({ id: 2, content: "Second note" }),
          createNote({ id: 3, content: "Third note" }),
        ]}
        onDelete={vi.fn()}
        canManageNotes
        emptyTitle="No notes"
        emptyDescription="Add a note"
      />
    );

    expect(screen.queryByText("First note")).not.toBeInTheDocument();
    expect(screen.getByText("Second note")).toBeInTheDocument();
    expect(screen.getByText("Third note")).toBeInTheDocument();
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Note } from "@/features/notes/types/notes";
import { NotesPageBody } from "./NotesPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string) => `${prefix}${key}`;
  }),
}));

vi.mock("./NoteList", () => ({
  NoteList: ({ notes }: { notes: Note[] }) => (
    <ul data-testid="note-list">
      {notes.map((note) => (
        <li key={note.id}>{note.content}</li>
      ))}
    </ul>
  ),
}));

vi.mock("./forms/NewNoteForm", () => ({
  NewNoteForm: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="new-note-form">
      <button type="button" onClick={onClose}>
        Close composer
      </button>
    </div>
  ),
}));

function createNotes(count: number): Note[] {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    content: `Note ${index + 1}`,
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    photos: [],
  }));
}

describe("NotesPageBody", () => {
  it("renders the notes inside a region named by the section heading", () => {
    render(<NotesPageBody notes={createNotes(2)} canManageNotes />);

    expect(
      screen.getByRole("heading", { level: 2, name: "notes.sections.notes" })
    ).toBeInTheDocument();

    const region = screen.getByRole("region", { name: "notes.sections.notes" });

    expect(within(region).getByTestId("note-list").children).toHaveLength(2);
  });

  it("shows the note count next to the heading", () => {
    render(<NotesPageBody notes={createNotes(3)} canManageNotes />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens the composer in place of the Add note button and restores it on close", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    await user.click(screen.getByRole("button", { name: "notes.form.openComposer" }));

    expect(screen.getByTestId("new-note-form")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "notes.form.openComposer" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close composer" }));

    expect(screen.queryByTestId("new-note-form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "notes.form.openComposer" })
    ).toBeInTheDocument();
  });

  it("returns focus to the Add note button when the composer closes", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    await user.click(screen.getByRole("button", { name: "notes.form.openComposer" }));
    await user.click(screen.getByRole("button", { name: "Close composer" }));

    expect(
      screen.getByRole("button", { name: "notes.form.openComposer" })
    ).toHaveFocus();
  });

  it("hides the Add note action from viewers", () => {
    render(<NotesPageBody notes={createNotes(1)} canManageNotes={false} />);

    expect(
      screen.queryByRole("button", { name: "notes.form.openComposer" })
    ).not.toBeInTheDocument();
    expect(screen.queryByTestId("new-note-form")).not.toBeInTheDocument();
  });

  it("drops the header card's eyebrow and section description", () => {
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    expect(screen.queryByText("notes.sections.eyebrow")).not.toBeInTheDocument();
    expect(
      screen.queryByText("notes.sections.notesDescription")
    ).not.toBeInTheDocument();
  });
});

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
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

vi.mock("@/features/notes/server/actions", () => ({
  deleteNoteAction: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/shared/Toast/useToast", () => {
  const toastApi = {
    showToast: vi.fn(),
    dismissToast: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  };

  return { useToast: () => toastApi };
});

vi.mock("./forms/NewNoteForm", () => ({
  NewNoteForm: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="new-note-form">
      <label htmlFor="mock-note-content">Content</label>
      <input id="mock-note-content" />
      <button type="button" onClick={onClose}>
        Save note
      </button>
    </div>
  ),
}));

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
const close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
});

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

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(
    screen.getByRole("button", { name: "notes.form.openComposer" })
  );
  const dialog = screen.getByRole("dialog", { name: "notes.form.title" });
  await within(dialog).findByTestId("new-note-form");
  return dialog;
}

describe("NotesPageBody", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = showModal;
    HTMLDialogElement.prototype.close = close;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the notes inside a region named by the section heading", () => {
    render(<NotesPageBody notes={createNotes(2)} canManageNotes />);

    expect(
      screen.getByRole("heading", { level: 2, name: "notes.sections.notes" })
    ).toBeInTheDocument();

    const region = screen.getByRole("region", { name: "notes.sections.notes" });

    expect(within(region).getByTestId("note-list").children).toHaveLength(2);
  });

  it("centers the section heading with the add button so it sits flush with the page top", () => {
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    const heading = screen.getByRole("heading", {
      level: 2,
      name: "notes.sections.notes",
    });
    const sectionHeader = heading.parentElement?.parentElement?.parentElement;
    expect(sectionHeader).toHaveClass("items-center");
  });

  it("shows the note count next to the heading", () => {
    render(<NotesPageBody notes={createNotes(3)} canManageNotes />);

    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens the new note form in a modal panel from the Add note button", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const dialog = await openPanel(user);

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(within(dialog).getByTestId("new-note-form")).toBeInTheDocument();
  });

  it("closes the panel from its Close button and returns focus to Add note", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    const dialog = await openPanel(user);
    await user.click(
      within(dialog).getByRole("button", { name: "notes.form.closeComposer" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("new-note-form")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "notes.form.openComposer" })
    ).toHaveFocus();
  });

  it("closes without asking even with typed input", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    const dialog = await openPanel(user);
    await user.type(within(dialog).getByLabelText("Content"), "Gardener");
    await user.click(
      within(dialog).getByRole("button", { name: "notes.form.closeComposer" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the form finishes a successful add", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    const dialog = await openPanel(user);
    await user.type(within(dialog).getByLabelText("Content"), "Gardener");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("starts a fresh, clean form when the panel is reopened", async () => {
    const user = userEvent.setup();
    render(<NotesPageBody notes={createNotes(1)} canManageNotes />);

    let dialog = await openPanel(user);
    await user.type(within(dialog).getByLabelText("Content"), "Gardener");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));

    dialog = await openPanel(user);
    expect(within(dialog).getByLabelText("Content")).toHaveValue("");

    await user.click(
      within(dialog).getByRole("button", { name: "notes.form.closeComposer" })
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("hides the Add note action and the panel from viewers", () => {
    render(<NotesPageBody notes={createNotes(1)} canManageNotes={false} />);

    expect(
      screen.queryByRole("button", { name: "notes.form.openComposer" })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument();
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

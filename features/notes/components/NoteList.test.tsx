import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { deleteNoteAction } from "@/features/notes/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import { useToast } from "@/shared/Toast/useToast";
import { NoteList } from "./NoteList";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import type { Note } from "@/features/notes/types/notes";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/notes/server/actions", () => ({
  deleteNoteAction: vi.fn(),
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
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteNoteAction = vi.mocked(deleteNoteAction);

type MockRouter = {
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

type MockToastApi = {
  toasts: [];
  showToast: ReturnType<typeof vi.fn>;
  dismissToast: ReturnType<typeof vi.fn>;
  success: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 1,
    content: "First note",
    author: "Alice Johnson",
    authorId: "admin-user-id",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function renderNoteList(
  props: Partial<React.ComponentProps<typeof NoteList>> = {}
) {
  return render(
    <NoteList
      notes={[]}
      canManageNotes
      {...props}
    />
  );
}

function getUndoHandler(toastApi: MockToastApi): () => void {
  const lastCall = toastApi.showToast.mock.calls.at(-1);

  if (!lastCall) {
    throw new Error("Expected showToast to be called.");
  }

  const [, options] = lastCall;
  const action = options?.action;

  if (!action || typeof action.onClick !== "function") {
    throw new Error("Expected undo action in toast options.");
  }

  return action.onClick;
}

async function flushAsyncWork() {
  await Promise.resolve();
  await Promise.resolve();
}

async function advanceUndoWindow() {
  await act(async () => {
    vi.advanceTimersByTime(TOAST_UNDO_WINDOW_MS);
    await flushAsyncWork();
  });
}

describe("NoteList", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    mockRouter = {
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    mockToastApi = {
      toasts: [],
      showToast: vi.fn(() => "toast-1"),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    mockUseRouter.mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>
    );

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>
    );

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });

    mockDeleteNoteAction.mockResolvedValue({
      ok: true,
      data: undefined,
      message: "notes.delete.success",
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("renders custom empty state", () => {
    renderNoteList({
      notes: [],
      emptyTitle: "No notes here",
      emptyDescription: "Add a note",
    });

    expect(screen.getByText("No notes here")).toBeInTheDocument();
    expect(screen.getByText("Add a note")).toBeInTheDocument();
  });

  it("renders the default translated empty state", () => {
    renderNoteList({ notes: [] });

    expect(screen.getByText("notes.empty.noNotes")).toBeInTheDocument();
    expect(
      screen.getByText("notes.empty.noNotesDescription")
    ).toBeInTheDocument();
  });

  it("removes a note immediately and shows undo toast", () => {
    vi.useFakeTimers();
    const notes = [createNote({ id: 1, content: "First note" })];

    renderNoteList({ notes });

    fireEvent.click(
      within(screen.getByTestId("note-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    expect(screen.queryByTestId("note-item-1")).not.toBeInTheDocument();
    expect(mockToastApi.showToast).toHaveBeenCalledWith(
      "notes.delete.success",
      expect.objectContaining({
        type: "info",
        duration: TOAST_UNDO_WINDOW_MS,
        action: expect.objectContaining({
          label: "notes.delete.undo",
          onClick: expect.any(Function),
        }),
      })
    );
  });

  it("restores a note when undo is clicked before timeout", () => {
    vi.useFakeTimers();
    const notes = [
      createNote({ id: 1, content: "First note" }),
      createNote({ id: 2, content: "Second note" }),
    ];

    renderNoteList({ notes });

    fireEvent.click(
      within(screen.getByTestId("note-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    const undo = getUndoHandler(mockToastApi);

    act(() => {
      undo();
    });

    expect(screen.getByTestId("note-item-1")).toBeInTheDocument();
    expect(mockDeleteNoteAction).not.toHaveBeenCalled();
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockToastApi.info).toHaveBeenCalledWith("notes.delete.restored");
  });

  it("commits delete after the undo window expires", async () => {
    vi.useFakeTimers();
    const note = createNote({ id: 1, content: "First note" });

    renderNoteList({ notes: [note] });

    fireEvent.click(
      within(screen.getByTestId("note-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(mockDeleteNoteAction).toHaveBeenCalledWith({ noteId: 1 });
    expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
    expect(mockRouter.refresh).toHaveBeenCalled();
  });

  it("restores note and shows error toast when delete fails", async () => {
    vi.useFakeTimers();
    const note = createNote({ id: 1, content: "First note" });

    mockDeleteNoteAction.mockResolvedValueOnce({
      ok: false,
      error: "notes.delete.error",
    });

    renderNoteList({ notes: [note] });

    fireEvent.click(
      within(screen.getByTestId("note-item-1")).getByRole("button", {
        name: "Delete",
      })
    );

    await advanceUndoWindow();

    expect(screen.getByTestId("note-item-1")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("notes.delete.error");
    expect(mockRouter.refresh).not.toHaveBeenCalled();
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

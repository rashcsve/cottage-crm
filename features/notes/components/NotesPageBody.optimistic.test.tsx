import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { deleteNoteAction } from "@/features/notes/server/actions";
import { TOAST_UNDO_WINDOW_MS } from "@/shared/Toast/constants";
import type { Note, NotePhoto } from "@/features/notes/types/notes";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { NotesPageBody } from "./NotesPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
  useLocale: vi.fn(() => "en"),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
  Link: ({
    href,
    children,
    ...props
  }: {
    href: { pathname: string };
    children: React.ReactNode;
  }) => (
    <a href={href.pathname} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/notes/server/actions", () => ({
  deleteNoteAction: vi.fn(),
}));

vi.mock("./forms/NewNoteForm", () => ({
  NewNoteForm: () => <div data-testid="new-note-form" />,
}));

vi.mock("@/features/notes/components/NotePhotoGallery", () => ({
  NotePhotoGallery: ({ photos }: { photos: NotePhoto[] }) => (
    <p data-testid="note-photo-gallery">{photos.length}</p>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockDeleteNoteAction = vi.mocked(deleteNoteAction);

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
    photos: [],
    ...overrides,
  };
}

function createPhoto(id: number): NotePhoto {
  return {
    id,
    fileName: `photo-${id}.jpg`,
    fileSize: 1234,
    mimeType: "image/jpeg",
    storagePath: `admin-user-id/2/0${id}-photo.jpg`,
    url: `https://example.com/${id}.jpg`,
    thumbnailUrl: `https://example.com/${id}.thumb.jpg`,
  };
}

const firstNote = createNote({ id: 1, content: "First note" });
const secondNote = createNote({
  id: 2,
  content: "Second note",
  photos: [createPhoto(1), createPhoto(2)],
});
const thirdNote = createNote({ id: 3, content: "Third note" });
const recentNote = createNote({
  id: 4,
  content: "Recent note",
  createdAt: "2026-10-29T10:00:00.000Z",
});

const pageProps = {
  canManageNotes: true,
  activeShow: "all",
  currentUserId: "admin-user-id",
  todayIso: "2026-10-30",
} as const;

function renderBody(notes: Note[] = [firstNote, secondNote, thirdNote]) {
  return render(<NotesPageBody notes={notes} {...pageProps} />);
}

function getRow(content: string) {
  const row = screen.getByText(content).closest("li");

  if (!row) {
    throw new Error(`Expected a row for "${content}".`);
  }

  return row;
}

function clickDelete(content: string) {
  fireEvent.click(
    within(getRow(content)).getByRole("button", {
      name: "notes.aria.deleteNoteFrom",
    }),
  );
}

function statusTexts() {
  return screen.getAllByRole("status").map((status) => status.textContent);
}

function noteCount(group: "thisWeek" | "earlier" = "earlier") {
  const name = `notes.groups.${group}`;
  const region = screen.queryByRole("region", { name });

  if (!region) {
    return "0";
  }

  return within(region).getByRole("heading", { level: 3, name })
    .nextElementSibling?.textContent;
}

function rowContents() {
  const region = screen.getByRole("region", { name: "notes.sections.notes" });

  return within(region)
    .queryAllByRole("listitem")
    .map((row) =>
      [firstNote, secondNote, thirdNote]
        .map((note) => note.content)
        .find((content) => within(row).queryByText(content)),
    );
}

function getUndoHandler(toastApi: MockToastApi, callIndex = -1): () => void {
  const lastCall = toastApi.showToast.mock.calls.at(callIndex);

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

describe("NotesPageBody optimistic delete", () => {
  let mockRefresh: ReturnType<typeof vi.fn>;
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    vi.useFakeTimers();
    mockRefresh = vi.fn();

    mockToastApi = {
      toasts: [],
      showToast: vi.fn(() => "toast-1"),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    };

    mockUseRouter.mockReturnValue({
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      refresh: mockRefresh,
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>,
    );

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        values?.count === undefined
          ? translator(`${prefix}${key}`, values)
          : `${prefix}${key}:${String(values.count)}`) as unknown as ReturnType<
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
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe("characterization", () => {
    it("renders the rows in order and the note count next to their group heading", () => {
      renderBody();

      expect(rowContents()).toEqual(["First note", "Second note", "Third note"]);
      expect(noteCount()).toBe("3");
      expect(screen.getAllByTestId("note-photo-gallery")).toHaveLength(1);
    });

    it("renders the empty state and its announcement without notes, and no group", () => {
      renderBody([]);

      expect(rowContents()).toEqual([]);
      expect(noteCount()).toBe("0");
      expect(
        screen.getByRole("heading", { name: "notes.empty.noNotes" }),
      ).toBeInTheDocument();
      expect(statusTexts()).toContain("notes.empty.noNotes");
    });
  });

  describe("count", () => {
    it("lowers the group count immediately together with the row", () => {
      renderBody();

      clickDelete("First note");

      expect(rowContents()).toEqual(["Second note", "Third note"]);
      expect(noteCount()).toBe("2");
      expect(mockDeleteNoteAction).not.toHaveBeenCalled();
    });

    it("drops the group and shows the empty state and its announcement when the last note is deleted", () => {
      renderBody([firstNote]);

      clickDelete("First note");

      expect(rowContents()).toEqual([]);
      expect(noteCount()).toBe("0");
      expect(statusTexts()).toContain("notes.empty.noNotes");
    });

    it("restores the group count together with the row on undo", () => {
      renderBody();

      clickDelete("First note");
      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(rowContents()).toEqual(["First note", "Second note", "Third note"]);
      expect(noteCount()).toBe("3");
    });

    it("restores the group count together with the row and shows an error toast when the commit fails", async () => {
      mockDeleteNoteAction.mockResolvedValueOnce({
        ok: false,
        error: "notes.delete.error",
      });
      renderBody();

      clickDelete("First note");
      await advanceUndoWindow();

      expect(rowContents()).toEqual(["First note", "Second note", "Third note"]);
      expect(noteCount()).toBe("3");
      expect(mockToastApi.error).toHaveBeenCalledWith(
        "notes.delete.error",
        expect.objectContaining({
          action: expect.objectContaining({
            label: "notes.delete.retry",
            onClick: expect.any(Function),
          }),
        }),
      );
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it("keeps the lowered group count after a successful commit and refreshes once", async () => {
      const { rerender } = renderBody();

      clickDelete("First note");
      await advanceUndoWindow();

      expect(mockDeleteNoteAction).toHaveBeenCalledWith({ noteId: 1 });
      expect(mockRefresh).toHaveBeenCalledTimes(1);
      expect(noteCount()).toBe("2");

      rerender(<NotesPageBody notes={[secondNote, thirdNote]} {...pageProps} />);

      expect(rowContents()).toEqual(["Second note", "Third note"]);
      expect(noteCount()).toBe("2");
    });

    it("lowers the group count for each of two deletes in a row and keeps the other hidden when one is undone", () => {
      mockToastApi.showToast
        .mockReturnValueOnce("toast-first")
        .mockReturnValueOnce("toast-third");
      renderBody();

      clickDelete("First note");
      clickDelete("Third note");

      expect(rowContents()).toEqual(["Second note"]);
      expect(noteCount()).toBe("1");

      act(() => {
        getUndoHandler(mockToastApi, 0)();
      });

      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-first");
      expect(mockToastApi.dismissToast).not.toHaveBeenCalledWith("toast-third");
      expect(rowContents()).toEqual(["First note", "Second note"]);
      expect(noteCount()).toBe("2");
    });
  });

  describe("summary", () => {
    it("lowers the header summary and the This week group together with the row, then restores both on undo", () => {
      renderBody([recentNote, firstNote, secondNote]);

      expect(
        screen.getByText("notes.summary.total:3 · notes.summary.thisWeek:1"),
      ).toBeInTheDocument();
      expect(noteCount("thisWeek")).toBe("1");
      expect(noteCount("earlier")).toBe("2");

      clickDelete("Recent note");

      expect(screen.getByText("notes.summary.total:2")).toBeInTheDocument();
      expect(noteCount("thisWeek")).toBe("0");
      expect(noteCount("earlier")).toBe("2");

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(
        screen.getByText("notes.summary.total:3 · notes.summary.thisWeek:1"),
      ).toBeInTheDocument();
      expect(noteCount("thisWeek")).toBe("1");
    });

    it("lowers the total but keeps the This week count when an older note is deleted", () => {
      renderBody([recentNote, firstNote, secondNote]);

      clickDelete("First note");

      expect(
        screen.getByText("notes.summary.total:2 · notes.summary.thisWeek:1"),
      ).toBeInTheDocument();
      expect(noteCount("thisWeek")).toBe("1");
      expect(noteCount("earlier")).toBe("1");
    });
  });

  describe("notes with photos", () => {
    it("hides the photos with the row, lowers the group count and restores both on undo", () => {
      renderBody();

      clickDelete("Second note");

      expect(screen.queryByTestId("note-photo-gallery")).not.toBeInTheDocument();
      expect(noteCount()).toBe("2");

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(
        within(getRow("Second note")).getByTestId("note-photo-gallery"),
      ).toHaveTextContent("2");
      expect(noteCount()).toBe("3");
    });

    it("commits the delete with only the note id after the undo window", async () => {
      renderBody();

      clickDelete("Second note");
      await advanceUndoWindow();

      expect(mockDeleteNoteAction).toHaveBeenCalledTimes(1);
      expect(mockDeleteNoteAction).toHaveBeenCalledWith({ noteId: 2 });
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe("undo flow (moved from NoteList)", () => {
    it("removes a note immediately and shows undo toast", () => {
      renderBody([firstNote]);

      clickDelete("First note");

      expect(screen.queryByText("First note")).not.toBeInTheDocument();
      expect(mockToastApi.showToast).toHaveBeenCalledWith(
        "notes.delete.success",
        expect.objectContaining({
          type: "info",
          duration: TOAST_UNDO_WINDOW_MS,
          action: expect.objectContaining({
            label: "notes.delete.undo",
            onClick: expect.any(Function),
          }),
        }),
      );
    });

    it("restores a note when undo is clicked before timeout", () => {
      renderBody([firstNote, secondNote]);

      clickDelete("First note");

      act(() => {
        getUndoHandler(mockToastApi)();
      });

      expect(screen.getByText("First note")).toBeInTheDocument();
      expect(mockDeleteNoteAction).not.toHaveBeenCalled();
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockToastApi.info).toHaveBeenCalledWith("notes.delete.restored");
    });

    it("commits delete after the undo window expires", async () => {
      renderBody([firstNote]);

      clickDelete("First note");
      await advanceUndoWindow();

      expect(mockDeleteNoteAction).toHaveBeenCalledWith({ noteId: 1 });
      expect(mockToastApi.dismissToast).toHaveBeenCalledWith("toast-1");
      expect(mockRefresh).toHaveBeenCalled();
    });

    it("restores note and shows error toast when delete fails", async () => {
      mockDeleteNoteAction.mockResolvedValueOnce({
        ok: false,
        error: "notes.delete.error",
      });
      renderBody([firstNote]);

      clickDelete("First note");
      await advanceUndoWindow();

      expect(screen.getByText("First note")).toBeInTheDocument();
      expect(mockToastApi.error).toHaveBeenCalledWith(
        "notes.delete.error",
        expect.objectContaining({
          action: expect.objectContaining({
            label: "notes.delete.retry",
            onClick: expect.any(Function),
          }),
        }),
      );
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });
});

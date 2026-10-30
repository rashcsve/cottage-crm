import { render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Note, NotesShowFilter } from "@/features/notes/types/notes";
import { NotesPageBody } from "./NotesPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string, values?: { count?: number }) =>
      values?.count === undefined
        ? `${prefix}${key}`
        : `${prefix}${key}:${values.count}`;
  }),
}));

vi.mock("./NoteList", () => ({
  NoteList: ({ notes, emptyTitle }: { notes: Note[]; emptyTitle?: string }) =>
    notes.length === 0 ? (
      <p>{emptyTitle}</p>
    ) : (
      <ul data-testid="note-list">
        {notes.map((note) => (
          <li key={note.id}>{note.content}</li>
        ))}
      </ul>
    ),
}));

vi.mock("./NoteQuickAddBar", () => ({
  NoteQuickAddBar: ({
    children,
  }: {
    children: (headerTrigger: React.ReactNode) => React.ReactNode;
  }) => (
    <div data-testid="note-quick-add-bar">
      {children(<span data-testid="header-trigger" />)}
    </div>
  ),
}));

vi.mock("@/features/notes/server/actions", () => ({
  deleteNoteAction: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  Link: ({
    href,
    children,
    ...props
  }: {
    href: { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
  }) => (
    <a
      href={
        href.query
          ? `${href.pathname}?${new URLSearchParams(href.query).toString()}`
          : href.pathname
      }
      {...props}
    >
      {children}
    </a>
  ),
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

const TODAY_ISO = "2026-10-30";
const CURRENT_USER_ID = "admin-user-id";

const photo = {
  id: 1,
  fileName: "photo-1.jpg",
  fileSize: 1234,
  mimeType: "image/jpeg",
  storagePath: "admin-user-id/1/01-photo.jpg",
  url: "https://example.com/1.jpg",
  thumbnailUrl: "https://example.com/1.thumb.jpg",
};

function createNote(overrides: Partial<Note> = {}): Note {
  return {
    id: 1,
    content: "Note",
    author: "Alice Johnson",
    authorId: CURRENT_USER_ID,
    createdAt: "2026-10-29T10:00:00.000Z",
    photos: [],
    ...overrides,
  };
}

const recentMine = createNote({ id: 1, content: "Recent mine" });
const recentOtherWithPhoto = createNote({
  id: 2,
  content: "Recent other with photo",
  author: "Bob",
  authorId: "other-user-id",
  createdAt: "2026-10-24T10:00:00.000Z",
  photos: [photo],
});
const olderOther = createNote({
  id: 3,
  content: "Older other",
  author: "Bob",
  authorId: "other-user-id",
  createdAt: "2026-04-01T10:00:00.000Z",
});
const allNotes = [recentMine, recentOtherWithPhoto, olderOther];

function renderBody({
  notes = allNotes,
  activeShow = "all",
  canManageNotes = true,
}: {
  notes?: Note[];
  activeShow?: NotesShowFilter;
  canManageNotes?: boolean;
} = {}) {
  return render(
    <NotesPageBody
      notes={notes}
      canManageNotes={canManageNotes}
      activeShow={activeShow}
      currentUserId={CURRENT_USER_ID}
      todayIso={TODAY_ISO}
    />,
  );
}

function groupContents(group: "thisWeek" | "earlier") {
  const region = screen.getByRole("region", { name: `notes.groups.${group}` });

  return within(region)
    .queryAllByRole("listitem")
    .map((row) => row.textContent);
}

function groupBadge(group: "thisWeek" | "earlier") {
  const name = `notes.groups.${group}`;
  const region = screen.getByRole("region", { name });

  return within(region).getByRole("heading", { level: 3, name })
    .nextElementSibling?.textContent;
}

describe("NotesPageBody", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders one region named by the hidden section heading with This week and Earlier groups inside", () => {
    renderBody();

    const region = screen.getByRole("region", { name: "notes.sections.notes" });

    expect(
      within(region).getByRole("heading", { level: 2, name: "notes.sections.notes" }),
    ).toHaveClass("sr-only");
    expect(
      within(region)
        .getAllByRole("heading", { level: 3 })
        .map((heading) => heading.textContent),
    ).toEqual(["notes.groups.thisWeek", "notes.groups.earlier"]);
    expect(groupContents("thisWeek")).toEqual([
      "Recent mine",
      "Recent other with photo",
    ]);
    expect(groupContents("earlier")).toEqual(["Older other"]);
    expect(groupBadge("thisWeek")).toBe("2");
    expect(groupBadge("earlier")).toBe("1");
  });

  it("drops the old section header with its count badge", () => {
    renderBody();

    expect(screen.queryByTestId("notes-count")).not.toBeInTheDocument();
    expect(screen.queryByText("notes.sections.eyebrow")).not.toBeInTheDocument();
    expect(
      screen.queryByText("notes.sections.notesDescription"),
    ).not.toBeInTheDocument();
  });

  it("hides a group that has no notes", () => {
    renderBody({ notes: [olderOther] });

    expect(
      screen.queryByRole("region", { name: "notes.groups.thisWeek" }),
    ).not.toBeInTheDocument();
    expect(groupContents("earlier")).toEqual(["Older other"]);
  });

  it("summarises all notes and this week's notes in the header", () => {
    renderBody();

    expect(
      screen.getByText("notes.summary.total:3 · notes.summary.thisWeek:2"),
    ).toBeInTheDocument();
  });

  it("keeps the summary on all notes while a filter narrows the groups", () => {
    renderBody({ activeShow: "photos" });

    expect(
      screen.getByText("notes.summary.total:3 · notes.summary.thisWeek:2"),
    ).toBeInTheDocument();
    expect(groupContents("thisWeek")).toEqual(["Recent other with photo"]);
    expect(groupBadge("thisWeek")).toBe("1");
    expect(
      screen.queryByRole("region", { name: "notes.groups.earlier" }),
    ).not.toBeInTheDocument();
  });

  it("shows only the current user's notes for Mine", () => {
    renderBody({ activeShow: "mine" });

    expect(groupContents("thisWeek")).toEqual(["Recent mine"]);
    expect(
      screen.queryByRole("region", { name: "notes.groups.earlier" }),
    ).not.toBeInTheDocument();
  });

  it("renders the show filter chips with the active one marked", () => {
    renderBody({ activeShow: "mine" });

    const nav = screen.getByRole("navigation", {
      name: "notes.showFilter.ariaLabel",
    });

    expect(
      within(nav)
        .getAllByRole("link")
        .filter((link) => link.getAttribute("aria-current") === "page")
        .map((link) => link.textContent),
    ).toEqual(["notes.showFilter.mine"]);
  });

  it("shows the filtered-empty state with a Show all link when the filter matches nothing", () => {
    renderBody({ notes: [recentMine, olderOther], activeShow: "photos" });

    expect(
      screen.getByRole("heading", { name: "notes.empty.filteredTitle" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "notes.empty.showAll" }),
    ).toHaveAttribute("href", "/notes");
    expect(screen.queryAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "notes.empty.filteredTitle",
    ]);
    expect(screen.queryByTestId("note-list")).not.toBeInTheDocument();
  });

  it("shows the no-notes empty state without groups when there are no notes and no filter", () => {
    renderBody({ notes: [] });

    expect(screen.getByText("notes.empty.noNotes")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "notes.empty.filteredTitle" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "notes.groups.thisWeek" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("notes.summary.nothing")).toBeInTheDocument();
  });

  it("wraps the page in the quick-add bar for admins and puts its header trigger before the chips and groups", () => {
    renderBody();

    const quickAdd = screen.getByTestId("note-quick-add-bar");
    const headerTrigger = screen.getByTestId("header-trigger");
    const chips = screen.getByRole("navigation", {
      name: "notes.showFilter.ariaLabel",
    });
    const region = screen.getByRole("region", { name: "notes.sections.notes" });

    expect(quickAdd).toContainElement(region);
    for (const later of [chips, region]) {
      expect(
        headerTrigger.compareDocumentPosition(later) &
          Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
    }
  });

  it("hides the quick-add bar and its trigger from viewers", () => {
    renderBody({ canManageNotes: false });

    expect(screen.queryByTestId("note-quick-add-bar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("header-trigger")).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "notes.sections.notes" }),
    ).toBeInTheDocument();
  });
});

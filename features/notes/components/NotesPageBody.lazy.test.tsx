import { act, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { dynamicLoads } from "@/tests/utils/spied-dynamic";
import { NotesPageBody } from "./NotesPageBody";

vi.mock("next/dynamic", async () => {
  const { createSpiedDynamic } = await import("@/tests/utils/spied-dynamic");

  return createSpiedDynamic();
});

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string) => `${prefix}${key}`;
  }),
}));

vi.mock("./NoteList", () => ({
  NoteList: () => null,
}));

vi.mock("./forms/NewNoteForm", () => ({
  NewNoteForm: () => <div data-testid="new-note-form" />,
}));

describe("NotesPageBody form loading", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("requests the form chunk only when an admin opens the panel", async () => {
    const user = userEvent.setup();
    dynamicLoads.hold();

    const { unmount } = render(
      <NotesPageBody notes={[]} canManageNotes={false} />
    );

    expect(
      screen.queryByRole("button", { name: "notes.form.openComposer" })
    ).not.toBeInTheDocument();
    expect(dynamicLoads.loader).not.toHaveBeenCalled();
    unmount();

    render(<NotesPageBody notes={[]} canManageNotes />);

    expect(dynamicLoads.loader).not.toHaveBeenCalled();

    screen.getByRole("button", { name: "notes.form.openComposer" }).focus();
    await user.keyboard("{Enter}");

    const dialog = screen.getByRole("dialog", { name: "notes.form.title" });
    expect(await within(dialog).findByRole("status")).toHaveTextContent(
      "common.loading"
    );
    expect(dynamicLoads.loader).toHaveBeenCalledTimes(1);

    await user.click(
      within(dialog).getByRole("button", { name: "notes.form.closeComposer" })
    );

    const addButton = screen.getByRole("button", {
      name: "notes.form.openComposer",
    });
    await waitFor(() => expect(addButton).toHaveFocus());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await act(async () => {
      dynamicLoads.release();
    });
    expect(addButton).toHaveFocus();
    expect(screen.queryByTestId("new-note-form")).not.toBeInTheDocument();
    await user.keyboard("{Enter}");

    expect(await screen.findByTestId("new-note-form")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(dynamicLoads.loader).toHaveBeenCalledTimes(1);
  });

  it("keeps the page usable and offers a reload when the form chunk fails", async () => {
    vi.resetModules();
    vi.spyOn(console, "error").mockImplementation(() => {});
    const user = userEvent.setup();
    const { NotesPageBody: FreshNotesPageBody } = await import(
      "./NotesPageBody"
    );
    dynamicLoads.loader.mockClear();
    dynamicLoads.fail(new Error("ChunkLoadError"));

    render(<FreshNotesPageBody notes={[]} canManageNotes />);

    screen.getByRole("button", { name: "notes.form.openComposer" }).focus();
    await user.keyboard("{Enter}");

    const dialog = screen.getByRole("dialog", { name: "notes.form.title" });
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "common.formLoadError"
    );
    const reloadButton = within(dialog).getByRole("button", {
      name: "common.reloadPage",
    });
    await waitFor(() => expect(reloadButton).toHaveFocus());
    expect(screen.queryByRole("status")).not.toBeInTheDocument();

    await user.click(
      within(dialog).getByRole("button", { name: "notes.form.closeComposer" })
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "notes.form.openComposer" })
      ).toHaveFocus()
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    await user.keyboard("{Enter}");

    const reopenedDialog = screen.getByRole("dialog", {
      name: "notes.form.title",
    });
    expect(await within(reopenedDialog).findByRole("alert")).toHaveTextContent(
      "common.formLoadError"
    );
    await waitFor(() =>
      expect(
        within(reopenedDialog).getByRole("button", {
          name: "common.reloadPage",
        })
      ).toHaveFocus()
    );
    expect(dynamicLoads.loader).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });
});

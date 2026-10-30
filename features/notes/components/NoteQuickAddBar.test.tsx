import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteQuickAddBar } from "./NoteQuickAddBar";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return (key: string) => `${prefix}${key}`;
  }),
}));

vi.mock("./forms/NewNoteForm", () => ({
  NewNoteForm: ({ onAdded }: { onAdded: (message: string) => void }) => (
    <div data-testid="new-note-form">
      <label htmlFor="mock-note-content">Content</label>
      <input id="mock-note-content" />
      <button type="button" onClick={() => onAdded("Note added")}>
        Save note
      </button>
    </div>
  ),
}));

const TRIGGER_NAME = "notes.form.openComposer";

function getTriggers() {
  return screen.getAllByRole("button", { name: TRIGGER_NAME });
}

function renderBar() {
  return render(
    <NoteQuickAddBar>
      {(headerTrigger) => (
        <>
          <header data-testid="page-header">{headerTrigger}</header>
          <ul data-testid="note-list" />
        </>
      )}
    </NoteQuickAddBar>,
  );
}

async function openPanel(
  user: ReturnType<typeof userEvent.setup>,
  trigger: HTMLElement,
) {
  await user.click(trigger);
  const dialog = screen.getByRole("dialog", { name: "notes.form.title" });
  await within(dialog).findByTestId("new-note-form");
  return dialog;
}

describe("NoteQuickAddBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("hands one Add note trigger to the page header and pins another after the list, with the panel closed", () => {
    renderBar();

    const triggers = getTriggers();
    const list = screen.getByTestId("note-list");

    expect(triggers).toHaveLength(2);
    expect(screen.getByTestId("page-header")).toContainElement(triggers[0]);
    expect(
      triggers[0].compareDocumentPosition(list) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      triggers[1].compareDocumentPosition(list) &
        Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("new-note-form")).not.toBeInTheDocument();
  });

  it.each([
    ["header", 0],
    ["pinned", 1],
  ])(
    "opens the new note form from the %s trigger and returns focus to it on Close",
    async (_placement, triggerIndex) => {
      const user = userEvent.setup();
      renderBar();

      const trigger = getTriggers()[triggerIndex];
      const dialog = await openPanel(user, trigger);

      expect(within(dialog).getByTestId("new-note-form")).toBeInTheDocument();

      await user.click(
        within(dialog).getByRole("button", { name: "notes.form.closeComposer" }),
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.queryByTestId("new-note-form")).not.toBeInTheDocument();
      expect(trigger).toHaveFocus();
    },
  );

  it("closes without asking even with typed input", async () => {
    const user = userEvent.setup();
    renderBar();

    const dialog = await openPanel(user, getTriggers()[1]);
    await user.type(within(dialog).getByLabelText("Content"), "Gardener");
    await user.click(
      within(dialog).getByRole("button", { name: "notes.form.closeComposer" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes when the form finishes a successful add, announces it outside the sheet and starts a fresh form when reopened", async () => {
    const user = userEvent.setup();
    renderBar();

    expect(screen.getByRole("status")).toHaveTextContent("");

    const trigger = getTriggers()[1];
    let dialog = await openPanel(user, trigger);
    await user.type(within(dialog).getByLabelText("Content"), "Gardener");
    await user.click(within(dialog).getByRole("button", { name: "Save note" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("Note added");

    dialog = await openPanel(user, trigger);
    expect(within(dialog).getByLabelText("Content")).toHaveValue("");
  });
});

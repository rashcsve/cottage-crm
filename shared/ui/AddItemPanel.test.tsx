import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { AddItemPanel, AddItemPanelFooter } from "./AddItemPanel";

const DISCARD = {
  message: "Discard note?",
  confirmLabel: "Discard",
  cancelLabel: "Keep editing",
};

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
const show = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
const close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
});

function mockDesktop(matches: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: query.includes("min-width") ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function Harness({
  modal,
  isDirty = false,
  onClose = vi.fn(),
}: {
  modal?: boolean;
  isDirty?: boolean;
  onClose?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [outsideClicks, setOutsideClicks] = useState(0);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Add note
      </button>
      <button type="button" onClick={() => setOutsideClicks((n) => n + 1)}>
        Calendar day ({outsideClicks})
      </button>
      <AddItemPanel
        open={open}
        onClose={() => {
          onClose();
          setOpen(false);
        }}
        title="New note"
        titleId="new-note-title"
        closeLabel="Close"
        modal={modal}
        isDirty={isDirty}
        discard={DISCARD}
      >
        <label htmlFor="note-content">Content</label>
        <input id="note-content" />
      </AddItemPanel>
    </>
  );
}

async function openPanel(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: "Add note" }));
  return screen.getByRole("dialog", { name: "New note" });
}

function pressEscapeInModal(dialog: HTMLElement) {
  fireEvent.keyDown(dialog, { key: "Escape" });
  const cancel = new Event("cancel", { cancelable: true });
  fireEvent(dialog, cancel);
  return cancel;
}

const panelProps = {
  title: "New note",
  titleId: "new-note-title",
  closeLabel: "Close",
  discard: DISCARD,
};

describe("AddItemPanel", () => {
  beforeEach(() => {
    HTMLDialogElement.prototype.showModal = showModal;
    HTMLDialogElement.prototype.show = show;
    HTMLDialogElement.prototype.close = close;
    mockDesktop(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("is closed until opened, then opens as a modal labelled by its title", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const dialog = await openPanel(user);

    expect(dialog).toHaveAttribute("open");
    expect(dialog).toHaveAttribute("aria-labelledby", "new-note-title");
    expect(showModal).toHaveBeenCalledTimes(1);
    expect(show).not.toHaveBeenCalled();
  });

  it("focuses the first field on open and returns focus to the opener on close", async () => {
    const user = userEvent.setup();
    render(<Harness />);

    await openPanel(user);
    expect(screen.getByLabelText("Content")).toHaveFocus();

    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add note" })).toHaveFocus();
  });

  it("closes from the Close button when the form is clean", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await openPanel(user);
    await user.click(screen.getByRole("button", { name: "Close" }));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(close).toHaveBeenCalled();
  });

  it("closes once on Escape when the form is clean", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    const dialog = await openPanel(user);
    const cancel = pressEscapeInModal(dialog);

    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("routes the native cancel event through the dirty check", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} isDirty />);

    const dialog = await openPanel(user);
    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialog, cancel);

    expect(cancel.defaultPrevented).toBe(true);
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByText("Discard note?")).toBeInTheDocument();
  });

  it("closes on a backdrop click in the modal variant", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    const dialog = await openPanel(user);
    fireEvent.click(dialog);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when clicking inside the panel content", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    await openPanel(user);
    await user.click(screen.getByLabelText("Content"));

    expect(onClose).not.toHaveBeenCalled();
  });

  it("calls onClose when the dialog is closed natively while open", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<Harness onClose={onClose} />);

    const dialog = await openPanel(user);
    (dialog as HTMLDialogElement).close();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens when mounted with open already true", () => {
    render(
      <AddItemPanel {...panelProps} open onClose={vi.fn()}>
        <label htmlFor="note-content">Content</label>
        <input id="note-content" />
      </AddItemPanel>,
    );

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Content")).toHaveFocus();
  });

  it("focuses the dialog itself when it has no focusable content", () => {
    render(
      <AddItemPanel {...panelProps} open onClose={vi.fn()}>
        <p>Nothing to fill in</p>
      </AddItemPanel>,
    );

    expect(screen.getByRole("dialog", { name: "New note" })).toHaveFocus();
  });

  it("keeps its open mode when modal changes while open", () => {
    mockDesktop(true);
    const { rerender } = render(
      <AddItemPanel {...panelProps} open modal onClose={vi.fn()}>
        <input aria-label="Content" />
      </AddItemPanel>,
    );

    rerender(
      <AddItemPanel {...panelProps} open modal={false} onClose={vi.fn()}>
        <input aria-label="Content" />
      </AddItemPanel>,
    );

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(show).not.toHaveBeenCalled();
  });

  describe("when the form is dirty", () => {
    it("asks before closing from the Close button and discards on confirm", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness onClose={onClose} isDirty />);

      await openPanel(user);
      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText("Discard note?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Keep editing" })).toHaveFocus();

      await user.click(screen.getByRole("button", { name: "Discard" }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Add note" })).toHaveFocus();
    });

    it("asks before closing on Escape and keeps editing on cancel", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness onClose={onClose} isDirty />);

      const dialog = await openPanel(user);
      pressEscapeInModal(dialog);

      expect(screen.getByRole("alert")).toHaveTextContent("Discard note?");

      await user.click(screen.getByRole("button", { name: "Keep editing" }));

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.queryByText("Discard note?")).not.toBeInTheDocument();
      expect(screen.getByRole("dialog", { name: "New note" })).toHaveAttribute(
        "open",
      );
      expect(screen.getByLabelText("Content")).toHaveFocus();
    });

    it("asks before closing on a backdrop click", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness onClose={onClose} isDirty />);

      const dialog = await openPanel(user);
      fireEvent.click(dialog);

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByText("Discard note?")).toBeInTheDocument();
    });

    it("keeps the confirmation when Close is pressed again", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness onClose={onClose} isDirty />);

      await openPanel(user);
      await user.click(screen.getByRole("button", { name: "Close" }));
      await user.click(screen.getByRole("button", { name: "Close" }));

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getAllByText("Discard note?")).toHaveLength(1);
    });

    it("hides the confirmation once the form is clean again", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<Harness isDirty />);

      await openPanel(user);
      await user.click(screen.getByRole("button", { name: "Close" }));
      expect(screen.getByText("Discard note?")).toBeInTheDocument();

      rerender(<Harness isDirty={false} />);

      expect(screen.queryByText("Discard note?")).not.toBeInTheDocument();
    });

    it("hides the confirmation after Discard even if the parent keeps it open", async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(
        <AddItemPanel {...panelProps} open isDirty onClose={onClose}>
          <input aria-label="Content" />
        </AddItemPanel>,
      );

      await user.click(screen.getByRole("button", { name: "Close" }));
      await user.click(screen.getByRole("button", { name: "Discard" }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("Discard note?")).not.toBeInTheDocument();
    });
  });

  describe("modal={false}", () => {
    it("opens non-modally on lg+ and leaves the page interactive", async () => {
      mockDesktop(true);
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness modal={false} onClose={onClose} />);

      const dialog = await openPanel(user);

      expect(show).toHaveBeenCalledTimes(1);
      expect(showModal).not.toHaveBeenCalled();

      await user.click(screen.getByRole("button", { name: /Calendar day/ }));

      expect(
        screen.getByRole("button", { name: "Calendar day (1)" }),
      ).toBeInTheDocument();
      expect(dialog).toHaveAttribute("open");
      expect(onClose).not.toHaveBeenCalled();
    });

    it("ignores clicks on the dialog surface on lg+", async () => {
      mockDesktop(true);
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness modal={false} onClose={onClose} />);

      const dialog = await openPanel(user);
      fireEvent.click(dialog);

      expect(onClose).not.toHaveBeenCalled();
    });

    it("still closes on Escape on lg+", async () => {
      mockDesktop(true);
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness modal={false} onClose={onClose} />);

      const dialog = await openPanel(user);
      fireEvent.keyDown(dialog, { key: "Escape" });

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("closes on Escape while focus is on the page, and leaves focus there", async () => {
      mockDesktop(true);
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness modal={false} onClose={onClose} />);

      await openPanel(user);
      const calendarDay = screen.getByRole("button", { name: /Calendar day/ });
      await user.click(calendarDay);
      await user.keyboard("{Escape}");

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      expect(calendarDay).toHaveFocus();
    });

    it("ignores a native cancel event on lg+", async () => {
      mockDesktop(true);
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness modal={false} onClose={onClose} />);

      const dialog = await openPanel(user);
      fireEvent.keyDown(dialog, { key: "Escape" });
      fireEvent(dialog, new Event("cancel", { cancelable: true }));

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("asks before discarding on lg+ and discards on confirm", async () => {
      mockDesktop(true);
      const user = userEvent.setup();
      const onClose = vi.fn();
      render(<Harness modal={false} onClose={onClose} isDirty />);

      await openPanel(user);
      await user.click(screen.getByRole("button", { name: /Calendar day/ }));
      await user.keyboard("{Escape}");

      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole("button", { name: "Keep editing" })).toHaveFocus();

      await user.click(screen.getByRole("button", { name: "Discard" }));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("opens as a modal sheet below lg", async () => {
      mockDesktop(false);
      const user = userEvent.setup();
      render(<Harness modal={false} />);

      await openPanel(user);

      expect(showModal).toHaveBeenCalledTimes(1);
      expect(show).not.toHaveBeenCalled();
    });
  });

  describe("AddItemPanelFooter", () => {
    it("pins its content to the panel footer, outside the scrolling body and after it in tab order", async () => {
      const user = userEvent.setup();

      render(
        <AddItemPanel open onClose={vi.fn()} {...panelProps}>
          <form id="footer-form">
            <label htmlFor="note-content">Content</label>
            <input id="note-content" />
          </form>
          <AddItemPanelFooter>
            <button type="submit" form="footer-form">
              Save
            </button>
          </AddItemPanelFooter>
        </AddItemPanel>,
      );

      const dialog = screen.getByRole("dialog", { name: "New note" });
      const field = screen.getByLabelText("Content");
      const save = await screen.findByRole("button", { name: "Save" });
      const scrollingBody = field.closest("form")?.parentElement;

      expect(dialog).toContainElement(save);
      expect(scrollingBody).not.toContainElement(save);

      field.focus();
      await user.tab();

      expect(save).toHaveFocus();
    });

    it("renders its content inline when used outside a panel", () => {
      render(
        <div data-testid="host">
          <AddItemPanelFooter>
            <button type="button">Save</button>
          </AddItemPanelFooter>
        </div>,
      );

      expect(screen.getByTestId("host")).toContainElement(
        screen.getByRole("button", { name: "Save" }),
      );
    });
  });
});

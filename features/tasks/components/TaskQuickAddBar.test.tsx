import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { TaskQuickAddBar } from "./TaskQuickAddBar";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/tasks/components/forms/TaskAddSheetForm", () => ({
  TaskAddSheetForm: ({
    todayIso,
    onAdded,
    onCancel,
  }: {
    todayIso: string;
    onAdded: (title: string) => void;
    onCancel: () => void;
  }) => (
    <div data-testid="task-add-sheet-form" data-today-iso={todayIso}>
      <button type="button" onClick={() => onAdded("Fix gate")}>
        mock add
      </button>
      <button type="button" onClick={onCancel}>
        mock cancel
      </button>
    </div>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

const TRIGGER_NAME = "tasks.quickAdd.button";

function getBars() {
  return screen.getAllByRole("button", { name: TRIGGER_NAME });
}

function renderBar() {
  return render(
    <TaskQuickAddBar todayIso="2026-10-29">
      {(headerTrigger) => (
        <>
          <header data-testid="page-header">{headerTrigger}</header>
          <ul data-testid="task-list" />
        </>
      )}
    </TaskQuickAddBar>,
  );
}

async function openSheet(
  user: ReturnType<typeof userEvent.setup>,
  bar: HTMLElement,
) {
  await user.click(bar);

  return screen.findByRole("dialog", { name: "tasks.quickAdd.sheetTitle" });
}

describe("TaskQuickAddBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, string>) =>
        values?.title
          ? `${prefix}${key}: ${values.title}`
          : `${prefix}${key}`) as ReturnType<typeof useTranslations>;
    });

    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("renders New task buttons and a closed sheet", () => {
    renderBar();

    for (const bar of getBars()) {
      expect(bar).toHaveAttribute("type", "button");
      expect(bar).toHaveTextContent(/^tasks\.quickAdd\.button$/);
    }
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("task-add-sheet-form")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it("hands one trigger to the page header and puts a pinned one after the list so focus order follows each layout", () => {
    renderBar();

    const bars = getBars();
    const list = screen.getByTestId("task-list");

    expect(bars).toHaveLength(2);
    expect(screen.getByTestId("page-header")).toContainElement(bars[0]);
    expect(
      bars[0].compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      bars[1].compareDocumentPosition(list) & Node.DOCUMENT_POSITION_PRECEDING,
    ).toBeTruthy();
    expect(screen.getAllByRole("status")).toHaveLength(1);
  });

  it("opens the sheet with the form, passing today's server date", async () => {
    const user = userEvent.setup();

    renderBar();

    const dialog = await openSheet(user, getBars()[0]);
    const form = await within(dialog).findByTestId("task-add-sheet-form");

    expect(form).toHaveAttribute("data-today-iso", "2026-10-29");
    expect(
      within(dialog).getByRole("button", { name: "tasks.quickAdd.close" }),
    ).toBeInTheDocument();
  });

  it.each([
    ["header", 0],
    ["pinned", 1],
  ])("closes the sheet, returns focus to the %s bar and announces the added task", async (_placement, barIndex) => {
    const user = userEvent.setup();

    renderBar();

    const bar = getBars()[barIndex];
    const dialog = await openSheet(user, bar);

    expect(screen.getAllByRole("dialog")).toHaveLength(1);

    await user.click(
      await within(dialog).findByRole("button", { name: "mock add" }),
    );

    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "tasks.quickAdd.sheetTitle" }),
      ).not.toBeInTheDocument();
    });
    expect(bar).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "tasks.quickAdd.added: Fix gate",
    );
    expect(dialog).not.toContainElement(screen.getByRole("status"));
  });

  it("replaces the live-region child when the same task title is added twice", async () => {
    const user = userEvent.setup();

    renderBar();

    const bar = getBars()[1];
    const firstDialog = await openSheet(user, bar);

    await user.click(
      await within(firstDialog).findByRole("button", { name: "mock add" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    const status = screen.getByRole("status");
    const firstAnnouncement = within(status).getByText(
      "tasks.quickAdd.added: Fix gate",
    );
    const secondDialog = await openSheet(user, bar);

    await user.click(
      await within(secondDialog).findByRole("button", { name: "mock add" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    expect(screen.getByRole("status")).toBe(status);
    expect(status).toHaveTextContent("tasks.quickAdd.added: Fix gate");
    expect(
      within(status).getByText("tasks.quickAdd.added: Fix gate"),
    ).not.toBe(firstAnnouncement);
    expect(firstAnnouncement).not.toBeInTheDocument();
  });

  it("closes the sheet with the close button and returns focus to the pinned trigger without announcing", async () => {
    const user = userEvent.setup();

    renderBar();

    const bar = getBars()[1];
    const dialog = await openSheet(user, bar);

    await user.click(
      within(dialog).getByRole("button", { name: "tasks.quickAdd.close" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(bar).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("");
  });

  it.each([
    ["header", 0],
    ["pinned", 1],
  ])("closes the sheet on Cancel and returns focus to the %s trigger without announcing", async (_placement, barIndex) => {
    const user = userEvent.setup();

    renderBar();

    const bar = getBars()[barIndex];
    const dialog = await openSheet(user, bar);

    await user.click(
      await within(dialog).findByRole("button", { name: "mock cancel" }),
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(bar).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent("");
  });
});

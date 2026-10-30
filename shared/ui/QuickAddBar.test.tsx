import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { QuickAddBar } from "./QuickAddBar";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);

const LABELS = { button: "Add item", sheetTitle: "New item", close: "Close" };

function createBar(showControls?: boolean) {
  return (
    <QuickAddBar
      showControls={showControls}
      labels={LABELS}
      titleId="test-quick-add-title"
      getAddedMessage={(title) => `Added ${title}`}
      renderForm={() => <input aria-label="Item title" />}
    >
      {(headerTrigger) => (
        <header>
          <h2>Items</h2>
          {headerTrigger}
        </header>
      )}
    </QuickAddBar>
  );
}

function renderBar(showControls?: boolean) {
  return render(createBar(showControls));
}

describe("QuickAddBar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };

    mockUseTranslations.mockImplementation(
      (namespace?: string) =>
        ((key: string) => `${namespace}.${key}`) as ReturnType<
          typeof useTranslations
        >,
    );
  });

  it("places an add button in the page header and another in the mobile bar", () => {
    renderBar();

    expect(screen.getByRole("heading", { name: "Items" })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Add item" })).toHaveLength(2);
  });

  it("still renders the page but no add buttons when the controls are hidden", () => {
    renderBar(false);

    expect(screen.getByRole("heading", { name: "Items" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Add item" })).not.toBeInTheDocument();
  });

  it("does not reopen a sheet that was open when the controls were hidden", async () => {
    const user = userEvent.setup();
    const { rerender } = renderBar();

    await user.click(screen.getAllByRole("button", { name: "Add item" })[0]);
    expect(screen.getByRole("textbox", { name: "Item title" })).toBeInTheDocument();

    rerender(createBar(false));
    rerender(createBar(true));

    expect(screen.queryByRole("textbox", { name: "Item title" })).not.toBeInTheDocument();
  });
});

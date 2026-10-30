import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { AddItemFormPanel } from "./AddItemFormPanel";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);

function renderPanel(open: boolean) {
  return render(
    <AddItemFormPanel
      open={open}
      onClose={vi.fn()}
      title="New item"
      titleId="test-add-item-title"
      closeLabel="Close"
    >
      <input aria-label="Item title" />
    </AddItemFormPanel>,
  );
}

describe("AddItemFormPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation(
      (namespace?: string) =>
        ((key: string) => `${namespace}.${key}`) as ReturnType<
          typeof useTranslations
        >,
    );

    HTMLDialogElement.prototype.showModal = function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function (this: HTMLDialogElement) {
      this.removeAttribute("open");
      this.dispatchEvent(new Event("close"));
    };
  });

  it("does not mount the form while closed", () => {
    renderPanel(false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Item title")).not.toBeInTheDocument();
  });

  it("mounts the form inside the titled dialog while open", () => {
    renderPanel(true);

    const dialog = screen.getByRole("dialog", { name: "New item" });

    expect(dialog).toContainElement(screen.getByLabelText("Item title"));
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("shows the shared reload message when the form chunk fails to load", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    function BrokenChunk(): never {
      throw new Error("ChunkLoadError: Loading chunk 42 failed");
    }

    render(
      <AddItemFormPanel
        open
        onClose={vi.fn()}
        title="New item"
        titleId="test-add-item-title"
        closeLabel="Close"
      >
        <BrokenChunk />
      </AddItemFormPanel>,
    );

    expect(screen.getByText("common.formLoadError")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "common.reloadPage" }),
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });
});

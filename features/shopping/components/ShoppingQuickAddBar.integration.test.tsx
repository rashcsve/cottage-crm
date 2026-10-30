import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { addShoppingItemAction } from "@/features/shopping/server/actions";
import { ShoppingQuickAddBar } from "./ShoppingQuickAddBar";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  addShoppingItemAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockAddShoppingItemAction = vi.mocked(addShoppingItemAction);

const TRIGGER_NAME = "shopping.quickAdd.button";

describe("ShoppingQuickAddBar with the real quick-add form", () => {
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

  it("adds an item from the sheet, closes it, returns focus and announces the item once", async () => {
    const user = userEvent.setup();
    const consoleError = vi.spyOn(console, "error");

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: undefined,
    });

    render(<ShoppingQuickAddBar />);

    const trigger = screen.getByRole("button", { name: TRIGGER_NAME });

    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: "shopping.quickAdd.sheetTitle",
    });
    const input = await within(dialog).findByLabelText(
      "shopping.quickAdd.label",
      { exact: false }
    );

    await user.click(input);
    await user.keyboard("Milk{Enter}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(mockAddShoppingItemAction).toHaveBeenCalledWith({ title: "Milk" });
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "shopping.quickAdd.added: Milk"
    );
    expect(consoleError).not.toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it("keeps the sheet open with the text and the error when the add fails", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.form.error.custom",
    });

    render(<ShoppingQuickAddBar />);

    await user.click(screen.getByRole("button", { name: TRIGGER_NAME }));

    const dialog = await screen.findByRole("dialog", {
      name: "shopping.quickAdd.sheetTitle",
    });
    const input = await within(dialog).findByLabelText(
      "shopping.quickAdd.label",
      { exact: false }
    );

    await user.click(input);
    await user.keyboard("Milk{Enter}");

    expect(
      await within(dialog).findByText("shopping.form.error.custom")
    ).toBeInTheDocument();
    expect(screen.getByRole("dialog")).toBe(dialog);
    expect(input).toHaveValue("Milk");
  });
});

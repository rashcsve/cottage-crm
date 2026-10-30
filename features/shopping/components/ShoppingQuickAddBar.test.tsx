import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { ShoppingQuickAddBar } from "./ShoppingQuickAddBar";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/shopping/components/forms/ShoppingQuickAdd", () => ({
  ShoppingQuickAdd: ({
    variant,
    onAdded,
  }: {
    variant?: string;
    onAdded?: (title: string) => void;
  }) => (
    <div data-testid="shopping-quick-add" data-variant={variant}>
      <button type="button" onClick={() => onAdded?.("Milk")}>
        mock add
      </button>
    </div>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

const TRIGGER_NAME = "shopping.quickAdd.button";

async function openSheet(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: TRIGGER_NAME }));

  return screen.findByRole("dialog", { name: "shopping.quickAdd.sheetTitle" });
}

describe("ShoppingQuickAddBar", () => {
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

  it("renders one Add item button and a closed sheet without loading the form", () => {
    render(<ShoppingQuickAddBar />);

    const trigger = screen.getByRole("button", { name: TRIGGER_NAME });

    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveTextContent(/^shopping\.quickAdd\.button$/);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByTestId("shopping-quick-add")).not.toBeInTheDocument();
  });

  it("opens the sheet with the quick-add form in its sheet layout", async () => {
    const user = userEvent.setup();

    render(<ShoppingQuickAddBar />);

    const dialog = await openSheet(user);

    expect(
      await within(dialog).findByTestId("shopping-quick-add")
    ).toHaveAttribute("data-variant", "sheet");
    expect(
      within(dialog).getByRole("button", { name: "shopping.quickAdd.close" })
    ).toBeInTheDocument();
  });

  it("closes the sheet after an item is added, returns focus to the trigger and announces it", async () => {
    const user = userEvent.setup();

    render(<ShoppingQuickAddBar />);

    const trigger = screen.getByRole("button", { name: TRIGGER_NAME });
    const dialog = await openSheet(user);

    await user.click(
      await within(dialog).findByRole("button", { name: "mock add" })
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
    expect(screen.getByRole("status")).toHaveTextContent(
      "shopping.quickAdd.added: Milk"
    );
    expect(dialog).not.toContainElement(screen.getByRole("status"));
  });

  it("closes the sheet with the close button and returns focus to the trigger", async () => {
    const user = userEvent.setup();

    render(<ShoppingQuickAddBar />);

    const trigger = screen.getByRole("button", { name: TRIGGER_NAME });
    const dialog = await openSheet(user);

    await user.click(
      within(dialog).getByRole("button", { name: "shopping.quickAdd.close" })
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
    expect(trigger).toHaveFocus();
  });
});

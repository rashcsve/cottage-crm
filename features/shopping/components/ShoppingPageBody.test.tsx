import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { ShoppingPageBody } from "./ShoppingPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/shopping/components/forms/NewShoppingItemForm", () => ({
  NewShoppingItemForm: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="new-shopping-item-form">
      <button type="button" onClick={onClose}>
        Close form
      </button>
    </div>
  ),
}));

vi.mock("@/features/shopping/components/ShoppingGroup", () => ({
  ShoppingGroup: ({ label, ...props }: { label: string }) => (
    <section
      data-testid="shopping-group"
      data-has-tone={String("tone" in props)}
    >
      {label}
    </section>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

describe("ShoppingPageBody", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("opens and closes the composer from the overview toolbar", async () => {
    const user = userEvent.setup();

    render(
      <ShoppingPageBody
        activeFilter="pending"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: true,
        }}
      />
    );

    expect(
      screen.getByRole("button", { name: "shopping.form.openComposer" })
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "shopping.form.openComposer" })
    );

    expect(screen.getByTestId("new-shopping-item-form")).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "shopping.form.openComposer" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close form" }));

    expect(
      screen.queryByTestId("new-shopping-item-form")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "shopping.form.openComposer" })
    ).toBeInTheDocument();
  });

  it("does not render the primary add action when the user cannot manage items", () => {
    render(
      <ShoppingPageBody
        activeFilter="purchased"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: false,
        }}
      />
    );

    expect(
      screen.queryByRole("button", { name: "shopping.form.openComposer" })
    ).not.toBeInTheDocument();
    expect(screen.getAllByTestId("shopping-group")).toHaveLength(1);
  });

  it("titles the toolbar after the active section and drops the eyebrow", () => {
    const { rerender } = render(
      <ShoppingPageBody
        activeFilter="pending"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: true,
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "shopping.sections.pending.title" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("shopping.summary.eyebrow")
    ).not.toBeInTheDocument();

    rerender(
      <ShoppingPageBody
        activeFilter="purchased"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: true,
        }}
      />
    );

    expect(
      screen.getByRole("heading", { name: "shopping.sections.purchased.title" })
    ).toBeInTheDocument();
  });

  it("shows only the selected filter section", () => {
    render(
      <ShoppingPageBody
        activeFilter="purchased"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: true,
        }}
      />
    );

    expect(screen.getByTestId("shopping-group")).toHaveTextContent(
      "shopping.sections.purchased.title"
    );
  });

  it("does not colour the bought group as a status", () => {
    render(
      <ShoppingPageBody
        activeFilter="purchased"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: true,
        }}
      />
    );

    expect(screen.getByTestId("shopping-group")).toHaveAttribute(
      "data-has-tone",
      "false"
    );
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { ShoppingPageBody } from "./ShoppingPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/shopping/components/forms/ShoppingQuickAdd", () => ({
  ShoppingQuickAdd: () => <div data-testid="shopping-quick-add" />,
}));

vi.mock("@/features/shopping/components/ShoppingGroup", () => ({
  ShoppingGroup: ({
    label,
    leadingRow,
    ...props
  }: {
    label: string;
    leadingRow?: React.ReactNode;
  }) => (
    <section
      data-testid="shopping-group"
      data-has-tone={String("tone" in props)}
    >
      {label}
      {leadingRow}
    </section>
  ),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  deleteShoppingItemAction: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
  Link: ({
    href: _href,
    children,
    ...props
  }: {
    href: unknown;
    children: React.ReactNode;
  }) => (
    <a href="#" {...props}>
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

  it("shows the quick-add row inside the pending list for admins instead of an Add button", async () => {
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
      within(screen.getByTestId("shopping-group")).getByTestId(
        "shopping-quick-add-placeholder"
      )
    ).toBeInTheDocument();
    expect(
      await within(screen.getByTestId("shopping-group")).findByTestId(
        "shopping-quick-add"
      )
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("shopping-quick-add-placeholder")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button")
    ).not.toBeInTheDocument();
  });

  it("does not show the quick-add row on the purchased filter", () => {
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

    expect(screen.queryByTestId("shopping-quick-add")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("shopping-quick-add-placeholder")
    ).not.toBeInTheDocument();
  });

  it("does not render the quick-add row or an add action when the user cannot manage items", () => {
    render(
      <ShoppingPageBody
        activeFilter="pending"
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

    expect(screen.queryByTestId("shopping-quick-add")).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("shopping-quick-add-placeholder")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button")
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

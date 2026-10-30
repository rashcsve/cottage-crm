import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { ShoppingPageBody } from "./ShoppingPageBody";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/features/shopping/components/forms/ShoppingQuickAdd", () => ({
  ShoppingQuickAdd: ({ variant }: { variant?: string }) => (
    <div data-testid="shopping-quick-add" data-variant={variant} />
  ),
}));

vi.mock("@/features/shopping/components/ShoppingQuickAddBar", () => ({
  ShoppingQuickAddBar: () => <div data-testid="shopping-quick-add-bar" />,
}));

vi.mock("@/features/shopping/components/ShoppingGroup", () => ({
  ShoppingGroup: ({
    headingId,
    leadingRow,
    ...props
  }: {
    headingId: string;
    leadingRow?: React.ReactNode;
  }) => (
    <section
      data-testid="shopping-group"
      aria-labelledby={headingId}
      data-has-tone={String("tone" in props)}
    >
      {leadingRow}
    </section>
  ),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  deleteShoppingItemAction: vi.fn(),
}));

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push }),
  Link: ({
    href: _href,
    children,
    scroll: _scroll,
    onNavigate,
    ...props
  }: {
    href: unknown;
    children: React.ReactNode;
    scroll?: boolean;
    onNavigate?: (event: { preventDefault: () => void }) => void;
  }) => (
    <a
      href="#"
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.({ preventDefault: () => {} });
      }}
      {...props}
    >
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
          todayIso: "2026-10-29",
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

  it("pins the add-item bar for mobile and keeps the quick-add card row for desktop", async () => {
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(screen.getAllByTestId("shopping-quick-add-bar")).toHaveLength(1);
    expect(
      within(screen.getByTestId("shopping-group")).queryByTestId(
        "shopping-quick-add-bar"
      )
    ).not.toBeInTheDocument();
    expect(
      await within(screen.getByTestId("shopping-group")).findByTestId(
        "shopping-quick-add"
      )
    ).toHaveAttribute("data-variant", "row");
  });

  it("does not show the add-item bar on the purchased filter or for viewers", () => {
    const { rerender } = render(
      <ShoppingPageBody
        activeFilter="purchased"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: true,
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(screen.queryByTestId("shopping-quick-add-bar")).not.toBeInTheDocument();

    rerender(
      <ShoppingPageBody
        activeFilter="pending"
        data={{
          pendingItems: [],
          purchasedItems: [],
          pendingCount: 0,
          purchasedCount: 0,
          totalCount: 0,
          canManage: false,
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(screen.queryByTestId("shopping-quick-add-bar")).not.toBeInTheDocument();
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
          todayIso: "2026-10-29",
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
          todayIso: "2026-10-29",
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

  it("shows a summary line and the status switch instead of the toolbar", () => {
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(screen.getByText("shopping.summary.nothingToBuy")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "shopping.switch.ariaLabel" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "shopping.switch.pending 0 shopping.switch.countUnit" })
    ).toHaveAttribute("aria-current", "page");
    expect(screen.queryByTestId("collection-toolbar-total")).not.toBeInTheDocument();
    expect(screen.queryByText(/shopping\.toolbar\./)).not.toBeInTheDocument();
  });

  it("shows viewers the same summary line and status switch", () => {
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(screen.getByText("shopping.summary.nothingToBuy")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "shopping.switch.purchased 0 shopping.switch.countUnit" })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: "shopping.switch.pending 0 shopping.switch.countUnit" })
    ).not.toHaveAttribute("aria-current");
  });

  it("names the active section with a level-2 heading and drops the eyebrow", () => {
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "shopping.sections.pending.title" })
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "shopping.sections.purchased.title" })
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(
      screen.getByRole("region", { name: "shopping.sections.purchased.title" })
    ).toBe(screen.getByTestId("shopping-group"));
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
          todayIso: "2026-10-29",
        }}
      />
    );

    expect(screen.getByTestId("shopping-group")).toHaveAttribute(
      "data-has-tone",
      "false"
    );
  });

  it("navigates to the bought view without scrolling to the top", async () => {
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
          canManage: false,
          todayIso: "2026-10-29",
        }}
      />
    );

    await user.click(screen.getByRole("link", { name: /^shopping\.switch\.purchased/ }));

    expect(push).toHaveBeenCalledWith(
      { pathname: "/shopping", query: { filter: "purchased" } },
      { scroll: false },
    );
  });
});

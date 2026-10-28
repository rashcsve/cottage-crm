import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addShoppingItemAction } from "@/features/shopping/server/actions";
import { ShoppingQuickAdd } from "./ShoppingQuickAdd";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/features/shopping/server/actions", () => ({
  addShoppingItemAction: vi.fn(),
}));

const mockUseTranslations = vi.mocked(useTranslations);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);
const mockAddShoppingItemAction = vi.mocked(addShoppingItemAction);

type MockRouter = {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

type MockToastApi = {
  success: ReturnType<typeof vi.fn>;
  error: ReturnType<typeof vi.fn>;
};

function setupTranslations() {
  mockUseTranslations.mockImplementation((namespace?: string) => {
    const prefix = namespace ? `${namespace}.` : "";

    return ((key: string, values?: Record<string, string>) =>
      values?.title
        ? `${prefix}${key}: ${values.title}`
        : `${prefix}${key}`) as ReturnType<typeof useTranslations>;
  });
}

function getTitleInput() {
  return screen.getByLabelText("shopping.quickAdd.label", { exact: false });
}

function getLiveRegion() {
  return screen.getByRole("status");
}

describe("ShoppingQuickAdd", () => {
  let mockRouter: MockRouter;
  let mockToastApi: MockToastApi;

  beforeEach(() => {
    vi.clearAllMocks();

    setupTranslations();

    mockRouter = {
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    };

    mockUseRouter.mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>
    );

    mockToastApi = {
      success: vi.fn(),
      error: vi.fn(),
    };

    mockUseToast.mockReturnValue(
      mockToastApi as unknown as ReturnType<typeof useToast>
    );
  });

  it("renders a labelled field with an Enter key hint and a visible submit button", () => {
    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    expect(input).toHaveAttribute("enterkeyhint", "enter");
    expect(input).toHaveAttribute("placeholder", "shopping.quickAdd.placeholder");
    expect(input).not.toHaveFocus();
    expect(
      screen.getByRole("button", { name: "shopping.quickAdd.submit" })
    ).toBeInTheDocument();
  });

  it("renders an empty polite live region from the first render", () => {
    render(<ShoppingQuickAdd />);

    const liveRegion = getLiveRegion();

    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion).toHaveTextContent("");
  });

  it("adds an item with Enter, clears the field, keeps focus and announces it without a toast or refresh", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "shopping.form.success.custom",
    });

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Milk{Enter}");

    await waitFor(() => {
      expect(mockAddShoppingItemAction).toHaveBeenCalledWith({ title: "Milk" });
    });
    await waitFor(() => {
      expect(input).toHaveValue("");
    });

    expect(input).toHaveFocus();
    expect(getLiveRegion()).toHaveTextContent("shopping.quickAdd.added: Milk");
    expect(mockToastApi.success).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("returns focus to the field after adding with the submit button", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: undefined,
    });

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.type(input, "Milk");
    await user.click(
      screen.getByRole("button", { name: "shopping.quickAdd.submit" })
    );

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("announces again when the same title is added twice", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValue({
      ok: true,
      data: { id: 2 },
      message: undefined,
    });

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Coffee{Enter}");

    await waitFor(() => {
      expect(getLiveRegion()).toHaveTextContent("shopping.quickAdd.added: Coffee");
    });
    const firstAnnouncement = getLiveRegion().firstElementChild;

    await user.keyboard("Coffee{Enter}");

    await waitFor(() => {
      expect(mockAddShoppingItemAction).toHaveBeenCalledTimes(2);
    });
    await waitFor(() => {
      expect(getLiveRegion().firstElementChild).not.toBe(firstAnnouncement);
    });
    expect(getLiveRegion()).toHaveTextContent("shopping.quickAdd.added: Coffee");
    expect(firstAnnouncement).not.toBeInTheDocument();
    expect(mockToastApi.success).not.toHaveBeenCalled();
  });

  it("adds three items in a row using only the keyboard", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValue({
      ok: true,
      data: { id: 1 },
      message: undefined,
    });

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.tab();
    expect(input).toHaveFocus();

    for (const title of ["Milk", "Bread", "Eggs"]) {
      await user.keyboard(`${title}{Enter}`);
      await waitFor(() => {
        expect(input).toHaveValue("");
      });
      expect(input).toHaveFocus();
    }

    expect(mockAddShoppingItemAction.mock.calls).toEqual([
      [{ title: "Milk" }],
      [{ title: "Bread" }],
      [{ title: "Eggs" }],
    ]);
  });

  it("keeps the text and focus and shows the server field error under the field", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.form.error",
      fieldErrors: {
        title: "shopping.form.titleRequired",
      },
    });

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Milk{Enter}");

    const fieldError = await screen.findByText("shopping.form.titleRequired");

    expect(screen.queryByText("shopping.form.error")).not.toBeInTheDocument();
    expect(input).toHaveValue("Milk");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.getAttribute("aria-describedby")).toContain(fieldError.id);
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(getLiveRegion()).toHaveTextContent("");
    expect(mockToastApi.success).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("shows a form-level server error without field errors and returns focus to the field", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.form.error.custom",
    });

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.type(input, "Milk");
    await user.click(
      screen.getByRole("button", { name: "shopping.quickAdd.submit" })
    );

    expect(
      await screen.findByText("shopping.form.error.custom")
    ).toBeInTheDocument();
    expect(input).toHaveValue("Milk");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("keeps the text, shows the generic error for a caught exception and returns focus to the field", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockRejectedValueOnce(new Error("Request failed"));

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.type(input, "Olive oil");
    await user.click(
      screen.getByRole("button", { name: "shopping.quickAdd.submit" })
    );

    expect(await screen.findByText("shopping.form.error")).toBeInTheDocument();
    expect(screen.queryByText("Request failed")).not.toBeInTheDocument();
    expect(input).toHaveValue("Olive oil");
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
    expect(mockToastApi.error).not.toHaveBeenCalled();
  });

  it("does not submit whitespace and shows the required error without nagging on blur", async () => {
    const user = userEvent.setup();

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("   ");
    await user.tab();

    expect(
      screen.queryByText("shopping.form.errors.titleRequired")
    ).not.toBeInTheDocument();

    await user.click(input);
    await user.keyboard("{Enter}");

    expect(
      await screen.findByText("shopping.form.errors.titleRequired")
    ).toBeInTheDocument();
    expect(mockAddShoppingItemAction).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(input).toHaveFocus();
    });
  });

  it("blocks a second submit while the first is pending and keeps focus in the field", async () => {
    const user = userEvent.setup();
    let resolveAction: (value: Awaited<ReturnType<typeof addShoppingItemAction>>) => void = () => {};

    mockAddShoppingItemAction.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveAction = resolve;
        })
    );

    render(<ShoppingQuickAdd />);

    const input = getTitleInput();

    await user.click(input);
    await user.keyboard("Milk{Enter}");

    const pendingButton = await screen.findByRole("button", {
      name: "shopping.form.submitting",
    });

    expect(pendingButton).toBeDisabled();
    expect(input).toHaveFocus();

    await user.keyboard("{Enter}");

    expect(mockAddShoppingItemAction).toHaveBeenCalledTimes(1);

    resolveAction({ ok: true, data: { id: 1 }, message: undefined });

    await waitFor(() => {
      expect(input).toHaveValue("");
    });
    expect(input).toHaveFocus();
    expect(mockAddShoppingItemAction).toHaveBeenCalledTimes(1);
  });
});

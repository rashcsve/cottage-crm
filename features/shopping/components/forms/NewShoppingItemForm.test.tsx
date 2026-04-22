import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { addShoppingItemAction } from "@/features/shopping/server/actions";
import { NewShoppingItemForm } from "./NewShoppingItemForm";

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

    return ((key: string) => `${prefix}${key}`) as ReturnType<
      typeof useTranslations
    >;
  });
}

describe("NewShoppingItemForm", () => {
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

  it("submits valid form data, refreshes the route, anchors to the new item, and closes the composer", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "shopping.form.success.custom",
    });

    render(<NewShoppingItemForm onClose={onClose} />);

    const titleInput = screen.getByLabelText("shopping.form.fields.title");
    const submitButton = screen.getByRole("button", {
      name: "shopping.form.submit",
    });

    await user.type(titleInput, "Milk");
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockAddShoppingItemAction).toHaveBeenCalledWith({
        title: "Milk",
      });
    });

    expect(mockToastApi.success).toHaveBeenCalledWith(
      "shopping.form.success.custom"
    );
    expect(mockRouter.refresh).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith(
      "/shopping?filter=pending#shopping-item-1"
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });

  it("falls back to the default success message when the action does not return one", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 5 },
      message: undefined,
    });

    render(<NewShoppingItemForm onClose={onClose} />);

    await user.type(
      screen.getByLabelText("shopping.form.fields.title"),
      "Coffee beans"
    );
    await user.click(
      screen.getByRole("button", { name: "shopping.form.submit" })
    );

    await waitFor(() => {
      expect(mockToastApi.success).toHaveBeenCalledWith("shopping.form.success");
    });
  });

  it("maps server field errors and shows an error toast", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.form.error",
      fieldErrors: {
        title: "shopping.form.titleRequired",
      },
    });

    render(<NewShoppingItemForm onClose={onClose} />);

    const titleInput = screen.getByLabelText("shopping.form.fields.title");
    const submitButton = screen.getByRole("button", {
      name: "shopping.form.submit",
    });

    await user.type(titleInput, "Milk");
    await user.click(submitButton);

    expect(await screen.findByText("shopping.form.error")).toBeInTheDocument();
    expect(screen.getByText("shopping.form.titleRequired")).toBeInTheDocument();
    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith("shopping.form.error");
    expect(onClose).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("shows a caught exception as a root error and toast", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    mockAddShoppingItemAction.mockRejectedValueOnce(new Error("Request failed"));

    render(<NewShoppingItemForm onClose={onClose} />);

    await user.type(
      screen.getByLabelText("shopping.form.fields.title"),
      "Olive oil"
    );
    await user.click(
      screen.getByRole("button", { name: "shopping.form.submit" })
    );

    expect(await screen.findByText("Request failed")).toBeInTheDocument();
    expect(mockToastApi.error).toHaveBeenCalledWith("Request failed");
    expect(onClose).not.toHaveBeenCalled();
  });

  it("does not submit invalid client-side data", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<NewShoppingItemForm onClose={onClose} />);

    await user.type(
      screen.getByLabelText("shopping.form.fields.title"),
      "   "
    );
    await user.click(
      screen.getByRole("button", { name: "shopping.form.submit" })
    );

    expect(mockAddShoppingItemAction).not.toHaveBeenCalled();
    expect(
      await screen.findByText("shopping.form.errors.titleRequired")
    ).toBeInTheDocument();
  });

  it("resets the form and closes the composer from the close action", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<NewShoppingItemForm onClose={onClose} />);

    const titleInput = screen.getByLabelText("shopping.form.fields.title");

    await user.type(titleInput, "Laundry detergent");
    await user.click(
      screen.getByRole("button", { name: "shopping.form.closeComposer" })
    );

    expect(titleInput).toHaveValue("");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

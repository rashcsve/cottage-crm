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

  it("submits valid form data, refreshes the route, and resets the form", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: true,
      data: { id: 1 },
      message: "shopping.form.success.custom",
    });

    render(<NewShoppingItemForm />);

    const titleInput = screen.getByLabelText("shopping.form.title");
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

    await waitFor(() => {
      expect(titleInput).toHaveValue("");
    });
  });

  it("maps server field errors and shows an error toast", async () => {
    const user = userEvent.setup();

    mockAddShoppingItemAction.mockResolvedValueOnce({
      ok: false,
      error: "shopping.form.error",
      fieldErrors: {
        title: "shopping.form.titleRequired",
      },
    });

    render(<NewShoppingItemForm />);

    const titleInput = screen.getByLabelText("shopping.form.title");
    const submitButton = screen.getByRole("button", {
      name: "shopping.form.submit",
    });

    await user.type(titleInput, "Milk");
    await user.click(submitButton);

    expect(await screen.findByText("shopping.form.error")).toBeInTheDocument();
    expect(screen.getByText("shopping.form.titleRequired")).toBeInTheDocument();
    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(mockToastApi.error).toHaveBeenCalledWith("shopping.form.error");
  });
});

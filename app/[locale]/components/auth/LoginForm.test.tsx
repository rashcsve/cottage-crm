import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@/i18n/navigation";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { LoginForm } from "./LoginForm";

vi.mock("@/lib/supabase/client", () => ({
  getBrowserSupabaseClient: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockGetBrowserSupabaseClient = vi.mocked(getBrowserSupabaseClient);

type MockRouter = {
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  refresh: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

describe("LoginForm", () => {
  let mockRouter: MockRouter;
  let mockSignInWithPassword: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

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

    mockSignInWithPassword = vi.fn();

    mockGetBrowserSupabaseClient.mockReturnValue({
      auth: {
        signInWithPassword: mockSignInWithPassword,
      },
    } as unknown as ReturnType<typeof getBrowserSupabaseClient>);
  });

  it("uses explicit label associations and the correct password autocomplete", () => {
    render(<LoginForm />);

    const emailLabel = screen.getByText("fields.email");
    const passwordLabel = screen.getByText("fields.password");
    const emailInput = screen.getByLabelText("fields.email");
    const passwordInput = screen.getByLabelText("fields.password");

    expect(emailLabel).toHaveAttribute("for", "login-email");
    expect(emailInput).toHaveAttribute("id", "login-email");
    expect(passwordLabel).toHaveAttribute("for", "login-password");
    expect(passwordInput).toHaveAttribute("id", "login-password");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });

  it("submits valid credentials and navigates to the dashboard", async () => {
    const user = userEvent.setup();

    mockSignInWithPassword.mockResolvedValueOnce({ error: null });

    render(<LoginForm />);

    await user.type(
      screen.getByLabelText("fields.email"),
      "user@example.com"
    );
    await user.type(
      screen.getByLabelText("fields.password"),
      "secret123"
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith(DEFAULT_AUTHENTICATED_ROUTE);
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});

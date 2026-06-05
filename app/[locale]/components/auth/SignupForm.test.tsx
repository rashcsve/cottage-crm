import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@/i18n/navigation";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";
import { getBrowserSupabaseClient } from "@/lib/supabase/client";
import { SignupForm } from "./SignupForm";

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

describe("SignupForm", () => {
  let mockRouter: MockRouter;
  let mockSignUp: ReturnType<typeof vi.fn>;

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

    mockSignUp = vi.fn();

    mockGetBrowserSupabaseClient.mockReturnValue({
      auth: {
        signUp: mockSignUp,
      },
    } as unknown as ReturnType<typeof getBrowserSupabaseClient>);
  });

  it("uses explicit label associations for all signup fields", () => {
    render(<SignupForm />);

    const nameLabel = screen.getByText("fields.displayName");
    const emailLabel = screen.getByText("fields.email");
    const passwordLabel = screen.getByText("fields.password");

    expect(nameLabel).toHaveAttribute("for", "signup-display-name");
    expect(screen.getByLabelText("fields.displayName")).toHaveAttribute(
      "id",
      "signup-display-name"
    );
    expect(emailLabel).toHaveAttribute("for", "signup-email");
    expect(screen.getByLabelText("fields.email")).toHaveAttribute("id", "signup-email");
    expect(passwordLabel).toHaveAttribute("for", "signup-password");
    expect(screen.getByLabelText("fields.password")).toHaveAttribute(
      "id",
      "signup-password"
    );
  });

  it("submits signup data and navigates directly to the dashboard when a session is returned", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValueOnce({
      error: null,
      data: {
        session: { access_token: "token" },
      },
    });

    render(<SignupForm />);

    await user.type(
      screen.getByLabelText("fields.displayName"),
      "Svetlana"
    );
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
      expect(mockSignUp).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
        options: {
          data: {
            display_name: "Svetlana",
          },
        },
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith(DEFAULT_AUTHENTICATED_ROUTE);
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("shows a confirmation message instead of redirecting when email confirmation is required", async () => {
    const user = userEvent.setup();

    mockSignUp.mockResolvedValueOnce({
      error: null,
      data: {
        session: null,
      },
    });

    render(<SignupForm />);

    await user.type(
      screen.getByLabelText("fields.displayName"),
      "Svetlana"
    );
    await user.type(
      screen.getByLabelText("fields.email"),
      "user@example.com"
    );
    await user.type(
      screen.getByLabelText("fields.password"),
      "secret123"
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(
      await screen.findByText("successPendingConfirmation")
    ).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});

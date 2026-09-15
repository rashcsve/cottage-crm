import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@/i18n/navigation";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";
import { signupAction } from "./actions";
import { SignupForm } from "./SignupForm";

vi.mock("./actions", () => ({
  signupAction: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockSignupAction = vi.mocked(signupAction);

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
  });

  it("uses explicit label associations for all signup fields", () => {
    render(<SignupForm />);

    const nameLabel = screen.getByText("fields.displayName");
    const emailLabel = screen.getByText("fields.email");
    const passwordLabel = screen.getByText("fields.password");

    expect(nameLabel).toHaveAttribute("for", "signup-display-name");
    expect(
      screen.getByLabelText("fields.displayName", { exact: false })
    ).toHaveAttribute("id", "signup-display-name");
    expect(emailLabel).toHaveAttribute("for", "signup-email");
    expect(
      screen.getByLabelText("fields.email", { exact: false })
    ).toHaveAttribute("id", "signup-email");
    expect(passwordLabel).toHaveAttribute("for", "signup-password");
    expect(
      screen.getByLabelText("fields.password", { exact: false })
    ).toHaveAttribute("id", "signup-password");
  });

  it("submits signup data and navigates directly to the dashboard when a session is returned", async () => {
    const user = userEvent.setup();

    mockSignupAction.mockResolvedValueOnce({
      ok: true,
      requiresEmailConfirmation: false,
    });

    render(<SignupForm />);

    await user.type(
      screen.getByLabelText("fields.displayName", { exact: false }),
      "Svetlana"
    );
    await user.type(
      screen.getByLabelText("fields.email", { exact: false }),
      "user@example.com"
    );
    await user.type(
      screen.getByLabelText("fields.password", { exact: false }),
      "secret123"
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    await waitFor(() => {
      expect(mockSignupAction).toHaveBeenCalledWith({
        displayName: "Svetlana",
        email: "user@example.com",
        password: "secret123",
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith(DEFAULT_AUTHENTICATED_ROUTE);
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("shows a confirmation message instead of redirecting when email confirmation is required", async () => {
    const user = userEvent.setup();

    mockSignupAction.mockResolvedValueOnce({
      ok: true,
      requiresEmailConfirmation: true,
    });

    render(<SignupForm />);

    await user.type(
      screen.getByLabelText("fields.displayName", { exact: false }),
      "Svetlana"
    );
    await user.type(
      screen.getByLabelText("fields.email", { exact: false }),
      "user@example.com"
    );
    await user.type(
      screen.getByLabelText("fields.password", { exact: false }),
      "secret123"
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(
      await screen.findByText("successPendingConfirmation")
    ).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });

  it("shows the Supabase error message when sign-up fails", async () => {
    const user = userEvent.setup();

    mockSignupAction.mockResolvedValueOnce({
      ok: false,
      error: "Signups not allowed for this instance",
    });

    render(<SignupForm />);

    await user.type(
      screen.getByLabelText("fields.displayName", { exact: false }),
      "Svetlana"
    );
    await user.type(
      screen.getByLabelText("fields.email", { exact: false }),
      "user@example.com"
    );
    await user.type(
      screen.getByLabelText("fields.password", { exact: false }),
      "secret123"
    );
    await user.click(screen.getByRole("button", { name: "submit" }));

    expect(
      await screen.findByText("Signups not allowed for this instance")
    ).toBeInTheDocument();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});

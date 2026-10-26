import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRouter } from "@/i18n/navigation";
import { DEFAULT_AUTHENTICATED_ROUTE } from "@/lib/routes";
import { loginAction } from "./actions";
import { LoginForm } from "./LoginForm";

vi.mock("./actions", () => ({
  loginAction: vi.fn(),
  googleSignInAction: vi.fn(),
}));

const mockUseRouter = vi.mocked(useRouter);
const mockLoginAction = vi.mocked(loginAction);

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
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("shows the Google button and divider above the email form", () => {
    render(<LoginForm />);

    const googleButton = screen.getByRole("button", { name: "google" });
    const divider = screen.getByText("divider");
    const emailInput = screen.getByLabelText("fields.email", { exact: false });

    expect(
      googleButton.compareDocumentPosition(divider) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(
      divider.compareDocumentPosition(emailInput) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  });

  it("hides the Google button and divider in demo mode", () => {
    vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "1");

    render(<LoginForm />);

    expect(
      screen.queryByRole("button", { name: "google" })
    ).not.toBeInTheDocument();
    expect(screen.queryByText("divider")).not.toBeInTheDocument();
  });

  it("shows the initial error as a form-level message", () => {
    render(<LoginForm initialError="Google sign-in failed" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Google sign-in failed"
    );
  });

  it("replaces the initial error with the submit error when sign-in fails", async () => {
    const user = userEvent.setup();
    mockLoginAction.mockResolvedValueOnce({
      ok: false,
      error: "Invalid credentials",
    });

    render(<LoginForm initialError="Google sign-in failed" />);

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
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Invalid credentials"
      );
    });
    expect(screen.queryByText("Google sign-in failed")).not.toBeInTheDocument();
  });

  it("clears the initial error once sign-in succeeds", async () => {
    const user = userEvent.setup();
    mockLoginAction.mockResolvedValueOnce({ ok: true });

    render(<LoginForm initialError="Google sign-in failed" />);

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
      expect(mockRouter.push).toHaveBeenCalledWith(DEFAULT_AUTHENTICATED_ROUTE);
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("uses explicit label associations and the correct password autocomplete", () => {
    render(<LoginForm />);

    const emailLabel = screen.getByText("fields.email");
    const passwordLabel = screen.getByText("fields.password");
    const emailInput = screen.getByLabelText("fields.email", { exact: false });
    const passwordInput = screen.getByLabelText("fields.password", {
      exact: false,
    });

    expect(emailLabel).toHaveAttribute("for", "login-email");
    expect(emailInput).toHaveAttribute("id", "login-email");
    expect(passwordLabel).toHaveAttribute("for", "login-password");
    expect(passwordInput).toHaveAttribute("id", "login-password");
    expect(passwordInput).toHaveAttribute("autocomplete", "current-password");
  });

  it("links to signup from the switch prompt", () => {
    render(<LoginForm />);

    expect(screen.getByText("switchPrompt")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "switchAction" })).toHaveAttribute(
      "href",
      "/signup"
    );
  });

  it("submits valid credentials and navigates to the dashboard", async () => {
    const user = userEvent.setup();

    mockLoginAction.mockResolvedValueOnce({ ok: true });

    render(<LoginForm />);

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
      expect(mockLoginAction).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "secret123",
      });
    });

    expect(mockRouter.push).toHaveBeenCalledWith(DEFAULT_AUTHENTICATED_ROUTE);
    expect(mockRouter.refresh).not.toHaveBeenCalled();
  });
});

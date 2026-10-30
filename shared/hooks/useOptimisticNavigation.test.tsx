import { Suspense, use, useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useOptimisticNavigation } from "./useOptimisticNavigation";

const push = vi.fn();

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push }),
}));

function PendingPage({ page }: { page: Promise<void> }) {
  use(page);
  return null;
}

function createNavigationDelay() {
  let finish = () => {};
  const page = new Promise<void>((resolve) => {
    finish = resolve;
  });

  return { page, finish: () => act(() => finish()) };
}

function NavigationProbe({
  serverValue,
  page,
}: {
  serverValue: string;
  page: Promise<void>;
}) {
  const { value, navigate } = useOptimisticNavigation(serverValue);
  const [loadingPage, setLoadingPage] = useState<Promise<void> | null>(null);

  push.mockImplementation(() => setLoadingPage(page));

  return (
    <Suspense fallback={null}>
      <p>{`Showing ${value}`}</p>
      <button type="button" onClick={() => navigate("done", "/tasks?filter=done")}>
        Done
      </button>
      {loadingPage ? <PendingPage page={loadingPage} /> : null}
    </Suspense>
  );
}

describe("useOptimisticNavigation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows the server value before any navigation", () => {
    const { page } = createNavigationDelay();

    render(<NavigationProbe serverValue="open" page={page} />);

    expect(screen.getByText("Showing open")).toBeInTheDocument();
  });

  it("navigates to the href without scrolling to the top", async () => {
    const user = userEvent.setup();
    const { page } = createNavigationDelay();
    render(<NavigationProbe serverValue="open" page={page} />);

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(push).toHaveBeenCalledWith("/tasks?filter=done", { scroll: false });
  });

  it("shows the chosen value while the new page is still loading", async () => {
    const user = userEvent.setup();
    const { page } = createNavigationDelay();
    render(<NavigationProbe serverValue="open" page={page} />);

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(screen.getByText("Showing done")).toBeInTheDocument();
  });

  it("settles on the server value once the new page arrives", async () => {
    const user = userEvent.setup();
    const { page, finish } = createNavigationDelay();
    const { rerender } = render(<NavigationProbe serverValue="open" page={page} />);

    await user.click(screen.getByRole("button", { name: "Done" }));
    rerender(<NavigationProbe serverValue="done" page={page} />);
    await finish();

    expect(screen.getByText("Showing done")).toBeInTheDocument();
  });
});

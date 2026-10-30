import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NoteContentDisclosure } from "@/features/notes/components/NoteContentDisclosure";

const CONTENT = "Kotel znovu hlásí chybu E4, restart pomohl.";

let resizeCallbacks: ResizeObserverCallback[] = [];

function stubContentSize({
  scrollHeight,
  clientHeight,
}: {
  scrollHeight: number;
  clientHeight: number;
}) {
  vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(
    scrollHeight,
  );
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(
    clientHeight,
  );
}

function triggerResize() {
  act(() => {
    for (const callback of resizeCallbacks) {
      callback([], {} as ResizeObserver);
    }
  });
}

beforeEach(() => {
  resizeCallbacks = [];
  vi.stubGlobal(
    "ResizeObserver",
    class {
      constructor(callback: ResizeObserverCallback) {
        resizeCallbacks.push(callback);
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("NoteContentDisclosure", () => {
  it("shows the full text without a toggle when it fits in the clamp", () => {
    stubContentSize({ scrollHeight: 60, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);

    expect(screen.getByText(CONTENT)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("offers 'show more' controlling the text when it overflows", () => {
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);

    const toggle = screen.getByRole("button", { name: "showMore" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute(
      "aria-controls",
      screen.getByText(CONTENT).id,
    );
  });

  it("toggles between 'show more' and 'show less' and updates aria-expanded", async () => {
    const user = userEvent.setup();
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);

    await user.click(screen.getByRole("button", { name: "showMore" }));

    const showLess = screen.getByRole("button", { name: "showLess" });
    expect(showLess).toHaveAttribute("aria-expanded", "true");

    await user.click(showLess);

    expect(screen.getByRole("button", { name: "showMore" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("keeps 'show less' after expanding, even though the expanded text no longer overflows", async () => {
    const user = userEvent.setup();
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);
    await user.click(screen.getByRole("button", { name: "showMore" }));

    stubContentSize({ scrollHeight: 120, clientHeight: 120 });
    triggerResize();

    expect(screen.getByRole("button", { name: "showLess" })).toBeInTheDocument();
  });

  it("re-checks overflow when the text is resized", () => {
    stubContentSize({ scrollHeight: 60, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    stubContentSize({ scrollHeight: 120, clientHeight: 60 });
    triggerResize();

    expect(screen.getByRole("button", { name: "showMore" })).toBeInTheDocument();
  });

  it("collapses again when the content changes while expanded", async () => {
    const user = userEvent.setup();
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });

    const { rerender } = render(<NoteContentDisclosure content={CONTENT} />);
    await user.click(screen.getByRole("button", { name: "showMore" }));

    rerender(<NoteContentDisclosure content="Nový text poznámky." />);

    expect(screen.getByRole("button", { name: "showMore" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("renders without ResizeObserver support", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("ResizeObserver", undefined);
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);

    expect(screen.getByRole("button", { name: "showMore" })).toBeInTheDocument();
  });
});

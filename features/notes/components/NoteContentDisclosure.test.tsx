import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  onTestFinished,
  vi,
} from "vitest";
import { NoteContentDisclosure } from "@/features/notes/components/NoteContentDisclosure";

const CONTENT = "Kotel znovu hlásí chybu E4, restart pomohl.";

const resizeCallbacks: ResizeObserverCallback[] = [];
const observedElements = new Set<Element>();

class ResizeObserverStub {
  constructor(callback: ResizeObserverCallback) {
    resizeCallbacks.push(callback);
  }
  observe(element: Element) {
    observedElements.add(element);
  }
  unobserve(element: Element) {
    observedElements.delete(element);
  }
  disconnect() {}
}

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
    const entries = Array.from(
      observedElements,
      (target) => ({ target }) as ResizeObserverEntry,
    );
    for (const callback of resizeCallbacks) {
      callback(entries, {} as ResizeObserver);
    }
  });
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ResizeObserverStub);
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

  it("keeps focus on the toggle when collapsing with the keyboard", async () => {
    const user = userEvent.setup();
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);
    screen.getByRole("button", { name: "showMore" }).focus();
    await user.keyboard("{Enter}");

    stubContentSize({ scrollHeight: 120, clientHeight: 120 });
    triggerResize();
    stubContentSize({ scrollHeight: 120, clientHeight: 60 });
    await user.keyboard("{Enter}");

    expect(screen.getByRole("button", { name: "showMore" })).toHaveFocus();
  });

  it("re-checks overflow once web fonts have loaded", async () => {
    let resolveFonts: () => void = () => {};
    const ready = new Promise<void>((resolve) => {
      resolveFonts = resolve;
    });
    Object.defineProperty(document, "fonts", {
      configurable: true,
      value: { ready },
    });
    onTestFinished(() => {
      Reflect.deleteProperty(document, "fonts");
    });
    stubContentSize({ scrollHeight: 60, clientHeight: 60 });

    render(<NoteContentDisclosure content={CONTENT} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    stubContentSize({ scrollHeight: 80, clientHeight: 60 });
    await act(async () => {
      resolveFonts();
      await ready;
    });

    expect(screen.getByRole("button", { name: "showMore" })).toBeInTheDocument();
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

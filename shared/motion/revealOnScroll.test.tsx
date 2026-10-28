import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";

import { mockReducedMotion } from "@/tests/utils/mock-reduced-motion";
import { useRevealOnScroll } from "./revealOnScroll";

type ObserverRecord = {
  callback: IntersectionObserverCallback;
  options: IntersectionObserverInit | undefined;
  observed: Element[];
  disconnect: ReturnType<typeof vi.fn>;
};

let observers: ObserverRecord[] = [];
const ORIGINAL_INTERSECTION_OBSERVER = global.IntersectionObserver;

function intersect(record: ObserverRecord, isIntersecting: boolean) {
  const entries = record.observed.map(
    (target) => ({ target, isIntersecting }) as IntersectionObserverEntry,
  );
  act(() => {
    record.callback(entries, {} as IntersectionObserver);
  });
}

function Revealed({ margin }: { margin?: string }) {
  const ref = useRevealOnScroll<HTMLDivElement>(
    margin === undefined ? undefined : { margin },
  );
  return <div ref={ref}>content</div>;
}

beforeEach(() => {
  observers = [];
  mockReducedMotion(false);
  global.IntersectionObserver = vi.fn(function (
    this: unknown,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) {
    const record: ObserverRecord = {
      callback,
      options,
      observed: [],
      disconnect: vi.fn(),
    };
    observers.push(record);
    return {
      observe: (target: Element) => record.observed.push(target),
      unobserve: vi.fn(),
      disconnect: record.disconnect,
      takeRecords: () => [],
      root: null,
      rootMargin: options?.rootMargin ?? "",
      thresholds: [],
    };
  }) as unknown as typeof IntersectionObserver;
});

afterEach(() => {
  global.IntersectionObserver = ORIGINAL_INTERSECTION_OBSERVER;
});

describe("useRevealOnScroll", () => {
  it("hides the element after mount until it scrolls into view", () => {
    render(<Revealed />);

    const element = screen.getByText("content");
    expect(element).toHaveAttribute("data-reveal", "hidden");
    expect(observers).toHaveLength(1);
    expect(observers[0].observed).toEqual([element]);

    intersect(observers[0], false);
    expect(element).toHaveAttribute("data-reveal", "hidden");

    intersect(observers[0], true);
    expect(element).toHaveAttribute("data-reveal", "shown");
    expect(observers[0].disconnect).toHaveBeenCalled();
  });

  it("uses an -80px root margin by default and accepts a custom one", () => {
    render(<Revealed />);
    render(<Revealed margin="-100px" />);

    expect(observers[0].options?.rootMargin).toBe("-80px");
    expect(observers[1].options?.rootMargin).toBe("-100px");
  });

  it("leaves the element visible and unobserved when reduced motion is preferred", () => {
    mockReducedMotion(true);

    render(<Revealed />);

    expect(screen.getByText("content")).not.toHaveAttribute("data-reveal");
    expect(observers).toHaveLength(0);
  });

  it("leaves the element visible when IntersectionObserver is unavailable", () => {
    Reflect.deleteProperty(global, "IntersectionObserver");

    render(<Revealed />);

    expect(screen.getByText("content")).not.toHaveAttribute("data-reveal");
  });

  it("does not hide an element that is already in the viewport on mount", () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({ top: 100, bottom: 300 } as DOMRect);

    render(<Revealed />);

    expect(screen.getByText("content")).not.toHaveAttribute("data-reveal");
    expect(observers).toHaveLength(0);
    rect.mockRestore();
  });

  it("does not hide an element that is in the viewport but inside the root-margin band", () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        top: window.innerHeight - 40,
        bottom: window.innerHeight + 200,
      } as DOMRect);

    render(<Revealed />);

    expect(screen.getByText("content")).not.toHaveAttribute("data-reveal");
    expect(observers).toHaveLength(0);
    rect.mockRestore();
  });

  it("hides an element that starts just below the viewport", () => {
    const rect = vi
      .spyOn(HTMLElement.prototype, "getBoundingClientRect")
      .mockReturnValue({
        top: window.innerHeight,
        bottom: window.innerHeight + 200,
      } as DOMRect);

    render(<Revealed />);

    expect(screen.getByText("content")).toHaveAttribute("data-reveal", "hidden");
    expect(observers).toHaveLength(1);
    rect.mockRestore();
  });

  it("does not replay the reveal when the reduced-motion preference changes", () => {
    render(<Revealed />);
    const element = screen.getByText("content");
    intersect(observers[0], true);

    const notifyChange = () => {
      const listeners = vi
        .mocked(window.matchMedia)
        .mock.results.flatMap(({ value }) =>
          vi.mocked((value as MediaQueryList).addEventListener).mock.calls,
        )
        .map(([, listener]) => listener as () => void);
      act(() => listeners.forEach((listener) => listener()));
    };

    mockReducedMotion(true);
    notifyChange();
    mockReducedMotion(false);
    notifyChange();

    expect(element).toHaveAttribute("data-reveal", "shown");
    expect(observers).toHaveLength(1);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = render(<Revealed />);

    unmount();

    expect(observers[0].disconnect).toHaveBeenCalled();
  });
});

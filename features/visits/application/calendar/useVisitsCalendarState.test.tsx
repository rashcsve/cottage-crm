import type { ComponentProps } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import type { Visit } from "../../types/visits";
import { useVisitsCalendarState } from "./useVisitsCalendarState";

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseRouter = vi.mocked(useRouter);
const mockUseToast = vi.mocked(useToast);

type MockRouter = {
  back: ReturnType<typeof vi.fn>;
  forward: ReturnType<typeof vi.fn>;
  push: ReturnType<typeof vi.fn>;
  replace: ReturnType<typeof vi.fn>;
  prefetch: ReturnType<typeof vi.fn>;
};

const CLIENT_TODAY_ISO = new Intl.DateTimeFormat("en-CA").format(new Date());

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Svetlana and Filip",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming",
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function CalendarStateHarness({
  initialVisits = [createVisit()],
  initialUrlState = {
    view: "month",
    anchorIso: "2026-04-12",
  },
  canManageVisits = true,
  todayIso = "2026-04-12",
}: {
  initialVisits?: Visit[];
  initialUrlState?: {
    view: "month" | "week" | "agenda";
    anchorIso: string;
  };
  canManageVisits?: boolean;
  todayIso?: string;
}) {
  const calendarState = useVisitsCalendarState({
    initialVisits,
    initialUrlState,
    canManageVisits,
    todayIso,
    deleteMessages: {
      success: "visits.delete.success",
      restored: "visits.delete.restored",
      undo: "visits.delete.undo",
      fallbackError: "common.error",
    },
  });

  return (
    <div>
      <div data-testid="view">{calendarState.urlState.view}</div>
      <div data-testid="anchor">{calendarState.urlState.anchorIso}</div>
      <div data-testid="selected">{calendarState.urlState.anchorIso}</div>
      <div data-testid="selected-month">
        {calendarState.selectedMonthDayIso ?? "none"}
      </div>
      <div data-testid="selected-week">
        {calendarState.selectedWeekDayIso ?? "none"}
      </div>
      <div data-testid="composer">{String(calendarState.isComposerOpen)}</div>
      <div data-testid="draft">
        {calendarState.draftRange
          ? `${calendarState.draftRange.dateFrom}:${calendarState.draftRange.dateTo}`
          : "none"}
      </div>
      <div data-testid="visits">
        {calendarState.orderedVisits.map((visit) => visit.id).join(",")}
      </div>

      <button
        type="button"
        onClick={() =>
          calendarState.handleSelectDay({
            iso: "2026-04-13",
            extendRange: false,
          })
        }
      >
        select-current-day
      </button>

      <button
        type="button"
        onClick={() =>
          calendarState.handleSelectDay({
            iso: "2026-04-16",
            extendRange: true,
          })
        }
      >
        extend-range
      </button>

      <button
        type="button"
        onClick={() =>
          calendarState.handleSelectDay({
            iso: "2026-05-01",
            extendRange: false,
          })
        }
      >
        select-overflow-day
      </button>

      <button type="button" onClick={() => calendarState.handleOpenComposer()}>
        open-composer
      </button>

      <button type="button" onClick={() => calendarState.handleShiftPeriod(1)}>
        next-period
      </button>

      <button type="button" onClick={calendarState.handleToday}>
        go-today
      </button>

      <button
        type="button"
        onClick={() =>
          calendarState.handleCreateSuccess(
            createVisit({
              id: 99,
              visitorName: "Eva Novak",
              dateFrom: "2026-04-18",
              dateTo: "2026-04-20",
            }),
          )
        }
      >
        create-success
      </button>
    </div>
  );
}

function renderHarness(
  props: Partial<ComponentProps<typeof CalendarStateHarness>> = {},
) {
  return render(<CalendarStateHarness {...props} />);
}

describe("useVisitsCalendarState", () => {
  let mockRouter: MockRouter;

  beforeEach(() => {
    mockRouter = {
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    };

    mockUseLocale.mockReturnValue("en");
    mockUseRouter.mockReturnValue(
      mockRouter as unknown as ReturnType<typeof useRouter>,
    );
    mockUseToast.mockReturnValue({
      toasts: [],
      showToast: vi.fn(() => "toast-1"),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);

    Object.defineProperty(window, "requestAnimationFrame", {
      writable: true,
      value: vi.fn((callback: FrameRequestCallback) => {
        callback(0);
        return 1;
      }),
    });

    Element.prototype.scrollIntoView = vi.fn();
    window.history.replaceState(null, "", "/visits");
  });

  it("canonicalizes an invalid view with replaceState and no extra history entry", () => {
    window.history.replaceState(null, "", "/visits?view=montsdasdas&foo=bar");
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    const pushSpy = vi.spyOn(window.history, "pushState");

    renderHarness({
      initialUrlState: {
        view: "month",
        anchorIso: "2026-04-12",
      },
    });
    pushSpy.mockClear();

    expect(screen.getByTestId("view")).toHaveTextContent("month");
    expect(screen.getByTestId("anchor")).toHaveTextContent(CLIENT_TODAY_ISO);
    expect(window.location.search).toBe(
      `?foo=bar&view=month&date=${CLIENT_TODAY_ISO}`,
    );
    expect(replaceSpy).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("canonicalizes an invalid date with replaceState and preserves unrelated params", () => {
    window.history.replaceState(
      null,
      "",
      "/visits?view=week&date=2026-99-99&foo=bar",
    );
    const replaceSpy = vi.spyOn(window.history, "replaceState");
    const pushSpy = vi.spyOn(window.history, "pushState");

    renderHarness({
      initialUrlState: {
        view: "week",
        anchorIso: "2026-04-12",
      },
    });
    pushSpy.mockClear();

    expect(screen.getByTestId("view")).toHaveTextContent("week");
    expect(screen.getByTestId("anchor")).toHaveTextContent(CLIENT_TODAY_ISO);
    expect(screen.getByTestId("selected")).toHaveTextContent(CLIENT_TODAY_ISO);
    expect(screen.getByTestId("selected-week")).toHaveTextContent("none");
    expect(window.location.search).toBe(
      `?foo=bar&view=week&date=${CLIENT_TODAY_ISO}`,
    );
    expect(replaceSpy).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });

  it("selects a day without opening the composer and keeps the url in sync", () => {
    window.history.replaceState(
      null,
      "",
      "/visits?foo=bar&view=month&date=2026-04-12",
    );

    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "select-current-day" }));

    expect(screen.getByTestId("selected")).toHaveTextContent("2026-04-13");
    expect(screen.getByTestId("selected-month")).toHaveTextContent(
      "2026-04-13",
    );
    expect(screen.getByTestId("anchor")).toHaveTextContent("2026-04-13");
    expect(screen.getByTestId("composer")).toHaveTextContent("false");
    expect(screen.getByTestId("draft")).toHaveTextContent("none");
    expect(window.location.search).toBe("?foo=bar&view=month&date=2026-04-13");
  });

  it("does not create a new implicit month selection when the period changes", () => {
    window.history.replaceState(
      null,
      "",
      "/visits?foo=bar&view=month&date=2026-04-12",
    );

    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "select-current-day" }));

    expect(screen.getByTestId("selected-month")).toHaveTextContent(
      "2026-04-13",
    );

    fireEvent.click(screen.getByRole("button", { name: "next-period" }));

    expect(screen.getByTestId("anchor")).toHaveTextContent("2026-05-01");
    expect(screen.getByTestId("selected-month")).toHaveTextContent("none");
  });

  it("treats Today as an explicit month-day jump", () => {
    window.history.replaceState(
      null,
      "",
      "/visits?foo=bar&view=month&date=2026-04-12",
    );

    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "go-today" }));

    expect(screen.getByTestId("anchor")).toHaveTextContent(CLIENT_TODAY_ISO);
    expect(screen.getByTestId("selected-month")).toHaveTextContent(
      CLIENT_TODAY_ISO,
    );
    expect(window.location.search).toBe(
      `?foo=bar&view=month&date=${CLIENT_TODAY_ISO}`,
    );
  });

  it("keeps week navigation explicit without closing an in-progress composer", () => {
    window.history.replaceState(
      null,
      "",
      "/visits?foo=bar&view=week&date=2026-04-12",
    );

    renderHarness({
      initialUrlState: {
        view: "week",
        anchorIso: "2026-04-12",
      },
    });

    fireEvent.click(screen.getByRole("button", { name: "select-current-day" }));
    fireEvent.click(screen.getByRole("button", { name: "open-composer" }));
    fireEvent.click(screen.getByRole("button", { name: "extend-range" }));

    expect(screen.getByTestId("selected-week")).toHaveTextContent("2026-04-16");
    expect(screen.getByTestId("anchor")).toHaveTextContent("2026-04-16");
    expect(screen.getByTestId("composer")).toHaveTextContent("true");
    expect(screen.getByTestId("draft")).toHaveTextContent(
      "2026-04-13:2026-04-16",
    );

    fireEvent.click(screen.getByRole("button", { name: "next-period" }));

    expect(screen.getByTestId("selected-week")).toHaveTextContent("none");
    expect(screen.getByTestId("anchor")).toHaveTextContent("2026-04-23");
    expect(screen.getByTestId("composer")).toHaveTextContent("true");
    expect(screen.getByTestId("draft")).toHaveTextContent(
      "2026-04-13:2026-04-16",
    );
  });

  it("opens creation explicitly from the current selection and extends the draft while editing", () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "select-current-day" }));
    fireEvent.click(screen.getByRole("button", { name: "open-composer" }));

    expect(screen.getByTestId("composer")).toHaveTextContent("true");
    expect(screen.getByTestId("draft")).toHaveTextContent(
      "2026-04-13:2026-04-13",
    );

    fireEvent.click(screen.getByRole("button", { name: "extend-range" }));

    expect(screen.getByTestId("draft")).toHaveTextContent(
      "2026-04-13:2026-04-16",
    );
  });

  it("keeps only local created visits client-side and deduplicates them once the server data catches up", () => {
    const createdVisit = createVisit({
      id: 99,
      visitorName: "Eva Novak",
      dateFrom: "2026-04-18",
      dateTo: "2026-04-20",
    });
    const rendered = renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "create-success" }));

    expect(screen.getByTestId("visits")).toHaveTextContent("1,99");
    expect(screen.getByTestId("selected")).toHaveTextContent("2026-04-18");
    expect(screen.getByTestId("composer")).toHaveTextContent("false");
    expect(window.location.search).toBe("?view=month&date=2026-04-18");

    rendered.rerender(
      <CalendarStateHarness
        initialVisits={[createVisit(), createdVisit]}
        initialUrlState={{
          view: "month",
          anchorIso: "2026-04-12",
        }}
      />,
    );

    expect(screen.getByTestId("visits")).toHaveTextContent("1,99");
    expect(screen.getByTestId("selected")).toHaveTextContent("2026-04-18");
  });

  it("syncs internal calendar state when the initial url state prop changes", () => {
    const rendered = renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "select-current-day" }));
    fireEvent.click(screen.getByRole("button", { name: "open-composer" }));

    expect(screen.getByTestId("composer")).toHaveTextContent("true");
    expect(screen.getByTestId("selected-month")).toHaveTextContent(
      "2026-04-13",
    );

    window.history.replaceState(null, "", "/visits?view=week&date=2026-04-19");

    rendered.rerender(
      <CalendarStateHarness
        initialUrlState={{
          view: "week",
          anchorIso: "2026-04-19",
        }}
      />,
    );

    expect(screen.getByTestId("view")).toHaveTextContent("week");
    expect(screen.getByTestId("anchor")).toHaveTextContent("2026-04-19");
    expect(screen.getByTestId("selected")).toHaveTextContent("2026-04-19");
    expect(screen.getByTestId("selected-month")).toHaveTextContent("none");
    expect(screen.getByTestId("selected-week")).toHaveTextContent("none");
    expect(screen.getByTestId("composer")).toHaveTextContent("false");
    expect(screen.getByTestId("draft")).toHaveTextContent("none");
  });

  it("preserves the composer draft while browser history changes", () => {
    renderHarness();

    fireEvent.click(screen.getByRole("button", { name: "select-current-day" }));
    fireEvent.click(screen.getByRole("button", { name: "open-composer" }));
    fireEvent.click(screen.getByRole("button", { name: "extend-range" }));

    act(() => {
      window.history.pushState(null, "", "/visits?view=week&date=2026-04-19");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByTestId("view")).toHaveTextContent("week");
    expect(screen.getByTestId("anchor")).toHaveTextContent("2026-04-19");
    expect(screen.getByTestId("selected")).toHaveTextContent("2026-04-19");
    expect(screen.getByTestId("selected-week")).toHaveTextContent("none");
    expect(screen.getByTestId("composer")).toHaveTextContent("true");
    expect(screen.getByTestId("draft")).toHaveTextContent(
      "2026-04-13:2026-04-16",
    );
  });

  it("canonicalizes invalid browser-navigation params with replaceState", () => {
    renderHarness();
    window.history.pushState(
      null,
      "",
      "/visits?view=oops&date=2026-99-99&foo=bar",
    );

    const replaceSpy = vi.spyOn(window.history, "replaceState");
    const pushSpy = vi.spyOn(window.history, "pushState");
    replaceSpy.mockClear();
    pushSpy.mockClear();

    act(() => {
      window.dispatchEvent(new PopStateEvent("popstate"));
    });

    expect(screen.getByTestId("view")).toHaveTextContent("month");
    expect(screen.getByTestId("anchor")).toHaveTextContent(CLIENT_TODAY_ISO);
    expect(screen.getByTestId("selected")).toHaveTextContent(CLIENT_TODAY_ISO);
    expect(screen.getByTestId("selected-week")).toHaveTextContent("none");
    expect(window.location.search).toBe(
      `?foo=bar&view=month&date=${CLIENT_TODAY_ISO}`,
    );
    expect(replaceSpy).toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
  });
});

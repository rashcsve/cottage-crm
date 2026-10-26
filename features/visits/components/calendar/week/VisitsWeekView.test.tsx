import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type {
  CalendarDay,
  CalendarWeek,
} from "../../../domain/visits-calendar-types";
import type { Visit, VisitStatus } from "../../../types/visits";
import { VisitsWeekView } from "./VisitsWeekView";

const FORBIDDEN_CLASS_PATTERNS = [
  /\b(?:[a-z-]+:)*(?:bg|text|border|ring|from|to|via|outline|divide|fill|stroke)-(?:stone|amber|emerald|sky|rose|red|green|yellow|slate|gray|zinc|neutral|white|black)\b/,
  /focus-visible:outline-none/,
  /text-\[\d+px\]/,
  /(?:^|\s)(?:[a-z-]+:)*shadow-/,
  /rounded-(?:lg|xl|2xl|3xl|4xl)\b/,
];

function createVisit(id: number, status: VisitStatus, visitorName: string): Visit {
  return {
    id,
    visitorName,
    dateFrom: "2026-04-07",
    dateTo: "2026-04-09",
    status,
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
  };
}

function createWeekWithVisits(): CalendarWeek {
  const week = createWeek();
  const visits = [
    createVisit(1, "current", "Eva Novak"),
    createVisit(2, "upcoming", "Tom Dvorak"),
    createVisit(3, "past", "Jana Mala"),
  ];

  return {
    ...week,
    days: week.days.map((day, index): CalendarDay => ({
      ...day,
      isToday: index === 1,
      visits: index >= 1 && index <= 3 ? visits : [],
    })),
    rows: visits.map((visit) => [
      {
        key: `visit-${visit.id}`,
        visit,
        startIndex: 1,
        span: 3,
        continuesBefore: false,
        continuesAfter: false,
      },
    ]),
  };
}

function getAllClassNames(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLElement>("[class]")).map(
    (element) => element.getAttribute("class") ?? "",
  );
}

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

function createWeek(): CalendarWeek {
  return {
    key: "2026-04-06",
    days: Array.from({ length: 7 }, (_, index) => {
      const dayNumber = 6 + index;
      const iso = `2026-04-${String(dayNumber).padStart(2, "0")}`;

      return {
        iso,
        date: new Date(Date.UTC(2026, 3, dayNumber)),
        inCurrentMonth: true,
        isToday: false,
        visits: [],
      };
    }),
    rows: [],
  };
}

describe("VisitsWeekView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLocale.mockReturnValue("en");
    mockUseTranslations.mockImplementation((namespace?: string) => {
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, string | number>) => {
        if (!values) {
          return `${prefix}${key}`;
        }

        return `${prefix}${key}:${Object.values(values).join(" | ")}`;
      }) as ReturnType<typeof useTranslations>;
    });
  });

  it("uses desktop grid semantics and moves selection with arrow keys", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const grid = within(desktop).getByRole("grid", {
      name: "visits.calendar.weekGrid",
    });
    const buttons = within(desktop).getAllByRole("button");
    const selectedButton = buttons[2];
    const nextButton = buttons[3];

    expect(selectedButton).toBeDefined();
    expect(nextButton).toBeDefined();

    selectedButton.focus();
    fireEvent.keyDown(selectedButton, { key: "ArrowRight" });

    expect(grid).toHaveAttribute("aria-describedby");
    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-09",
      extendRange: false,
    });
    expect(nextButton).toHaveFocus();
  });

  it("uses a mobile day picker with one selected-day panel", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const dayPicker = within(mobile).getByRole("group", {
      name: "visits.calendar.weekDayPicker",
    });
    const tabs = within(dayPicker).getAllByRole("button");
    const selectedTab = tabs[2];

    expect(within(mobile).getByText("visits.calendar.selectedDay")).toBeInTheDocument();
    expect(selectedTab).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(tabs[4]!);

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-10",
      extendRange: false,
    });
  });

  it("lets an open draft move to another day by clicking the day content", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={true}
        isDraftMode={true}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");

    fireEvent.click(within(desktop).getAllByText("visits.calendar.noVisitsShort")[0]!, {
      shiftKey: true,
    });

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-06",
      extendRange: true,
    });
  });

  it("shows a neutral mobile panel when no day is selected", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso={null}
        draftRange={null}
        canManageVisits={true}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    expect(screen.getByText("visits.calendar.chooseDayTitle")).toBeInTheDocument();
    expect(
      screen.getByText("visits.calendar.chooseDayDescription"),
    ).toBeInTheDocument();
  });

  it.each([
    { state: "browsing", isDraftMode: false, draftRange: null },
    {
      state: "editing a draft",
      isDraftMode: true,
      draftRange: { dateFrom: "2026-04-07", dateTo: "2026-04-09" },
    },
  ])("uses only Fjäll tokens while $state", ({ isDraftMode, draftRange }) => {
    const { container } = render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-08"
        draftRange={draftRange}
        canManageVisits={true}
        isDraftMode={isDraftMode}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const offending = getAllClassNames(container).filter((className) =>
      FORBIDDEN_CLASS_PATTERNS.some((pattern) => pattern.test(className)),
    );

    expect(offending).toEqual([]);
  });

  it("keeps the desktop button count per day column", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={true}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const cells = within(desktop).getAllByRole("gridcell");

    expect(cells).toHaveLength(7);
    for (const cell of cells) {
      expect(within(cell).getAllByRole("button")).toHaveLength(2);
    }
  });

  it("shows desktop day numerals in mono, accent-filled only for today", () => {
    render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-09"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const todayNumeral = within(desktop).getByText("7");
    const selectedNumeral = within(desktop).getByText("9");
    const plainNumeral = within(desktop).getByText("10");

    for (const numeral of [todayNumeral, selectedNumeral, plainNumeral]) {
      expect(numeral).toHaveClass("font-mono");
    }
    expect(todayNumeral).toHaveClass("bg-accent", "text-on-accent");
    expect(selectedNumeral).not.toHaveClass("bg-accent");
    expect(plainNumeral).not.toHaveClass("bg-accent");
    expect(
      desktop.querySelector('button[data-day-iso="2026-04-07"]'),
    ).toHaveAttribute("aria-current", "date");
  });

  it("marks the selected desktop column with an inset accent ring", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-09"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const [selectedCell] = within(desktop)
      .getAllByRole("gridcell")
      .filter((cell) => cell.getAttribute("aria-selected") === "true");
    const otherCell = within(desktop).getAllByRole("gridcell")[0];

    expect(selectedCell).toHaveClass("ring-2", "ring-inset", "ring-accent");
    expect(otherCell).not.toHaveClass("ring-2");
  });

  it("names draft-range days and marks them with a non-colour band", () => {
    render(
      <VisitsWeekView
        week={createWeek()}
        selectedDateIso="2026-04-11"
        draftRange={{ dateFrom: "2026-04-07", dateTo: "2026-04-09" }}
        canManageVisits={true}
        isDraftMode={true}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const desktop = screen.getByTestId("week-desktop-view");
    const inRange = desktop.querySelector('button[data-day-iso="2026-04-08"]');
    const outOfRange = desktop.querySelector(
      'button[data-day-iso="2026-04-10"]',
    );

    expect(inRange).toHaveAttribute(
      "aria-label",
      expect.stringContaining("visits.calendar.inDraftRange"),
    );
    expect(inRange?.parentElement).toHaveClass("range-band");
    expect(outOfRange).toHaveAttribute(
      "aria-label",
      expect.not.stringContaining("visits.calendar.inDraftRange"),
    );
    expect(outOfRange?.parentElement).not.toHaveClass("range-band");
  });

  it("lays the mobile strip out as seven equal cells with an accent top bar on the selected day", () => {
    render(
      <VisitsWeekView
        week={createWeekWithVisits()}
        selectedDateIso="2026-04-08"
        draftRange={null}
        canManageVisits={false}
        isDraftMode={false}
        onAddVisit={vi.fn()}
        onSelectDay={vi.fn()}
      />,
    );

    const mobile = screen.getByTestId("week-mobile-view");
    const dayPicker = within(mobile).getByRole("group", {
      name: "visits.calendar.weekDayPicker",
    });
    const tabs = within(dayPicker).getAllByRole("button");
    const selectedTab = tabs[2]!;
    const otherTab = tabs[4]!;

    expect(dayPicker).toHaveClass("grid", "grid-cols-7");
    expect(dayPicker).not.toHaveClass("overflow-x-auto");
    expect(selectedTab).toHaveAttribute("aria-pressed", "true");
    expect(selectedTab).toHaveClass("before:bg-accent");
    expect(otherTab).not.toHaveClass("before:bg-accent");
    for (const tab of tabs) {
      expect(tab).toHaveClass("min-h-11");
    }
    expect(within(selectedTab).getByText("8")).toHaveClass("font-mono");
    expect(tabs[1]).toHaveAttribute("aria-current", "date");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import type { Visit } from "../../../types/visits";
import { VisitsWeekDayContent } from "./VisitsWeekDayContent";

vi.mock("next-intl", () => ({
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}));

const mockUseLocale = vi.mocked(useLocale);
const mockUseTranslations = vi.mocked(useTranslations);

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Eva Novak",
    dateFrom: "2026-04-10",
    dateTo: "2026-04-12",
    status: "upcoming",
    note: "Bring spare keys for the back entrance.",
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("VisitsWeekDayContent", () => {
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

  it("selects an unselected day before opening the composer from the hover action", () => {
    const onSelectDay = vi.fn();
    const onAddVisit = vi.fn();

    render(
      <VisitsWeekDayContent
        dayIso="2026-04-09"
        dateLabel="Thursday, April 9, 2026"
        visits={[]}
        isSelected={false}
        isDraftMode={false}
        canManageVisits={true}
        onAddVisit={onAddVisit}
        onSelectDay={onSelectDay}
        timelineRows={[]}
      />,
    );

    const button = screen.getByRole("button", {
      name: "visits.calendar.addVisitOnDay:Thursday, April 9, 2026",
    });

    expect(button).toHaveAttribute("tabindex", "-1");

    fireEvent.click(button);

    expect(onSelectDay).toHaveBeenCalledWith({
      iso: "2026-04-09",
      extendRange: false,
    });
    expect(onAddVisit).toHaveBeenCalledWith("2026-04-09");
  });

  it("does not retarget the draft when the user clicks a visit card", () => {
    const onSelectDay = vi.fn();

    render(
      <VisitsWeekDayContent
        dayIso="2026-04-09"
        dateLabel="Thursday, April 9, 2026"
        visits={[createVisit()]}
        isSelected={false}
        isDraftMode={true}
        canManageVisits={false}
        onAddVisit={vi.fn()}
        onSelectDay={onSelectDay}
        timelineRows={[]}
      />,
    );

    fireEvent.click(screen.getByText("Eva Novak"));

    expect(onSelectDay).not.toHaveBeenCalled();
  });
});

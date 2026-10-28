import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { VisitsAgendaView } from "./VisitsAgendaView";
import { formatVisitCompactDate } from "../../shared/formatVisitDate";
import type { Visit } from "../../types/visits";

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
    couple: "couple-1",
    coupleLabel: null,
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

describe("VisitsAgendaView", () => {
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

  it("shows an empty state when the month has no visits", () => {
    render(
      <VisitsAgendaView visits={[]} anchorIso="2026-04-01" canManageVisits={false} />,
    );

    expect(
      screen.getByText("visits.calendar.noPeriodVisitsTitle"),
    ).toBeInTheDocument();
  });

  it("groups visits under a heading per start date with a list of rows", () => {
    render(
      <VisitsAgendaView
        visits={[
          createVisit(),
          createVisit({ id: 2, visitorName: "Tom", dateFrom: "2026-04-10", dateTo: "2026-04-11" }),
          createVisit({ id: 3, visitorName: "Jana", dateFrom: "2026-04-20", dateTo: "2026-04-21" }),
        ]}
        anchorIso="2026-04-01"
        canManageVisits={false}
      />,
    );

    const firstHeading = screen.getByRole("heading", {
      name: formatVisitCompactDate("2026-04-10", "en"),
    });
    const secondHeading = screen.getByRole("heading", {
      name: formatVisitCompactDate("2026-04-20", "en"),
    });
    const firstSection = firstHeading.closest("section");
    const secondSection = secondHeading.closest("section");

    expect(firstSection).not.toBeNull();
    expect(secondSection).not.toBeNull();
    expect(
      within(firstSection as HTMLElement).getAllByRole("listitem"),
    ).toHaveLength(2);
    expect(
      within(firstSection as HTMLElement).getByText("visits.calendar.visitsCount:2"),
    ).toBeInTheDocument();
    expect(
      within(secondSection as HTMLElement).getByText("Jana"),
    ).toBeInTheDocument();
  });

  it.each([
    ["with visits", [createVisit()]],
    ["without visits", []],
  ])("offers adding a visit above the agenda %s", (_case, visits) => {
    const onClick = vi.fn();

    render(
      <VisitsAgendaView
        visits={visits}
        anchorIso="2026-04-01"
        canManageVisits={true}
        addVisitAction={{ label: "New visit", onClick }}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "New visit" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no add button without an add action", () => {
    render(
      <VisitsAgendaView
        visits={[createVisit()]}
        anchorIso="2026-04-01"
        canManageVisits={false}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "New visit" }),
    ).not.toBeInTheDocument();
  });
});

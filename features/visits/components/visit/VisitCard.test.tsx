"use client";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { VisitCard } from "./VisitCard";
import type { Visit } from "../../types/visits";
import { formatVisitCompactDateRangeLabel } from "../../shared/formatVisitDate";

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
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("VisitCard", () => {
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

  it("does not render delete actions in read-only mode", () => {
    render(<VisitCard visit={createVisit()} canManageVisits={false} />);

    expect(
      screen.queryByRole("button", {
        name: /visits\.aria\.deleteVisitFor/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("renders an interpolated delete aria label in manageable mode", () => {
    render(
      <VisitCard
        visit={createVisit()}
        canManageVisits={true}
        onDelete={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "visits.aria.deleteVisitFor:Eva Novak",
      }),
    ).toBeInTheDocument();
  });

  it("shows a compact weekly summary with the date strip, note, and quiet metadata", () => {
    const visit = createVisit({
      note: "Bring spare keys for the back entrance.",
      author: "Svetlana",
    });

    render(<VisitCard visit={visit} canManageVisits={false} compact />);

    expect(
      screen.getByText(
        formatVisitCompactDateRangeLabel(visit.dateFrom, visit.dateTo, "en"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bring spare keys for the back entrance."),
    ).toBeInTheDocument();
    expect(screen.getByText("visits.meta.addedBy")).toBeInTheDocument();
    expect(screen.getByText("Svetlana")).toBeInTheDocument();
  });
});

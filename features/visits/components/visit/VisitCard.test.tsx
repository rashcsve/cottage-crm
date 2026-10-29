"use client";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { VisitCard } from "./VisitCard";
import type { Visit } from "../../types/visits";
import { formatVisitWeekCardDateRangeLabel } from "../../shared/formatVisitDate";

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

  it("lets admins reach the delete action on the compact card", () => {
    render(
      <VisitCard
        visit={createVisit()}
        canManageVisits={true}
        onDelete={vi.fn()}
        compact
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "visits.aria.deleteVisitFor:Eva Novak",
      }),
    ).toBeInTheDocument();
  });

  it("does not render the delete action on the compact card for viewers", () => {
    render(
      <VisitCard
        visit={createVisit()}
        canManageVisits={false}
        onDelete={vi.fn()}
        compact
      />,
    );

    expect(
      screen.queryByRole("button", {
        name: /visits\.aria\.deleteVisitFor/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("shows a compact weekly summary with the date strip, note, and quiet metadata", () => {
    const visit = createVisit({
      note: "Bring spare keys for the back entrance.",
      author: "Svetlana",
    });

    render(<VisitCard visit={visit} canManageVisits={false} compact />);

    expect(
      screen.getByText(
        formatVisitWeekCardDateRangeLabel(visit.dateFrom, visit.dateTo, "en"),
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Bring spare keys for the back entrance."),
    ).toBeInTheDocument();
    expect(screen.getByText("visits.meta.addedBy")).toBeInTheDocument();
    expect(screen.getByText("Svetlana")).toBeInTheDocument();
  });

  it("names the status in words on the compact card", () => {
    render(
      <VisitCard
        visit={createVisit({ status: "current" })}
        canManageVisits={false}
        compact
      />,
    );

    expect(screen.getByText("visits.status.current")).toBeInTheDocument();
  });

  it("keeps the compact status accessible beside the visitor name without a separate text row", () => {
    render(
      <VisitCard
        visit={createVisit({ status: "current" })}
        canManageVisits={false}
        compact
      />,
    );

    const heading = screen.getByRole("heading", { name: "Eva Novak" });
    const status = screen.getByText("visits.status.current");
    expect(status).toHaveClass("sr-only");
    expect(heading.parentElement).toContainElement(status);
    expect(screen.getByTitle("visits.status.current")).toContainElement(status);
  });

  it("shows the couple name once when it matches the visitor name", () => {
    render(
      <VisitCard
        visit={createVisit({
          visitorName: "Martina a Petr",
          couple: "couple-3",
          coupleLabel: "Martina a Petr",
        })}
        canManageVisits={false}
        compact
      />,
    );

    expect(screen.getAllByText("Martina a Petr")).toHaveLength(1);
  });

  it("shows both the visitor name and the couple name when they differ", () => {
    render(
      <VisitCard
        visit={createVisit({
          visitorName: "Filip + kamarádi",
          coupleLabel: "Svetlana a Filip",
        })}
        canManageVisits={false}
        compact
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Filip + kamarádi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Svetlana a Filip")).toBeInTheDocument();
  });
});

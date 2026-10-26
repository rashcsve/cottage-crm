import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import cs from "@/i18n/locales/cs.json";
import en from "@/i18n/locales/en.json";

const { localeRef } = vi.hoisted(() => ({
  localeRef: { current: "en" as "en" | "cs" },
}));

vi.mock("next-intl/server", async () => {
  const { createIntlServerMock } = await import(
    "@/tests/utils/create-intl-server-mock"
  );

  return createIntlServerMock(() => localeRef.current);
});

import DashboardNotFound from "./not-found";

describe("DashboardNotFound", () => {
  it("explains in English that the page does not exist", async () => {
    localeRef.current = "en";
    render(await DashboardNotFound());

    expect(
      screen.getByRole("heading", { name: en.systemPages.notFound.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.systemPages.notFound.description),
    ).toBeInTheDocument();
  });

  it("explains in Czech that the page does not exist", async () => {
    localeRef.current = "cs";
    render(await DashboardNotFound());

    expect(
      screen.getByRole("heading", { name: cs.systemPages.notFound.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: cs.navigation.overview }),
    ).toHaveAttribute("href", "/overview");
  });

  it("titles the document as not found", async () => {
    localeRef.current = "en";
    render(await DashboardNotFound());

    expect(document.title).toBe(
      `${en.systemPages.notFound.title} | ${en.metadata.title}`,
    );
  });

  it("links back to the overview using its navigation label", async () => {
    localeRef.current = "en";
    render(await DashboardNotFound());

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(en.navigation.overview);
    expect(links[0]).toHaveAttribute("href", "/overview");
  });
});

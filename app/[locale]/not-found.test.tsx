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

import LocaleNotFound from "./not-found";

describe("LocaleNotFound", () => {
  it("explains in English that the page does not exist", async () => {
    localeRef.current = "en";
    render(await LocaleNotFound());

    expect(
      screen.getByRole("heading", { name: en.systemPages.notFound.title }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(en.systemPages.notFound.description),
    ).toBeInTheDocument();
  });

  it("explains in Czech that the page does not exist", async () => {
    localeRef.current = "cs";
    render(await LocaleNotFound());

    expect(
      screen.getByRole("heading", { name: cs.systemPages.notFound.title }),
    ).toBeInTheDocument();
  });

  it("titles the document as not found", async () => {
    localeRef.current = "cs";
    render(await LocaleNotFound());

    expect(document.title).toBe(
      `${cs.systemPages.notFound.title} | ${cs.metadata.title}`,
    );
  });

  it("offers a single link back home", async () => {
    localeRef.current = "en";
    render(await LocaleNotFound());

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(en.systemPages.notFound.homeCta);
    expect(links[0]).toHaveAttribute("href", "/");
  });
});

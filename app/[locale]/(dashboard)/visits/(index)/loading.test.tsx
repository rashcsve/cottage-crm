import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import VisitsLoading from "./loading";

vi.mock("next-intl/server", async () => {
  const { createNamespacedTranslatorMock } = await import(
    "@/tests/utils/create-server-translations-mock"
  );

  return {
    getTranslations: vi.fn(async (namespace: string) =>
      createNamespacedTranslatorMock(namespace),
    ),
  };
});

describe("VisitsLoading", () => {
  it("keeps the page title while loading", async () => {
    render(await VisitsLoading());

    expect(
      screen.getByRole("heading", { level: 1, name: "visits.pageTitle" })
    ).toBeInTheDocument();
  });

  it("announces loading to assistive technology and marks the content busy", async () => {
    const { container } = render(await VisitsLoading());

    expect(screen.getByRole("status")).toHaveTextContent("common.loading");
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("hides the skeleton placeholders from assistive technology", async () => {
    render(await VisitsLoading());

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("heading")).toHaveLength(1);
  });
});

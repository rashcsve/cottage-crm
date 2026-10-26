import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotesLoading from "./loading";

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

describe("NotesLoading", () => {
  it("keeps the page title and section heading while loading", async () => {
    render(await NotesLoading());

    expect(
      screen.getByRole("heading", { level: 1, name: "notes.pageTitle" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "notes.sections.notes" })
    ).toBeInTheDocument();
  });

  it("announces loading to assistive technology and marks the content busy", async () => {
    const { container } = render(await NotesLoading());

    expect(screen.getByRole("status")).toHaveTextContent("common.loading");
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("uses the wide page width like Tasks and Supplies", async () => {
    const { container } = render(await NotesLoading());

    expect(container.querySelector(".max-w-page")).not.toBeNull();
  });
});

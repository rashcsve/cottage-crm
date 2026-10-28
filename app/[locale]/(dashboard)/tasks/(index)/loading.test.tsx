import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import TasksLoading from "./loading";

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

describe("TasksLoading", () => {
  it("announces loading to assistive technology and marks the content busy", async () => {
    const { container } = render(await TasksLoading());

    expect(screen.getByRole("status")).toHaveTextContent("common.loading");
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });

  it("does not show a filter-specific toolbar title while the filter is unknown", async () => {
    render(await TasksLoading());

    expect(screen.queryByText("tasks.sections.open.title")).not.toBeInTheDocument();
    expect(screen.queryByText("tasks.sections.done.title")).not.toBeInTheDocument();
  });
});

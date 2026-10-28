import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import NotesLoading from "./notes/(index)/loading";
import ShoppingLoading from "./shopping/(index)/loading";
import TasksLoading from "./tasks/(index)/loading";
import VisitsLoading from "./visits/(index)/loading";

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

describe.each([
  { name: "NotesLoading", Loading: NotesLoading, namespace: "notes" },
  { name: "ShoppingLoading", Loading: ShoppingLoading, namespace: "shopping" },
  { name: "TasksLoading", Loading: TasksLoading, namespace: "tasks" },
  { name: "VisitsLoading", Loading: VisitsLoading, namespace: "visits" },
])("$name", ({ Loading, namespace }) => {
  it("keeps the page title while loading", async () => {
    render(await Loading());

    expect(
      screen.getByRole("heading", { level: 1, name: `${namespace}.pageTitle` }),
    ).toBeInTheDocument();
  });

  it("announces loading to assistive technology and marks the content busy", async () => {
    const { container } = render(await Loading());

    expect(screen.getByRole("status")).toHaveTextContent("common.loading");
    expect(container.querySelector('[aria-busy="true"]')).not.toBeNull();
  });
});

describe("TasksLoading", () => {
  it("does not show a filter-specific toolbar title while the filter is unknown", async () => {
    render(await TasksLoading());

    expect(screen.queryByText("tasks.sections.open.title")).not.toBeInTheDocument();
    expect(screen.queryByText("tasks.sections.done.title")).not.toBeInTheDocument();
  });
});

describe("VisitsLoading", () => {
  it("hides the skeleton placeholders from assistive technology", async () => {
    render(await VisitsLoading());

    expect(screen.queryByRole("grid")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryAllByRole("heading")).toHaveLength(1);
  });
});

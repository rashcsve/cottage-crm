import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { useTranslations } from "next-intl";
import { createTranslatorMock } from "@/tests/utils/create-translator-mock";
import { TasksStatusSwitch } from "./TasksStatusSwitch";

vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({
    href,
    children,
    ...props
  }: {
    href: { pathname: string; query?: Record<string, string> };
    children: React.ReactNode;
  }) => (
    <a
      href={`${href.pathname}?${new URLSearchParams(href.query).toString()}`}
      {...props}
    >
      {children}
    </a>
  ),
}));

const mockUseTranslations = vi.mocked(useTranslations);

describe("TasksStatusSwitch", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockUseTranslations.mockImplementation((namespace?: string) => {
      const translator = createTranslatorMock();
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, unknown>) =>
        translator(`${prefix}${key}`, values)) as unknown as ReturnType<
        typeof useTranslations
      >;
    });
  });

  it("renders Open and Completed links with their counts inside a labelled navigation", () => {
    render(<TasksStatusSwitch activeFilter="open" openCount={5} doneCount={12} />);

    const nav = screen.getByRole("navigation", { name: "tasks.switch.ariaLabel" });

    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => [link.textContent, link.getAttribute("href")]),
    ).toEqual([
      ["tasks.switch.open 5 tasks.switch.countUnit", "/tasks?filter=open"],
      ["tasks.switch.done 12 tasks.switch.countUnit", "/tasks?filter=done"],
    ]);
  });

  it.each([
    { activeFilter: "open" as const, current: "tasks.switch.open 5 tasks.switch.countUnit", other: "tasks.switch.done 12 tasks.switch.countUnit" },
    { activeFilter: "done" as const, current: "tasks.switch.done 12 tasks.switch.countUnit", other: "tasks.switch.open 5 tasks.switch.countUnit" },
  ])(
    "marks only the $activeFilter link as the current page",
    ({ activeFilter, current, other }) => {
      render(
        <TasksStatusSwitch activeFilter={activeFilter} openCount={5} doneCount={12} />,
      );

      expect(screen.getByRole("link", { name: current })).toHaveAttribute(
        "aria-current",
        "page",
      );
      expect(screen.getByRole("link", { name: other })).not.toHaveAttribute(
        "aria-current",
      );
    },
  );
});

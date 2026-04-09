import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskDueDate } from "./TaskDueDate";
import {
  createCompletedTask,
  createFutureTask,
  createOverdueTask,
  createTaskWithoutDueDate,
} from "@/tests/fixtures/task-fixtures";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/utils/date", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/date")>();

  return {
    ...actual,
    formatDateOnly: (date: string) => date,
  };
});

vi.mock("@/shared/ui/StatusBadge", () => ({
  StatusBadge: ({ children, tone }: { children: string; tone: string }) => (
    <div data-testid="status-badge" data-tone={tone}>
      {children}
    </div>
  ),
}));

describe("TaskDueDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders status badge with formatted date for valid due date", () => {
    const task = createFutureTask({
      dueDate: "2026-04-15",
      dueKind: "dueOn",
    });

    render(<TaskDueDate task={task} />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("2026-04-15");
  });

  it("returns null when no due date provided", () => {
    const task = createTaskWithoutDueDate();
    const { container } = render(<TaskDueDate task={task} />);

    expect(container.firstChild).toBeNull();
  });

  it("applies warning tone for overdue tasks", () => {
    const task = createOverdueTask({
      dueDate: "2026-04-01",
      dueKind: "overdue",
    });

    render(<TaskDueDate task={task} />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "warning");
  });

  it("applies warning tone for due today tasks", () => {
    const task = createFutureTask({
      dueDate: "2026-04-07",
      dueKind: "dueToday",
    });

    render(<TaskDueDate task={task} />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "warning");
  });

  it("applies neutral tone for completed tasks", () => {
    const task = createCompletedTask({
      dueDate: "2026-04-07",
      dueKind: "completed",
    });

    render(<TaskDueDate task={task} />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "neutral");
  });

  it("applies neutral tone for future due tasks", () => {
    const task = createFutureTask({
      dueDate: "2026-05-15",
      dueKind: "dueOn",
    });

    render(<TaskDueDate task={task} />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "neutral");
  });

  it("returns null when task.dueKind is missing", () => {
    const task = createFutureTask({
      dueDate: "2026-04-15",
      dueKind: null as never,
    });
    const { container } = render(<TaskDueDate task={task} />);

    expect(container.firstChild).toBeNull();
  });
});

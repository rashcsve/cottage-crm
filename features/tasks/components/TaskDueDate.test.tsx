import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TaskDueDate } from "./TaskDueDate";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/lib/utils/date", () => ({
  formatDateOnly: (date: string) => date,
}));

vi.mock("@/shared/ui/StatusBadge", () => ({
  StatusBadge: ({ children, tone }: { children: string; tone: string }) => (
    <div data-testid="status-badge" data-tone={tone}>
      {children}
    </div>
  ),
}));

vi.mock("@/features/tasks/domain/predicates", () => ({
  deriveTaskDueKind: vi.fn(),
}));

import { deriveTaskDueKind } from "@/features/tasks/domain/predicates";

const mockDeriveTaskDueKind = deriveTaskDueKind as ReturnType<typeof vi.fn>;

describe("TaskDueDate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders status badge with formatted date for valid due date", () => {
    mockDeriveTaskDueKind.mockReturnValue("dueOn");

    render(<TaskDueDate dueDate="2026-04-15" status="pending" />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("2026-04-15");
  });

  it("returns null when no due date provided", () => {
    const { container } = render(
      <TaskDueDate dueDate={null} status="pending" />
    );

    expect(container.firstChild).toBeNull();
    expect(mockDeriveTaskDueKind).not.toHaveBeenCalled();
  });

  it("applies warning tone for overdue tasks", () => {
    mockDeriveTaskDueKind.mockReturnValue("overdue");

    render(<TaskDueDate dueDate="2026-04-01" status="pending" />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "warning");
  });

  it("applies warning tone for due today tasks", () => {
    mockDeriveTaskDueKind.mockReturnValue("dueToday");

    render(<TaskDueDate dueDate="2026-04-07" status="pending" />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "warning");
  });

  it("applies neutral tone for completed tasks", () => {
    mockDeriveTaskDueKind.mockReturnValue("completed");

    render(<TaskDueDate dueDate="2026-04-07" status="done" />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "neutral");
  });

  it("applies neutral tone for future due tasks", () => {
    mockDeriveTaskDueKind.mockReturnValue("dueOn");

    render(<TaskDueDate dueDate="2026-05-15" status="pending" />);

    const badge = screen.getByTestId("status-badge");
    expect(badge).toHaveAttribute("data-tone", "neutral");
  });

  it("returns null when deriveTaskDueKind returns null", () => {
    mockDeriveTaskDueKind.mockReturnValue(null);

    const { container } = render(
      <TaskDueDate dueDate="2026-04-15" status="pending" />
    );

    expect(container.firstChild).toBeNull();
  });

  it("passes correct arguments to deriveTaskDueKind", () => {
    mockDeriveTaskDueKind.mockReturnValue("dueOn");

    render(<TaskDueDate dueDate="2026-04-15" status="done" />);

    expect(mockDeriveTaskDueKind).toHaveBeenCalledWith(
      "2026-04-15",
      "done",
      expect.any(Date)
    );
  });
});

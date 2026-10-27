import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { dynamicLoads } from "@/tests/utils/spied-dynamic";
import { createVisitAction } from "../../server/actions";
import type { Visit } from "../../types/visits";
import { VisitsCalendar } from "./VisitsCalendar";

vi.mock("next/dynamic", async () => {
  const { createSpiedDynamic } = await import("@/tests/utils/spied-dynamic");

  return createSpiedDynamic();
});

vi.mock("@/shared/Toast/useToast", () => ({
  useToast: vi.fn(),
}));

vi.mock("../../server/actions", () => ({
  createVisitAction: vi.fn(),
  deleteVisitAction: vi.fn(),
}));

const mockCreateVisitAction = vi.mocked(createVisitAction);
const mockRefresh = vi.fn();

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
const show = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute("open", "");
});
const close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute("open");
  this.dispatchEvent(new Event("close"));
});

function mockDesktop(matches: boolean) {
  vi.mocked(window.matchMedia).mockImplementation((query: string) => ({
    matches: query.includes("min-width") ? matches : false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

function createVisit(overrides: Partial<Visit> = {}): Visit {
  return {
    id: 1,
    visitorName: "Svetlana and Filip",
    dateFrom: "2026-04-03",
    dateTo: "2026-04-04",
    status: "upcoming",
    note: null,
    author: "Admin",
    authorId: "user-1",
    createdAt: "2026-04-01T10:00:00.000Z",
    ...overrides,
  };
}

function renderCalendar({
  canManageVisits = true,
  view = "month",
}: {
  canManageVisits?: boolean;
  view?: "month" | "week" | "agenda";
} = {}) {
  window.history.replaceState(null, "", `/visits?view=${view}&date=2026-04-12`);

  return render(
    <VisitsCalendar
      visits={[createVisit()]}
      canManageVisits={canManageVisits}
      todayIso="2026-04-12"
      currentUserName="Svetlana Admin"
      initialUrlState={{ view, anchorIso: "2026-04-12" }}
    />,
  );
}

function getDayButton(container: HTMLElement, iso: string) {
  const button = container.querySelector<HTMLButtonElement>(
    `button[data-day-iso="${iso}"]`,
  );

  if (!button) {
    throw new Error(`No day button for ${iso}`);
  }

  return button;
}

function getAddOnSelectedDayButton() {
  return screen.getByRole("button", { name: /visits\.calendar\.addVisitOnDay/ });
}

async function openFromSelectedDay(user: ReturnType<typeof userEvent.setup>) {
  await user.click(getAddOnSelectedDayButton());
  const dialog = screen.getByRole("dialog", { name: "visits.form.title" });
  await within(dialog).findByLabelText("visits.form.dateFrom", { exact: false });
  return dialog;
}

function getDateInputs(dialog: HTMLElement) {
  return {
    dateFrom: within(dialog).getByLabelText("visits.form.dateFrom", {
      exact: false,
    }),
    dateTo: within(dialog).getByLabelText("visits.form.dateTo", {
      exact: false,
    }),
  };
}

describe("VisitsCalendar add panel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dynamicLoads.loader.mockClear();

    vi.mocked(useLocale).mockReturnValue("en");
    vi.mocked(useTranslations).mockImplementation((namespace?: string) => {
      const prefix = namespace ? `${namespace}.` : "";

      return ((key: string, values?: Record<string, string | number>) =>
        values
          ? `${prefix}${key}:${Object.values(values).join(" | ")}`
          : `${prefix}${key}`) as ReturnType<typeof useTranslations>;
    });
    vi.mocked(useRouter).mockReturnValue({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: mockRefresh,
      prefetch: vi.fn(),
    } as unknown as ReturnType<typeof useRouter>);
    vi.mocked(useToast).mockReturnValue({
      toasts: [],
      showToast: vi.fn(),
      dismissToast: vi.fn(),
      success: vi.fn(),
      info: vi.fn(),
      error: vi.fn(),
    } as unknown as ReturnType<typeof useToast>);

    HTMLDialogElement.prototype.showModal = showModal;
    HTMLDialogElement.prototype.show = show;
    HTMLDialogElement.prototype.close = close;
    mockDesktop(false);
    vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-04-12T10:00:00") });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("never shows add triggers or requests the form chunk for viewers", () => {
    renderCalendar({ canManageVisits: false });

    expect(
      screen.queryByRole("button", { name: /visits\.calendar\.addVisitOnDay/ }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("dialog", { hidden: true })).not.toBeInTheDocument();
    expect(dynamicLoads.loader).not.toHaveBeenCalled();
  });

  it("opens a non-modal drawer on desktop, pre-filled from the selected day", async () => {
    mockDesktop(true);
    const user = userEvent.setup();
    renderCalendar();

    expect(dynamicLoads.loader).not.toHaveBeenCalled();

    const dialog = await openFromSelectedDay(user);

    expect(show).toHaveBeenCalledTimes(1);
    expect(showModal).not.toHaveBeenCalled();
    const { dateFrom, dateTo } = getDateInputs(dialog);
    expect(dateFrom).toHaveValue("2026-04-12");
    expect(dateTo).toHaveValue("2026-04-12");
    await waitFor(() =>
      expect(
        within(dialog).getByLabelText("visits.form.visitorName", {
          exact: false,
        }),
      ).toHaveFocus(),
    );
  });

  it("extends the draft range from the calendar while the drawer stays open", async () => {
    mockDesktop(true);
    const user = userEvent.setup();
    const { container } = renderCalendar();
    const dialog = await openFromSelectedDay(user);
    const anchorLabelBefore = screen.getByRole("heading", { level: 2, name: /2026/ })
      .textContent;

    fireEvent.click(getDayButton(container, "2026-04-15"), { shiftKey: true });

    const { dateFrom, dateTo } = getDateInputs(dialog);
    await waitFor(() => {
      expect(dateFrom).toHaveValue("2026-04-12");
      expect(dateTo).toHaveValue("2026-04-15");
    });
    expect(dialog).toHaveAttribute("open");
    expect(
      screen.getByRole("heading", { level: 2, name: /2026/ }).textContent,
    ).toBe(anchorLabelBefore);
  });

  it("opens a modal sheet below lg from the day panel", async () => {
    const user = userEvent.setup();
    renderCalendar();

    const dialog = await openFromSelectedDay(user);

    expect(showModal).toHaveBeenCalledTimes(1);
    expect(show).not.toHaveBeenCalled();
    expect(getDateInputs(dialog).dateFrom).toHaveValue("2026-04-12");
  });

  it("keeps the panel and typed input across view changes", async () => {
    mockDesktop(true);
    const user = userEvent.setup();
    renderCalendar();
    const dialog = await openFromSelectedDay(user);
    const note = within(dialog).getByLabelText("visits.form.note");

    await user.type(note, "Bring spare keys");
    fireEvent.click(screen.getByRole("button", { name: /\.week$/ }));

    expect(dialog).toHaveAttribute("open");
    expect(note).toHaveValue("Bring spare keys");
  });

  it("returns focus to the trigger when the panel is closed", async () => {
    const user = userEvent.setup();
    renderCalendar();
    const dialog = await openFromSelectedDay(user);

    await user.click(
      within(dialog).getByRole("button", { name: "visits.form.closeComposer" }),
    );

    expect(dialog).not.toHaveAttribute("open");
    await waitFor(() => expect(getAddOnSelectedDayButton()).toHaveFocus());
  });

  it("asks before discarding typed input", async () => {
    const user = userEvent.setup();
    renderCalendar();
    const dialog = await openFromSelectedDay(user);

    await user.type(
      within(dialog).getByLabelText("visits.form.note"),
      "Bring spare keys",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "visits.form.closeComposer" }),
    );

    expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "visits.form.discardMessage",
    );
    expect(dialog).toHaveAttribute("open");

    await user.click(
      within(dialog).getByRole("button", {
        name: "common.addPanel.discardConfirm",
      }),
    );

    expect(dialog).not.toHaveAttribute("open");
  });

  it("closes after a successful add, merges the visit optimistically and returns focus", async () => {
    const user = userEvent.setup();
    mockCreateVisitAction.mockResolvedValueOnce({
      ok: true,
      data: createVisit({
        id: 99,
        visitorName: "Eva Novak",
        dateFrom: "2026-04-12",
        dateTo: "2026-04-13",
      }),
    });
    renderCalendar();
    const dialog = await openFromSelectedDay(user);
    const visitorName = within(dialog).getByLabelText("visits.form.visitorName", {
      exact: false,
    });

    await user.clear(visitorName);
    await user.type(visitorName, "Eva Novak");
    await user.click(
      within(dialog).getByRole("button", { name: "visits.form.submit" }),
    );

    await waitFor(() => expect(dialog).not.toHaveAttribute("open"));
    expect(
      screen.getByRole("button", {
        name: /April 13, 2026\. visits\.calendar\.visitsCount:1/,
      }),
    ).toBeInTheDocument();
    await waitFor(() => expect(getAddOnSelectedDayButton()).toHaveFocus());
    expect(mockRefresh).not.toHaveBeenCalled();
  });

  it("opens the panel from the agenda add button and returns focus to it", async () => {
    const user = userEvent.setup();
    renderCalendar({ view: "agenda" });

    await user.click(
      screen.getByRole("button", { name: "visits.form.openComposer" }),
    );
    const dialog = screen.getByRole("dialog", { name: "visits.form.title" });
    await within(dialog).findByLabelText("visits.form.dateFrom", { exact: false });

    await user.click(
      within(dialog).getByRole("button", { name: "visits.form.closeComposer" }),
    );

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "visits.form.openComposer" }),
      ).toHaveFocus(),
    );
  });
});

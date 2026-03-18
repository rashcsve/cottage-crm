import { StatusBadgeTone } from "../ui/StatusBadge";
import { VisitStatus } from "./types";

export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayOnly() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function getVisitStatus(dateFrom: string, dateTo: string): VisitStatus {
  const todayOnly = getTodayOnly();
  const fromOnly = parseDateOnly(dateFrom);
  const toOnly = parseDateOnly(dateTo);

  if (toOnly < todayOnly) return "past";
  if (fromOnly > todayOnly) return "upcoming";

  return "current";
}

export const VISIT_STATUS_META: Record<
  VisitStatus,
  { label: string; tone: StatusBadgeTone }
> = {
  past: { label: "Proběhlo", tone: "neutral" },
  upcoming: { label: "Plánováno", tone: "warning" },
  current: { label: "Právě probíhá", tone: "success" },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("cs-CZ");

export function formatDateRange(dateFrom: string, dateTo: string) {
  const from = DATE_FORMATTER.format(parseDateOnly(dateFrom));
  const to = DATE_FORMATTER.format(parseDateOnly(dateTo));

  return from === to ? from : `${from} - ${to}`;
}

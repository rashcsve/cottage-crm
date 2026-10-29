import type { DueDateChoice } from "@/features/tasks/types/tasks";
import {
  addDaysUtc,
  formatDateOnlyUtc,
  parseDateOnlyUtc,
} from "@/lib/utils/date";

const SATURDAY = 6;
const SUNDAY = 0;

function addDaysIso(todayIso: string, amount: number): string {
  return formatDateOnlyUtc(addDaysUtc(parseDateOnlyUtc(todayIso), amount));
}

function getWeekendIso(todayIso: string): string {
  const weekday = parseDateOnlyUtc(todayIso).getUTCDay();

  if (weekday === SATURDAY || weekday === SUNDAY) {
    return todayIso;
  }

  return addDaysIso(todayIso, SATURDAY - weekday);
}

export function resolveDueDateChoice(
  choice: DueDateChoice,
  todayIso: string,
  pickedDate: string,
): string {
  switch (choice) {
    case "today":
      return todayIso;
    case "tomorrow":
      return addDaysIso(todayIso, 1);
    case "weekend":
      return getWeekendIso(todayIso);
    case "pick":
      return pickedDate;
    case "none":
      return "";
    default: {
      const exhaustive: never = choice;
      return exhaustive;
    }
  }
}

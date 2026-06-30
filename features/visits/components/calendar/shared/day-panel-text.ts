import type { useTranslations } from "next-intl";

type CalendarTranslations = ReturnType<
  typeof useTranslations<"visits.calendar">
>;

export function getSelectedDayHint(params: {
  isDraftMode: boolean;
  canManageVisits: boolean;
  t: CalendarTranslations;
}) {
  const { isDraftMode, canManageVisits, t } = params;

  if (isDraftMode) {
    return t("selectedDayHintEditing");
  }

  if (canManageVisits) {
    return t("selectedDayHint");
  }

  return t("selectedDayHintReadOnly");
}

export function getEmptyStateDescription(params: {
  isDraftMode: boolean;
  canManageVisits: boolean;
  t: CalendarTranslations;
}) {
  const { isDraftMode, canManageVisits, t } = params;

  if (isDraftMode) {
    return t("noVisitsDescriptionEditing");
  }

  if (canManageVisits) {
    return t("noVisitsDescription");
  }

  return t("noVisitsDescriptionReadOnly");
}

export function getNoDateDescription(params: {
  isDraftMode: boolean;
  t: CalendarTranslations;
}) {
  const { isDraftMode, t } = params;

  if (isDraftMode) {
    return t("selectedDayHintEditing");
  }

  return t("chooseDayDescription");
}

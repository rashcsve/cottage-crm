import type { useTranslations } from "next-intl";

type CalendarTranslations = ReturnType<
  typeof useTranslations<"visits.calendar">
>;

export function getSelectedDayHint(params: {
  isComposerOpen: boolean;
  canManageVisits: boolean;
  t: CalendarTranslations;
}) {
  const { isComposerOpen, canManageVisits, t } = params;

  if (isComposerOpen) {
    return t("selectedDayHintEditing");
  }

  if (canManageVisits) {
    return t("selectedDayHint");
  }

  return t("selectedDayHintReadOnly");
}

export function getEmptyStateDescription(params: {
  isComposerOpen: boolean;
  canManageVisits: boolean;
  t: CalendarTranslations;
}) {
  const { isComposerOpen, canManageVisits, t } = params;

  if (isComposerOpen) {
    return t("noVisitsDescriptionEditing");
  }

  if (canManageVisits) {
    return t("noVisitsDescription");
  }

  return t("noVisitsDescriptionReadOnly");
}

export function getNoDateDescription(params: {
  isComposerOpen: boolean;
  t: CalendarTranslations;
}) {
  const { isComposerOpen, t } = params;

  if (isComposerOpen) {
    return t("selectedDayHintEditing");
  }

  return t("chooseDayDescription");
}

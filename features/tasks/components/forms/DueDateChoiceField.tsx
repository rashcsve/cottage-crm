"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { DueDateChoice } from "@/features/tasks/types/tasks";

interface DueDateChoiceFieldProps {
  value: DueDateChoice;
  onChange: (choice: DueDateChoice) => void;
  disabled?: boolean;
  pickDateField: ReactNode;
}

const DUE_DATE_CHOICES: DueDateChoice[] = [
  "today",
  "tomorrow",
  "weekend",
  "pick",
  "none",
];

const OPTION_CLASS =
  "flex min-h-11 cursor-pointer items-center gap-2 rounded-control border border-border bg-surface px-3 py-2 text-sm font-normal text-ink-primary transition-colors has-checked:border-accent has-checked:bg-muted has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent has-disabled:cursor-not-allowed";

export function DueDateChoiceField({
  value,
  onChange,
  disabled,
  pickDateField,
}: DueDateChoiceFieldProps) {
  const t = useTranslations("tasks.form");

  return (
    <fieldset className="space-y-3">
      <legend className="mb-2 block text-sm font-semibold text-ink-primary">
        {t("fields.dueDateChoice")}
      </legend>

      <div className="flex flex-wrap gap-2">
        {DUE_DATE_CHOICES.map((choice) => (
          <label key={choice} className={OPTION_CLASS}>
            <input
              type="radio"
              name="dueDateChoice"
              value={choice}
              checked={value === choice}
              disabled={disabled}
              onChange={() => onChange(choice)}
              className="size-4 shrink-0 accent-accent focus-visible:outline-0"
            />
            {t(`dueChoices.${choice}`)}
          </label>
        ))}
      </div>

      {value === "pick" ? pickDateField : null}
    </fieldset>
  );
}

"use client";

import { useId } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { getCoupleColorClasses, type Couple } from "../../domain/couples";

interface CouplePickerProps {
  legend: string;
  couples: Couple[];
  error?: string;
  disabled?: boolean;
  registration: Omit<UseFormRegisterReturn<"couple">, "onBlur">;
}

export function CouplePicker({
  legend,
  couples,
  error,
  disabled,
  registration,
}: CouplePickerProps) {
  const errorId = `${useId()}-couple-error`;

  return (
    <fieldset role="radiogroup" aria-invalid={error ? true : undefined}>
      <legend className="mb-2 block text-sm font-semibold text-ink-primary">
        {legend}
        <span className="ml-1 text-danger" aria-hidden="true">
          *
        </span>
      </legend>

      <div className="grid gap-2 sm:grid-cols-2">
        {couples.map((couple) => {
          const colors = getCoupleColorClasses(couple.id);

          return (
            <label
              key={couple.id}
              className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-control border-control px-3 py-2 text-sm font-medium text-ink-primary has-checked:border-ink-primary ${colors.checkedFill} has-disabled:cursor-not-allowed ${error ? "border-danger" : "border-border"}`}
            >
              <input
                type="radio"
                value={couple.id}
                disabled={disabled}
                required
                aria-describedby={error ? errorId : undefined}
                className="size-4 shrink-0 accent-ink-primary"
                {...registration}
              />
              <span
                aria-hidden="true"
                className={`size-3 shrink-0 rounded-full ${colors.swatch}`}
              />
              <span>{couple.label}</span>
            </label>
          );
        })}
      </div>

      <FieldError id={errorId} message={error} />
    </fieldset>
  );
}

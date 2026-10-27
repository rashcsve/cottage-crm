"use client";

import { useState, type SubmitEvent } from "react";
import type {
  FieldValues,
  Path,
  SubmitErrorHandler,
  UseFormReturn,
} from "react-hook-form";
import type { ActionResult } from "@/lib/types/actions.types";
import { applyFieldErrors } from "@/shared/ui/Form/applyFieldErrors";

export interface QuickAddAnnouncement {
  id: number;
  text: string;
}

interface UseQuickAddSubmitOptions<TInput extends FieldValues, TOutput> {
  form: UseFormReturn<TInput, undefined, TOutput>;
  fields: readonly [Path<TInput>, ...Path<TInput>[]];
  defaultValues: TInput;
  action: (data: TOutput) => Promise<ActionResult<unknown>>;
  getSuccessMessage: (data: TOutput) => string;
  fallbackError: string;
  onFieldError?: (field: Path<TInput>) => void;
  onInvalid?: SubmitErrorHandler<TInput>;
}

interface UseQuickAddSubmitResult {
  handleFormSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  announcement: QuickAddAnnouncement;
}

export function useQuickAddSubmit<TInput extends FieldValues, TOutput>({
  form,
  fields,
  defaultValues,
  action,
  getSuccessMessage,
  fallbackError,
  onFieldError,
  onInvalid,
}: UseQuickAddSubmitOptions<TInput, TOutput>): UseQuickAddSubmitResult {
  const [announcement, setAnnouncement] = useState<QuickAddAnnouncement>({
    id: 0,
    text: "",
  });
  const {
    handleSubmit,
    clearErrors,
    setError,
    reset,
    setFocus,
    formState: { isSubmitting },
  } = form;
  const [firstField] = fields;

  async function onSubmit(data: TOutput) {
    clearErrors("root");

    try {
      const result = await action(data);

      if (result.ok) {
        setAnnouncement((previous) => ({
          id: previous.id + 1,
          text: getSuccessMessage(data),
        }));
        reset(defaultValues, { keepFieldsRef: true });
        setFocus(firstField);
        return;
      }

      const firstInvalidField = applyFieldErrors(
        fields,
        result.fieldErrors,
        (name, message) => setError(name, { type: "server", message }),
      );

      if (!firstInvalidField) {
        setError("root", {
          type: "server",
          message: result.error ?? fallbackError,
        });
        setFocus(firstField);
        return;
      }

      onFieldError?.(firstInvalidField);
      setFocus(firstInvalidField);
    } catch {
      setError("root", {
        type: "server",
        message: fallbackError,
      });
      setFocus(firstField);
    }
  }

  function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    void handleSubmit(onSubmit, onInvalid)(event);
  }

  return { handleFormSubmit, announcement };
}

"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  CreateTaskFormData,
  CreateTaskFormInput,
  createTaskSchema,
} from "@/features/tasks/schemas";
import { addTaskAction } from "@/features/tasks/server/actions";
import { getCreateTaskSchemaMessages } from "@/features/tasks/utils/get-create-task-schema-messages";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { formatTaskDueDate } from "@/features/tasks/shared/formatTaskDate";

const NEW_TASK_FORM_ID = "new-task-form";
const NEW_TASK_FORM_TITLE_ID = "new-task-form-title";
const TITLE_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 1000;

const FORM_FIELDS = ["title", "description", "dueDate"] as const;

type FormFieldName = (typeof FORM_FIELDS)[number];

const defaultValues: CreateTaskFormInput = {
  title: "",
  description: "",
  dueDate: undefined,
};

interface NewTaskFormProps {
  onClose: () => void;
}

export function NewTaskForm({ onClose }: NewTaskFormProps) {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("tasks.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const schema = useMemo(() => {
    return createTaskSchema(getCreateTaskSchemaMessages(t));
  }, [t]);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setFocus,
  } = useForm<CreateTaskFormInput, undefined, CreateTaskFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  const selectedDueDate = useWatch({
    control,
    name: "dueDate",
  });
  const titleValue = useWatch({
    control,
    name: "title",
  }) ?? "";
  const descriptionValue = useWatch({
    control,
    name: "description",
  }) ?? "";
  const selectedDueDateValue =
    typeof selectedDueDate === "string" ? selectedDueDate : undefined;
  const selectedDueDateLabel = selectedDueDateValue
    ? formatTaskDueDate(selectedDueDateValue, locale)
    : null;

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setFocus("title");
    });

    return () => cancelAnimationFrame(frameId);
  }, [setFocus]);

  function handleCloseComposer() {
    clearErrors();
    reset(defaultValues);
    onClose();
  }

  function applyFieldErrors(
    fieldErrors?: Partial<Record<FormFieldName, string | undefined>>,
  ) {
    let firstInvalidField: FormFieldName | null = null;

    for (const fieldName of FORM_FIELDS) {
      const message = fieldErrors?.[fieldName];

      if (!message) {
        continue;
      }

      setError(fieldName, {
        type: "server",
        message,
      });

      if (!firstInvalidField) {
        firstInvalidField = fieldName;
      }
    }

    return firstInvalidField;
  }

  async function onSubmit(data: CreateTaskFormData) {
    clearErrors("root");

    try {
      const result = await addTaskAction(data);

      if (result.ok) {
        const nextHref = result.data?.id
          ? `/tasks?filter=open#task-${result.data.id}`
          : "/tasks?filter=open";

        showSuccessToast(result.message ?? t("success"));
        reset(defaultValues);
        onClose();
        router.refresh();
        router.replace(nextHref);
        return;
      }

      const errorMessage = result.error ?? t("error");
      const firstInvalidField = applyFieldErrors(result.fieldErrors);

      setError("root", {
        type: "server",
        message: errorMessage,
      });

      if (firstInvalidField) {
        requestAnimationFrame(() => {
          setFocus(firstInvalidField);
        });
      }

      showErrorToast(errorMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");

      setError("root", {
        type: "server",
        message,
      });
      showErrorToast(message);
    }
  }

  return (
    <section
      id={NEW_TASK_FORM_ID}
      aria-labelledby={NEW_TASK_FORM_TITLE_ID}
      aria-busy={isSubmitting}
      className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id={NEW_TASK_FORM_TITLE_ID}
              className="text-base font-semibold text-stone-900"
            >
              {t("title")}
            </h2>
            <p className="max-w-2xl text-sm text-stone-600">
              {t("supportingCopy")}
            </p>

            {selectedDueDateLabel ? (
              <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
                <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
                  {t("selectedDueDate")}
                </span>
                <span className="font-medium text-stone-900">
                  {selectedDueDateLabel}
                </span>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleCloseComposer}
            className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>{t("closeComposer")}</span>
          </button>
        </div>

        {errors.root?.message ? (
          <FormMessage type="error" message={errors.root.message} />
        ) : null}

        <FieldGroup className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <FieldLabel htmlFor="title">{t("fields.taskName")}</FieldLabel>
              <input
                id="title"
                type="text"
                placeholder={t("fields.taskNamePlaceholder")}
                disabled={isSubmitting}
                maxLength={TITLE_MAX_LENGTH}
                aria-invalid={!!errors.title}
                aria-describedby={errors.title ? "title-error" : undefined}
                className={`${formInputClass(!!errors.title)} h-11`}
                {...register("title")}
              />

              <div className="flex items-start justify-between gap-3">
                <FieldError id="title-error" message={errors.title?.message} />

                <p className="mt-1 shrink-0 text-xs text-stone-500">
                  {titleValue.length} / {TITLE_MAX_LENGTH}
                </p>
              </div>
            </div>

            <div>
              <FieldLabel htmlFor="dueDate">{t("fields.dueDate")}</FieldLabel>
              <input
                id="dueDate"
                type="date"
                disabled={isSubmitting}
                aria-invalid={!!errors.dueDate}
                aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
                className={`${formInputClass(!!errors.dueDate)} h-11`}
                {...register("dueDate")}
              />
              <FieldError
                id="dueDate-error"
                message={errors.dueDate?.message}
              />
            </div>
          </div>

          <div>
            <FieldLabel htmlFor="description">
              {t("fields.description")}
            </FieldLabel>
            <textarea
              id="description"
              rows={3}
              maxLength={DESCRIPTION_MAX_LENGTH}
              placeholder={t("fields.descriptionPlaceholder")}
              disabled={isSubmitting}
              aria-invalid={!!errors.description}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              className={`${formInputClass(!!errors.description)} min-h-24 resize-y`}
              {...register("description")}
            />

            <div className="flex items-start justify-between gap-3">
              <FieldError
                id="description-error"
                message={errors.description?.message}
              />

              <p className="mt-1 shrink-0 text-xs text-stone-500">
                {descriptionValue.length} / {DESCRIPTION_MAX_LENGTH}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-stone-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500">
              {t("submitHint")}
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}

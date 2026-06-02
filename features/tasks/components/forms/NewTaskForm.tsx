"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import {
  CreateTaskFormData,
  CreateTaskFormInput,
  createTaskSchema,
} from "@/features/tasks/schemas";
import { addTaskAction } from "@/features/tasks/server/actions";
import { getCreateTaskSchemaMessages } from "@/features/tasks/schemas/get-create-task-schema-messages";
import { useRouter } from "@/i18n/navigation";
import { useAutoFocus } from "@/shared/hooks/useAutoFocus";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/Toast/useToast";
import {
  TextAreaField,
  TextField,
} from "@/shared/ui/Form/Field";
import {
  FormComposer,
  FormSubmitBar,
} from "@/shared/ui/Form/FormComposer";
import { FormMessage } from "@/shared/ui/FormMessage";
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
  const { success: showSuccessToast } = useToast();

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

  useAutoFocus(setFocus, "title");

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
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");

      setError("root", {
        type: "server",
        message,
      });
    }
  }

  return (
    <FormComposer
      id={NEW_TASK_FORM_ID}
      titleId={NEW_TASK_FORM_TITLE_ID}
      title={t("title")}
      description={t("supportingCopy")}
      closeLabel={t("closeComposer")}
      closeAriaControls={NEW_TASK_FORM_ID}
      closeAriaExpanded
      onClose={handleCloseComposer}
      isBusy={isSubmitting}
      headerContent={
        selectedDueDateLabel ? (
          <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-sm text-stone-700">
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-500">
              {t("selectedDueDate")}
            </span>
            <span className="font-medium text-stone-900">
              {selectedDueDateLabel}
            </span>
          </div>
        ) : null
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root?.message ? (
          <FormMessage type="error" message={errors.root.message} />
        ) : null}

        <FieldGroup className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
            <TextField
              id="title"
              type="text"
              placeholder={t("fields.taskNamePlaceholder")}
              disabled={isSubmitting}
              required
              maxLength={TITLE_MAX_LENGTH}
              label={t("fields.taskName")}
              error={errors.title?.message}
              className="h-11"
              footer={
                <p className="text-xs text-stone-500">
                  {t("characterCount", { count: titleValue.length, max: TITLE_MAX_LENGTH })}
                </p>
              }
              {...register("title")}
            />

            <TextField
              id="dueDate"
              type="date"
              disabled={isSubmitting}
              label={t("fields.dueDate")}
              error={errors.dueDate?.message}
              className="h-11"
              {...register("dueDate")}
            />
          </div>

          <TextAreaField
            id="description"
            rows={3}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder={t("fields.descriptionPlaceholder")}
            disabled={isSubmitting}
            label={t("fields.description")}
            error={errors.description?.message}
            className="min-h-24 resize-y"
            footer={
              <p className="text-xs text-stone-500">
                {t("characterCount", { count: descriptionValue.length, max: DESCRIPTION_MAX_LENGTH })}
              </p>
            }
            {...register("description")}
          />

          <FormSubmitBar hint={t("submitHint")} className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </FormSubmitBar>
        </FieldGroup>
      </form>
    </FormComposer>
  );
}

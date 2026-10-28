"use client";

import { useMemo, useState } from "react";
import { flushSync } from "react-dom";
import { useForm, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  createTaskSchema,
  type CreateTaskFormData,
  type CreateTaskFormInput,
} from "@/features/tasks/schemas";
import { getCreateTaskSchemaMessages } from "@/features/tasks/schemas/get-create-task-schema-messages";
import { addTaskAction } from "@/features/tasks/server/actions";
import { useQuickAddSubmit } from "@/shared/hooks/useQuickAddSubmit";
import { TextAreaField, TextField } from "@/shared/ui/Form/Field";
import { PendingSubmitButton } from "@/shared/ui/Form/PendingSubmitButton";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";
import { FormMessage } from "@/shared/ui/FormMessage";

const TITLE_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 1000;
const DETAILS_ID = "task-quick-add-details";
const FORM_FIELDS = ["title", "description", "dueDate"] as const;

const defaultValues: CreateTaskFormInput = {
  title: "",
  description: "",
  dueDate: undefined,
};

export function TaskQuickAdd() {
  const t = useTranslations("tasks.quickAdd");
  const tForm = useTranslations("tasks.form");
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const schema = useMemo(() => {
    return createTaskSchema(getCreateTaskSchemaMessages(tForm));
  }, [tForm]);

  const form = useForm<CreateTaskFormInput, undefined, CreateTaskFormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues,
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const { handleFormSubmit, announcement } = useQuickAddSubmit({
    form,
    fields: FORM_FIELDS,
    defaultValues,
    action: addTaskAction,
    getSuccessMessage: (data) => t("added", { title: data.title }),
    fallbackError: tForm("error"),
    onFieldError: (field) => {
      if (field !== "title") {
        flushSync(() => setIsDetailsOpen(true));
      }
    },
    onInvalid: (invalidFields: FieldErrors<CreateTaskFormInput>) => {
      if (invalidFields.description || invalidFields.dueDate) {
        flushSync(() => setIsDetailsOpen(true));
      }
    },
  });

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <QuickAddAnnouncer announcement={announcement} />

      {errors.root?.message ? (
        <FormMessage type="error" message={errors.root.message} />
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        <TextField
          id="task-quick-add-title"
          type="text"
          enterKeyHint="enter"
          autoComplete="off"
          placeholder={t("placeholder")}
          required
          maxLength={TITLE_MAX_LENGTH}
          label={t("label")}
          error={errors.title?.message}
          className="col-start-1 h-11"
          fieldClassName="contents"
          {...register("title")}
        />

        <PendingSubmitButton
          isPending={isSubmitting}
          label={t("submit")}
          pendingLabel={tForm("submitting")}
          className="col-start-2 row-start-2"
        />
      </div>

      <button
        type="button"
        aria-expanded={isDetailsOpen}
        aria-controls={DETAILS_ID}
        onClick={() => setIsDetailsOpen((open) => !open)}
        className="inline-flex min-h-11 items-center gap-1 rounded-control text-sm font-semibold text-ink-primary"
      >
        <ChevronDown
          aria-hidden="true"
          className={`size-4 ${isDetailsOpen ? "rotate-180" : ""} motion-safe:transition-transform`.trim()}
        />
        {isDetailsOpen ? t("hideDetails") : t("showDetails")}
      </button>

      <div id={DETAILS_ID} hidden={!isDetailsOpen}>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <TextAreaField
            id="task-quick-add-description"
            rows={3}
            maxLength={DESCRIPTION_MAX_LENGTH}
            placeholder={tForm("fields.descriptionPlaceholder")}
            label={tForm("fields.description")}
            error={errors.description?.message}
            className="min-h-24 resize-y"
            {...register("description")}
          />

          <TextField
            id="task-quick-add-due-date"
            type="date"
            label={tForm("fields.dueDate")}
            error={errors.dueDate?.message}
            className="h-11"
            {...register("dueDate")}
          />
        </div>
      </div>
    </form>
  );
}

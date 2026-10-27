"use client";

import { useMemo, useState, type SubmitEvent } from "react";
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
import { TextAreaField, TextField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { applyFieldErrors } from "@/shared/ui/Form/applyFieldErrors";
import { Button } from "@/shared/ui/Button";

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
  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const schema = useMemo(() => {
    return createTaskSchema(getCreateTaskSchemaMessages(tForm));
  }, [tForm]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
    setFocus,
  } = useForm<CreateTaskFormInput, undefined, CreateTaskFormData>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues,
  });

  async function onSubmit(data: CreateTaskFormData) {
    clearErrors("root");

    try {
      const result = await addTaskAction(data);

      if (result.ok) {
        setAnnouncement((previous) => ({
          id: previous.id + 1,
          text: t("added", { title: data.title }),
        }));
        reset(defaultValues, { keepFieldsRef: true });
        setFocus("title");
        return;
      }

      const firstInvalidField = applyFieldErrors(
        FORM_FIELDS,
        result.fieldErrors,
        (name, message) => setError(name, { type: "server", message }),
      );

      if (!firstInvalidField) {
        setError("root", {
          type: "server",
          message: result.error ?? tForm("error"),
        });
        setFocus("title");
        return;
      }

      if (firstInvalidField !== "title") {
        flushSync(() => setIsDetailsOpen(true));
      }

      setFocus(firstInvalidField);
    } catch {
      setError("root", {
        type: "server",
        message: tForm("error"),
      });
      setFocus("title");
    }
  }

  function onInvalid(invalidFields: FieldErrors<CreateTaskFormInput>) {
    if (invalidFields.description || invalidFields.dueDate) {
      flushSync(() => setIsDetailsOpen(true));
    }
  }

  function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    void handleSubmit(onSubmit, onInvalid)(event);
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3">
      <span className="sr-only" role="status">
        <span key={announcement.id}>{announcement.text}</span>
      </span>

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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="col-start-2 row-start-2"
        >
          <span className="grid">
            <span
              aria-hidden={isSubmitting || undefined}
              className={`col-start-1 row-start-1 ${isSubmitting ? "invisible" : ""}`.trim()}
            >
              {t("submit")}
            </span>
            <span
              aria-hidden={!isSubmitting || undefined}
              className={`col-start-1 row-start-1 ${isSubmitting ? "" : "invisible"}`.trim()}
            >
              {tForm("submitting")}
            </span>
          </span>
        </Button>
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

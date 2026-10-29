"use client";

import { useMemo, useState, type SubmitEvent } from "react";
import { flushSync } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { DueDateChoiceField } from "@/features/tasks/components/forms/DueDateChoiceField";
import { resolveDueDateChoice } from "@/features/tasks/domain/due-date-choice";
import {
  createTaskSchema,
  type CreateTaskFormData,
  type CreateTaskFormInput,
} from "@/features/tasks/schemas";
import { getCreateTaskSchemaMessages } from "@/features/tasks/schemas/get-create-task-schema-messages";
import { addTaskAction } from "@/features/tasks/server/actions";
import type { DueDateChoice } from "@/features/tasks/types/tasks";
import { useAutoFocus } from "@/shared/hooks/useAutoFocus";
import { AddItemPanelFooter } from "@/shared/ui/AddItemPanel";
import { Button } from "@/shared/ui/Button";
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { applyFieldErrors } from "@/shared/ui/Form/applyFieldErrors";
import { TextAreaField, TextField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";

const FORM_ID = "task-add-sheet-form";
const TITLE_MAX_LENGTH = 255;
const DESCRIPTION_MAX_LENGTH = 1000;
const FORM_FIELDS = ["title", "description", "dueDate"] as const;

const defaultValues: CreateTaskFormInput = {
  title: "",
  description: "",
  dueDate: undefined,
};

interface TaskAddSheetFormProps {
  todayIso: string;
  onAdded: (title: string) => void;
}

export function TaskAddSheetForm({ todayIso, onAdded }: TaskAddSheetFormProps) {
  const t = useTranslations("tasks.form");
  const [dueDateChoice, setDueDateChoice] = useState<DueDateChoice>("none");

  const schema = useMemo(() => {
    return createTaskSchema(getCreateTaskSchemaMessages(t));
  }, [t]);

  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = useForm<CreateTaskFormInput, undefined, CreateTaskFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  useAutoFocus(setFocus, "title");

  function handleDueDateChoiceChange(choice: DueDateChoice) {
    flushSync(() => setDueDateChoice(choice));

    if (choice === "pick") {
      setFocus("dueDate");
      return;
    }

    resetField("dueDate");
  }

  async function onSubmit(data: CreateTaskFormData) {
    clearErrors("root");

    try {
      const result = await addTaskAction({
        ...data,
        dueDate: resolveDueDateChoice(dueDateChoice, todayIso, data.dueDate ?? ""),
      });

      if (result.ok) {
        onAdded(data.title);
        return;
      }

      const firstInvalidField = applyFieldErrors(
        FORM_FIELDS,
        result.fieldErrors,
        (name, message) => setError(name, { type: "server", message }),
      );

      if (
        !firstInvalidField ||
        (firstInvalidField === "dueDate" && dueDateChoice !== "pick")
      ) {
        setError("root", {
          type: "server",
          message: result.error ?? t("error"),
        });
        return;
      }

      setFocus(firstInvalidField);
    } catch {
      setError("root", { type: "server", message: t("error") });
    }
  }

  function handleFormSubmit(event: SubmitEvent<HTMLFormElement>) {
    if (isSubmitting) {
      event.preventDefault();
      return;
    }

    void handleSubmit(onSubmit)(event);
  }

  return (
    <form
      id={FORM_ID}
      onSubmit={handleFormSubmit}
      noValidate
      aria-busy={isSubmitting}
      className="space-y-4"
    >
      {errors.root?.message ? (
        <FormMessage type="error" message={errors.root.message} />
      ) : null}

      <FieldGroup>
        <TextField
          id="task-add-title"
          type="text"
          autoComplete="off"
          enterKeyHint="done"
          required
          maxLength={TITLE_MAX_LENGTH}
          label={t("fields.title")}
          error={errors.title?.message}
          {...register("title")}
        />

        <DueDateChoiceField
          value={dueDateChoice}
          onChange={handleDueDateChoiceChange}
          disabled={isSubmitting}
          pickDateField={
            <TextField
              id="task-add-due-date"
              type="date"
              label={t("fields.pickDate")}
              error={errors.dueDate?.message}
              {...register("dueDate")}
            />
          }
        />

        <TextAreaField
          id="task-add-description"
          rows={3}
          maxLength={DESCRIPTION_MAX_LENGTH}
          placeholder={t("fields.descriptionPlaceholder")}
          label={t("fields.description")}
          error={errors.description?.message}
          className="min-h-24 resize-y"
          {...register("description")}
        />

        <AddItemPanelFooter>
          <Button
            type="submit"
            form={FORM_ID}
            disabled={isSubmitting}
            className="w-full whitespace-nowrap sm:w-auto"
          >
            {isSubmitting ? t("submitting") : t("submitSheet")}
          </Button>
        </AddItemPanelFooter>
      </FieldGroup>
    </form>
  );
}

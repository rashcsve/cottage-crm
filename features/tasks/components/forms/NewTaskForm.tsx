"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
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

const NEW_TASK_FORM_ID = "new-task-form";
const NEW_TASK_FORM_HASH = `#${NEW_TASK_FORM_ID}`;
const NEW_TASK_FORM_TITLE_ID = "new-task-form-title";

const FORM_FIELDS = ["title", "description", "dueDate"] as const;

type FormFieldName = (typeof FORM_FIELDS)[number];

const defaultValues: CreateTaskFormInput = {
  title: "",
  description: "",
  dueDate: undefined,
};

function subscribeToHashChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("hashchange", onStoreChange);

  return () => {
    window.removeEventListener("hashchange", onStoreChange);
  };
}

function getHashSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.hash;
}

function getServerHashSnapshot() {
  return "";
}

function clearUrlHash() {
  if (typeof window === "undefined") {
    return;
  }

  const nextUrl = `${window.location.pathname}${window.location.search}`;
  window.history.replaceState(null, "", nextUrl);
}

export function NewTaskForm() {
  const router = useRouter();
  const t = useTranslations("tasks.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const requestedHash = useSyncExternalStore(
    subscribeToHashChange,
    getHashSnapshot,
    getServerHashSnapshot
  );

  const isHashExpanded = requestedHash === NEW_TASK_FORM_HASH;
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(false);
  const isExpanded = isManuallyExpanded || isHashExpanded;

  const schema = useMemo(() => {
    return createTaskSchema(getCreateTaskSchemaMessages(t));
  }, [t]);

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
    mode: "onBlur",
    defaultValues,
  });

  function openComposer() {
    clearErrors();
    setIsManuallyExpanded(true);

    requestAnimationFrame(() => {
      setFocus("title");
    });
  }

  function closeComposer() {
    clearErrors();
    reset();
    setIsManuallyExpanded(false);

    if (isHashExpanded) {
      clearUrlHash();
    }
  }

  function applyFieldErrors(
    fieldErrors?: Partial<Record<FormFieldName, string | undefined>>
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
        reset();
        setIsManuallyExpanded(false);
        router.refresh();
        router.replace(nextHref);
        return;
      }

      const errorMessage = result.error ?? t("error");
      const firstInvalidField = applyFieldErrors(result.fieldErrors);

      setIsManuallyExpanded(true);
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

      setIsManuallyExpanded(true);
      setError("root", {
        type: "server",
        message,
      });
      showErrorToast(message);
    }
  }

  if (!isExpanded) {
    return (
      <div className="flex justify-start sm:justify-end">
        <button
          type="button"
          aria-expanded={false}
          aria-controls={NEW_TASK_FORM_ID}
          onClick={openComposer}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-4 text-sm font-medium text-stone-700 transition hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("openComposer")}
        </button>
      </div>
    );
  }

  return (
    <section
      id={NEW_TASK_FORM_ID}
      aria-labelledby={NEW_TASK_FORM_TITLE_ID}
      className="rounded-2xl border border-stone-200 bg-stone-50 p-4"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id={NEW_TASK_FORM_TITLE_ID}
              className="text-sm font-semibold text-stone-900"
            >
              {t("title")}
            </h2>
            <p className="max-w-2xl text-sm text-stone-600">
              {t("supportingCopy")}
            </p>
          </div>

          <button
            type="button"
            aria-expanded={true}
            aria-controls={NEW_TASK_FORM_ID}
            onClick={closeComposer}
            className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-white hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            {t("closeComposer")}
          </button>
        </div>

        {errors.root?.message && (
          <FormMessage type="error" message={errors.root.message} />
        )}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <div>
            <FieldLabel htmlFor="title">{t("fields.taskName")}</FieldLabel>
            <input
              id="title"
              type="text"
              placeholder={t("fields.taskNamePlaceholder")}
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={`${formInputClass(!!errors.title)} h-11`}
              {...register("title")}
            />
            <FieldError id="title-error" message={errors.title?.message} />
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
            <FieldError id="dueDate-error" message={errors.dueDate?.message} />
          </div>
        </div>

        <div>
          <FieldLabel htmlFor="description">
            {t("fields.description")}
          </FieldLabel>
          <textarea
            id="description"
            rows={2}
            placeholder={t("fields.descriptionPlaceholder")}
            disabled={isSubmitting}
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "description-error" : undefined
            }
            className={formInputClass(!!errors.description)}
            {...register("description")}
          />
          <FieldError
            id="description-error"
            message={errors.description?.message}
          />
        </div>

        <div className="flex justify-end border-t border-stone-200 pt-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-stone-900 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </section>
  );
}

"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CreateTaskFormData,
  CreateTaskFormInput,
  CreateTaskSchema,
} from "@/features/tasks/schemas";
import { addTaskAction } from "@/features/tasks/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";

const defaultValues: CreateTaskFormInput = {
  title: "",
  description: "",
  priority: "medium",
  dueDate: undefined,
};

export function NewTaskForm() {
  const t = useTranslations("tasks.form");
  const tPriority = useTranslations("tasks.priority");
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const [, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateTaskFormInput, undefined, CreateTaskFormData>({
    resolver: zodResolver(CreateTaskSchema),
    mode: "onBlur",
    defaultValues,
  });

  async function onSubmit(data: CreateTaskFormData) {
    startTransition(async () => {
      try {
        const result = await addTaskAction(data);

        if (result.ok) {
          showSuccessToast(result.message || t("success"));
          reset();
          return;
        }

        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateTaskFormInput, { message });
          });
        }

        setError("root", { message: result.error });
        showErrorToast(result.error);
      } catch (error) {
        const message = error instanceof Error ? error.message : t("error");

        setError("root", { message });
        showErrorToast(message);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-2 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
      id="new-task-form"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          {t("eyebrow")}
        </p>
        <h2 className="text-lg font-semibold text-stone-900">{t("title")}</h2>
      </div>

      {errors.root?.message && (
        <FormMessage type="error" message={errors.root.message} />
      )}

      <div className="space-y-1">
        <label
          htmlFor="title"
          className="block text-sm font-medium text-stone-900"
        >
          {t("fields.taskName")}
        </label>
        <input
          id="title"
          type="text"
          placeholder={t("fields.taskNamePlaceholder")}
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={formInputClass(!!errors.title)}
          {...register("title")}
        />
        <FieldError id="title-error" message={errors.title?.message} />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="description"
          className="block text-sm font-medium text-stone-900"
        >
          {t("fields.description")}
        </label>
        <textarea
          id="description"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-stone-900"
          >
            {t("fields.priority")}
          </label>
          <select
            id="priority"
            disabled={isSubmitting}
            aria-invalid={!!errors.priority}
            className={formInputClass(!!errors.priority)}
            {...register("priority")}
          >
            <option value="low">{tPriority("low")}</option>
            <option value="medium">{tPriority("medium")}</option>
            <option value="high">{tPriority("high")}</option>
          </select>
          <FieldError id="priority-error" message={errors.priority?.message} />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-stone-900"
          >
            {t("fields.dueDate")}
          </label>
          <input
            id="dueDate"
            type="date"
            disabled={isSubmitting}
            aria-invalid={!!errors.dueDate}
            aria-describedby={errors.dueDate ? "dueDate-error" : undefined}
            className={formInputClass(!!errors.dueDate)}
            {...register("dueDate")}
          />
          <FieldError id="dueDate-error" message={errors.dueDate?.message} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

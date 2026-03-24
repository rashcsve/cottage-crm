"use client";

import { Field, Label, Description } from "@headlessui/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/lib/hooks/useToast";
import {
  CreateTaskFormData,
  CreateTaskFormInput,
  CreateTaskSchema,
} from "@/features/tasks/schemas";
import { addTaskAction } from "@/features/tasks/server/actions";
import { FormMessage } from "@/shared/ui/FormMessage";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { FieldError } from "@/shared/ui/Form/FieldError";

export function NewTaskForm() {
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<CreateTaskFormInput, undefined, CreateTaskFormData>({
    resolver: zodResolver(CreateTaskSchema),
    mode: "onBlur",
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    },
  });

  async function onSubmit(data: CreateTaskFormData) {
    try {
      const result = await addTaskAction(data);

      if (result.ok) {
        showSuccessToast("Úkol byl úspěšně vytvořen");
        reset();
        return;
      }

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateTaskFormData, { message });
        });
      }

      setError("root", { message: result.error });
      showErrorToast(result.error);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Neočekávaná chyba";
      setError("root", { message: errorMessage });
      showErrorToast(errorMessage);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-2 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
          Rychlé přidání
        </p>
        <h2 className="text-lg font-semibold text-stone-900">Nový úkol</h2>
      </div>

      {errors.root?.message && (
        <FormMessage type="error" message={errors.root.message} />
      )}

      <Field className="space-y-1">
        <Label htmlFor="title" className="text-sm font-medium text-stone-900">
          Název úkolu <span className="text-red-500">*</span>
        </Label>
        <input
          id="title"
          type="text"
          placeholder="Např. posekat trávu"
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          className={formInputClass(!!errors.title)}
          {...register("title")}
        />
        <FieldError id="title-error" message={errors.title?.message} />
      </Field>

      <Field className="space-y-1">
        <Label
          htmlFor="description"
          className="text-sm font-medium text-stone-900"
        >
          Popis
        </Label>
        <Description className="text-xs text-stone-500">
          Volitelně doplň detaily
        </Description>
        <textarea
          id="description"
          rows={3}
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
      </Field>

      <Field className="space-y-1">
        <Label
          htmlFor="priority"
          className="text-sm font-medium text-stone-900"
        >
          Priorita
        </Label>
        <select
          id="priority"
          disabled={isSubmitting}
          aria-invalid={!!errors.priority}
          aria-describedby={errors.priority ? "priority-error" : undefined}
          className={formInputClass(!!errors.priority)}
          {...register("priority")}
        >
          <option value="low">Nízká</option>
          <option value="medium">Střední</option>
          <option value="high">Vysoká</option>
        </select>
        <FieldError id="priority-error" message={errors.priority?.message} />
      </Field>

      <Field className="space-y-1">
        <Label htmlFor="dueDate" className="text-sm font-medium text-stone-900">
          Termín
        </Label>
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
      </Field>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full cursor-pointer rounded-2xl bg-stone-900 text-sm font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Přidávám..." : "Přidat úkol"}
      </button>
    </form>
  );
}

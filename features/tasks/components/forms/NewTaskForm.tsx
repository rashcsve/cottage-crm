"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/lib/hooks/useToast";
import {
  CreateTaskFormData,
  CreateTaskFormInput,
  CreateTaskSchema,
} from "../../schemas";
import { addTaskAction } from "../../server/actions";
import { FormMessage } from "@/shared/ui/FormMessage";
import { formInputClass, getErrorId } from "../../lib/formStyles";

interface NewTaskFormProps {
  onSuccess?: () => void;
}

export function NewTaskForm({ onSuccess }: NewTaskFormProps) {
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
      console.log(data);
      const result = await addTaskAction(data);
      console.log(result);

      if (!result.ok) {
        if (result.fieldErrors) {
          Object.entries(result.fieldErrors).forEach(([field, message]) => {
            setError(field as keyof CreateTaskFormInput, { message });
          });
        } else {
          setError("root", { message: result.error });
        }

        showErrorToast(result.error);
        return;
      }

      showSuccessToast("Task created successfully");
      reset();
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Network error"; //TODO
      setError("root", { message: errorMessage });
      showErrorToast(errorMessage);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-4 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm"
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

      <div>
        <label htmlFor="title" className="text-sm font-medium text-stone-800">
          Název úkolu <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          placeholder="Např. posekat trávu"
          disabled={isSubmitting}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? getErrorId("title") : undefined}
          className={formInputClass(!!errors.title)}
          {...register("title")}
        />
        {errors.title && (
          <p
            id={getErrorId("title")}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.title.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="text-sm font-medium text-stone-900"
        >
          Popis <span className="text-xs text-stone-400">(optional)</span>
        </label>
        <textarea
          id="description"
          placeholder="Volitelně doplň detaily"
          rows={3}
          disabled={isSubmitting}
          aria-invalid={!!errors.description}
          aria-describedby={
            errors.description ? getErrorId("description") : undefined
          }
          className={formInputClass(!!errors.description)}
          {...register("description")}
        />
        {errors.description && (
          <p
            id={getErrorId("description")}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.description.message}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="priority"
          className="text-sm font-medium text-stone-900"
        >
          Priorita
        </label>
        <select
          id="priority"
          disabled={isSubmitting}
          aria-invalid={!!errors.priority}
          aria-describedby={
            errors.priority ? getErrorId("priority") : undefined
          }
          className={formInputClass(!!errors.priority)}
          {...register("priority")}
        >
          <option value="low">Nízká</option>
          <option value="medium">Střední</option>
          <option value="high">Vysoká</option>
        </select>
        {errors.priority && (
          <p
            id={getErrorId("priority")}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.priority.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="dueDate" className="text-sm font-medium text-stone-900">
          Termín <span className="text-xs text-stone-400">(optional)</span>
        </label>
        <input
          id="dueDate"
          type="date"
          disabled={isSubmitting}
          aria-invalid={!!errors.dueDate}
          aria-describedby={errors.dueDate ? getErrorId("dueDate") : undefined}
          className={formInputClass(!!errors.dueDate)}
          {...register("dueDate")}
        />
        {errors.dueDate && (
          <p
            id={getErrorId("dueDate")}
            className="mt-1 text-sm text-red-600"
            role="alert"
          >
            {errors.dueDate.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-2xl bg-stone-900 text-sm cursor-pointer font-semibold text-white transition hover:bg-stone-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Přidávám..." : "Přidat úkol"}
      </button>
    </form>
  );
}

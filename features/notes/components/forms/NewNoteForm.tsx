"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  CreateNoteFormData,
  CreateNoteFormInput,
  createNoteSchema,
} from "@/features/notes/schemas";
import { getCreateNoteSchemaMessages } from "@/features/notes/utils/get-create-note-schema-messages";
import { addNoteAction } from "@/features/notes/server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { useRouter } from "@/i18n/navigation";

const defaultValues: CreateNoteFormInput = {
  content: "",
};

export function NewNoteForm() {
  const router = useRouter();
  const t = useTranslations("notes.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const schema = createNoteSchema(getCreateNoteSchemaMessages(t));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<CreateNoteFormInput, undefined, CreateNoteFormData>({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  async function onSubmit(data: CreateNoteFormData) {
    clearErrors("root");

    try {
      const result = await addNoteAction(data);

      if (result.ok) {
        showSuccessToast(result.message ?? t("success"));
        reset();
        router.refresh();
        return;
      }

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateNoteFormInput, { message });
        });
      }

      setError("root", { message: result.error });
      showErrorToast(result.error);
    } catch (error) {
      console.error("[NewNoteForm] Submit error:", error);
      const message = error instanceof Error ? error.message : t("error");
      setError("root", { message });
      showErrorToast(message);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-2 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm mb-8"
      id="new-note-form"
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
          htmlFor="content"
          className="block text-sm font-medium text-stone-900"
        >
          {t("fields.content")}
        </label>
        <textarea
          id="content"
          placeholder={t("fields.contentPlaceholder")}
          disabled={isSubmitting}
          rows={4}
          aria-invalid={!!errors.content}
          aria-describedby={errors.content ? "content-error" : undefined}
          className={formInputClass(!!errors.content)}
          {...register("content")}
        />
        <FieldError id="content-error" message={errors.content?.message} />
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

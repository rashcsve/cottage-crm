"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createShoppingItemSchema,
  type CreateShoppingItemFormInput,
  type CreateShoppingItemFormData,
} from "../../schemas";
import { getShoppingSchemaMessages } from "../../utils/get-shopping-schema-messages";
import { addShoppingItemAction } from "../../server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { FormSurface } from "@/shared/ui/FormSurface";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { useRouter } from "@/i18n/navigation";

const defaultValues: CreateShoppingItemFormInput = {
  title: "",
};

export function NewShoppingItemForm() {
  const router = useRouter();
  const t = useTranslations("shopping.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const schema = createShoppingItemSchema(getShoppingSchemaMessages(t));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    clearErrors,
  } = useForm<
    CreateShoppingItemFormInput,
    undefined,
    CreateShoppingItemFormData
  >({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  async function onSubmit(data: CreateShoppingItemFormData) {
    clearErrors("root");

    try {
      const result = await addShoppingItemAction(data);

      if (result.ok) {
        showSuccessToast(result.message ?? t("success"));
        reset();
        router.refresh();
        return;
      }

      if (result.fieldErrors) {
        Object.entries(result.fieldErrors).forEach(([field, message]) => {
          setError(field as keyof CreateShoppingItemFormInput, { message });
        });
      }

      setError("root", { message: result.error });
      showErrorToast(result.error);
    } catch (error) {
      console.error("[NewShoppingItemForm] Submit error:", error);
      const message = error instanceof Error ? error.message : t("error");
      setError("root", { message });
      showErrorToast(message);
    }
  }

  return (
    <FormSurface className="mb-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        id="new-shopping-item-form"
        className="space-y-4"
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

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 space-y-1">
            <FieldLabel htmlFor="title">{t("fields.title")}</FieldLabel>
            <input
              id="title"
              type="text"
              placeholder={t("fields.titlePlaceholder")}
              disabled={isSubmitting}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={formInputClass(!!errors.title)}
              {...register("title")}
            />
            <FieldError id="title-error" message={errors.title?.message} />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="self-end rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? t("submitting") : t("submit")}
          </button>
        </div>
      </form>
    </FormSurface>
  );
}

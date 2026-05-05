"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
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
import { FieldGroup } from "@/shared/ui/FieldGroup";
import { FieldError } from "@/shared/ui/Form/FieldError";
import { formInputClass } from "@/shared/ui/Form/formStyles";
import { FieldLabel } from "@/shared/ui/FieldLabel";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/shared/ui/Button";

const NEW_SHOPPING_FORM_ID = "new-shopping-item-form";
const NEW_SHOPPING_FORM_TITLE_ID = "new-shopping-item-form-title";
const TITLE_MAX_LENGTH = 100;
const FORM_FIELDS = ["title"] as const;

type FormFieldName = (typeof FORM_FIELDS)[number];

const defaultValues: CreateShoppingItemFormInput = {
  title: "",
};

interface NewShoppingItemFormProps {
  onClose: () => void;
}

export function NewShoppingItemForm({ onClose }: NewShoppingItemFormProps) {
  const router = useRouter();
  const t = useTranslations("shopping.form");
  const { error: showErrorToast, success: showSuccessToast } = useToast();

  const schema = useMemo(() => {
    return createShoppingItemSchema(getShoppingSchemaMessages(t));
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
  } = useForm<
    CreateShoppingItemFormInput,
    undefined,
    CreateShoppingItemFormData
  >({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues,
  });

  const titleValue = useWatch({
    control,
    name: "title",
  }) ?? "";

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setFocus("title");
    });

    return () => cancelAnimationFrame(frameId);
  }, [setFocus]);

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

  async function onSubmit(data: CreateShoppingItemFormData) {
    clearErrors("root");

    try {
      const result = await addShoppingItemAction(data);

      if (result.ok) {
        const nextHref = result.data?.id
          ? `/shopping?filter=pending#shopping-item-${result.data.id}`
          : "/shopping?filter=pending";

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

      showErrorToast(errorMessage);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");

      setError("root", {
        type: "server",
        message,
      });
      showErrorToast(message);
    }
  }

  return (
    <section
      id={NEW_SHOPPING_FORM_ID}
      aria-labelledby={NEW_SHOPPING_FORM_TITLE_ID}
      aria-busy={isSubmitting}
      className="rounded-3xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h2
              id={NEW_SHOPPING_FORM_TITLE_ID}
              className="text-base font-semibold text-stone-900"
            >
              {t("title")}
            </h2>
            <p className="max-w-2xl text-sm text-stone-600">
              {t("supportingCopy")}
            </p>
          </div>

          <button
            type="button"
            onClick={handleCloseComposer}
            className="inline-flex items-center gap-2 self-start rounded-xl px-2 py-1 text-sm font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-900 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            <span>{t("closeComposer")}</span>
          </button>
        </div>

        {errors.root?.message ? (
          <FormMessage type="error" message={errors.root.message} />
        ) : null}

        <FieldGroup className="space-y-3">
          <div>
            <FieldLabel htmlFor="title">{t("fields.title")}</FieldLabel>
            <input
              id="title"
              type="text"
              placeholder={t("fields.titlePlaceholder")}
              disabled={isSubmitting}
              maxLength={TITLE_MAX_LENGTH}
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
              className={`${formInputClass(!!errors.title)} h-11`}
              {...register("title")}
            />

            <div className="flex items-start justify-between gap-3">
              <FieldError id="title-error" message={errors.title?.message} />

              <p className="mt-1 shrink-0 text-xs text-stone-500">
                {t("characterCount", {
                  count: titleValue.length,
                  max: TITLE_MAX_LENGTH,
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-stone-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-stone-500">
              {t("submitHint")}
            </p>

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </div>
        </FieldGroup>
      </form>
    </section>
  );
}

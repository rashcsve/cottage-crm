"use client";

import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createShoppingItemSchema,
  type CreateShoppingItemFormInput,
  type CreateShoppingItemFormData,
} from "../../schemas";
import { getShoppingSchemaMessages } from "../../schemas/get-shopping-schema-messages";
import { addShoppingItemAction } from "../../server/actions";
import { useToast } from "@/shared/Toast/useToast";
import { TextField } from "@/shared/ui/Form/Field";
import {
  FormComposer,
  FormSubmitBar,
} from "@/shared/ui/Form/FormComposer";
import { FormMessage } from "@/shared/ui/FormMessage";
import { FieldGroup } from "@/shared/ui/FieldGroup";

import { useAutoFocus } from "@/shared/hooks/useAutoFocus";
import { applyFieldErrors } from "@/shared/ui/Form/applyFieldErrors";
import { Button } from "@/shared/ui/Button";

const NEW_SHOPPING_FORM_ID = "new-shopping-item-form";
const NEW_SHOPPING_FORM_TITLE_ID = "new-shopping-item-form-title";
const TITLE_MAX_LENGTH = 100;
const FORM_FIELDS = ["title"] as const;

const defaultValues: CreateShoppingItemFormInput = {
  title: "",
};

interface NewShoppingItemFormProps {
  onClose: () => void;
}

export function NewShoppingItemForm({ onClose }: NewShoppingItemFormProps) {
  const t = useTranslations("shopping.form");
  const { success: showSuccessToast } = useToast();

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

  useAutoFocus(setFocus, "title");

  function handleCloseComposer() {
    clearErrors();
    reset(defaultValues);
    onClose();
  }

  async function onSubmit(data: CreateShoppingItemFormData) {
    clearErrors("root");

    try {
      const result = await addShoppingItemAction(data);

      if (result.ok) {
        showSuccessToast(result.message ?? t("success"));
        reset(defaultValues);
        onClose();
        return;
      }

      const errorMessage = result.error ?? t("error");
      const firstInvalidField = applyFieldErrors(
        FORM_FIELDS,
        result.fieldErrors,
        (name, message) => setError(name, { type: "server", message }),
      );

      setError("root", {
        type: "server",
        message: errorMessage,
      });

      if (firstInvalidField) {
        requestAnimationFrame(() => {
          setFocus(firstInvalidField);
        });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : t("error");

      setError("root", {
        type: "server",
        message,
      });
    }
  }

  return (
    <FormComposer
      id={NEW_SHOPPING_FORM_ID}
      titleId={NEW_SHOPPING_FORM_TITLE_ID}
      title={t("title")}
      description={t("supportingCopy")}
      closeLabel={t("closeComposer")}
      closeAriaControls={NEW_SHOPPING_FORM_ID}
      closeAriaExpanded
      onClose={handleCloseComposer}
      isBusy={isSubmitting}
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {errors.root?.message ? (
          <FormMessage type="error" message={errors.root.message} />
        ) : null}

        <FieldGroup className="space-y-3">
          <TextField
            id="title"
            type="text"
            placeholder={t("fields.titlePlaceholder")}
            disabled={isSubmitting}
            required
            maxLength={TITLE_MAX_LENGTH}
            label={t("fields.title")}
            error={errors.title?.message}
            className="h-11"
            footer={
              <p className="text-xs text-stone-500">
                {t("characterCount", {
                  count: titleValue.length,
                  max: TITLE_MAX_LENGTH,
                })}
              </p>
            }
            {...register("title")}
          />

          <FormSubmitBar hint={t("submitHint")}>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? t("submitting") : t("submit")}
            </Button>
          </FormSubmitBar>
        </FieldGroup>
      </form>
    </FormComposer>
  );
}

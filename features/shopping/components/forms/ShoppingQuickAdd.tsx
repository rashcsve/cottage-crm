"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import {
  createShoppingItemSchema,
  type CreateShoppingItemFormInput,
  type CreateShoppingItemFormData,
} from "../../schemas";
import { getShoppingSchemaMessages } from "../../schemas/get-shopping-schema-messages";
import { addShoppingItemAction } from "../../server/actions";
import { useQuickAddSubmit } from "@/shared/hooks/useQuickAddSubmit";
import { TextField } from "@/shared/ui/Form/Field";
import { PendingSubmitButton } from "@/shared/ui/Form/PendingSubmitButton";
import { QuickAddAnnouncer } from "@/shared/ui/Form/QuickAddAnnouncer";
import { FormMessage } from "@/shared/ui/FormMessage";

const TITLE_MAX_LENGTH = 100;
const FORM_FIELDS = ["title"] as const;

const defaultValues: CreateShoppingItemFormInput = {
  title: "",
};

type ShoppingQuickAddVariant = "row" | "sheet";

const VARIANT_LAYOUT: Record<
  ShoppingQuickAddVariant,
  { inputId: string; formClassName: string }
> = {
  row: {
    inputId: "shopping-quick-add-title",
    formClassName: "space-y-3 py-3",
  },
  sheet: {
    inputId: "shopping-quick-add-sheet-title",
    formClassName: "space-y-3",
  },
};

interface ShoppingQuickAddProps {
  variant?: ShoppingQuickAddVariant;
  onAdded?: (title: string) => void;
}

export function ShoppingQuickAdd({
  variant = "row",
  onAdded,
}: ShoppingQuickAddProps) {
  const layout = VARIANT_LAYOUT[variant];
  const t = useTranslations("shopping.quickAdd");
  const tForm = useTranslations("shopping.form");

  const schema = useMemo(() => {
    return createShoppingItemSchema(getShoppingSchemaMessages(tForm));
  }, [tForm]);

  const form = useForm<
    CreateShoppingItemFormInput,
    undefined,
    CreateShoppingItemFormData
  >({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues,
  });
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  const { handleFormSubmit, announcement } = useQuickAddSubmit({
    form,
    fields: FORM_FIELDS,
    defaultValues,
    action: async (data) => {
      const result = await addShoppingItemAction(data);

      if (result.ok) {
        onAdded?.(data.title);
      }

      return result;
    },
    getSuccessMessage: (data) => t("added", { title: data.title }),
    fallbackError: tForm("error"),
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      noValidate
      className={layout.formClassName}
    >
      <QuickAddAnnouncer announcement={announcement} />

      {errors.root?.message ? (
        <FormMessage type="error" message={errors.root.message} />
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        <TextField
          id={layout.inputId}
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

        <PendingSubmitButton
          isPending={isSubmitting}
          label={t("submit")}
          pendingLabel={tForm("submitting")}
          className="col-start-2 row-start-2"
        />
      </div>
    </form>
  );
}

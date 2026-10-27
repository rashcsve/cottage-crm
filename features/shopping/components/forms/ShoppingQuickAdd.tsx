"use client";

import { useMemo, useState, type SubmitEvent } from "react";
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
import { TextField } from "@/shared/ui/Form/Field";
import { FormMessage } from "@/shared/ui/FormMessage";
import { applyFieldErrors } from "@/shared/ui/Form/applyFieldErrors";
import { Button } from "@/shared/ui/Button";

const TITLE_MAX_LENGTH = 100;
const FORM_FIELDS = ["title"] as const;

const defaultValues: CreateShoppingItemFormInput = {
  title: "",
};

export function ShoppingQuickAdd() {
  const t = useTranslations("shopping.quickAdd");
  const tForm = useTranslations("shopping.form");
  const [announcement, setAnnouncement] = useState({ id: 0, text: "" });

  const schema = useMemo(() => {
    return createShoppingItemSchema(getShoppingSchemaMessages(tForm));
  }, [tForm]);

  const {
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
    mode: "onSubmit",
    defaultValues,
  });

  async function onSubmit(data: CreateShoppingItemFormData) {
    clearErrors("root");

    try {
      const result = await addShoppingItemAction(data);

      if (result.ok) {
        setAnnouncement((previous) => ({
          id: previous.id + 1,
          text: t("added", { title: data.title }),
        }));
        reset(defaultValues, { keepFieldsRef: true });
        setFocus("title");
        return;
      }

      const firstInvalidField = applyFieldErrors(
        FORM_FIELDS,
        result.fieldErrors,
        (name, message) => setError(name, { type: "server", message }),
      );

      if (!firstInvalidField) {
        setError("root", {
          type: "server",
          message: result.error ?? tForm("error"),
        });
      }

      setFocus("title");
    } catch {
      setError("root", {
        type: "server",
        message: tForm("error"),
      });
      setFocus("title");
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
    <form onSubmit={handleFormSubmit} noValidate className="space-y-3 py-3">
      <span className="sr-only" role="status">
        <span key={announcement.id}>{announcement.text}</span>
      </span>

      {errors.root?.message ? (
        <FormMessage type="error" message={errors.root.message} />
      ) : null}

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-2">
        <TextField
          id="shopping-quick-add-title"
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

        <Button
          type="submit"
          disabled={isSubmitting}
          className="col-start-2 row-start-2"
        >
          <span className="grid">
            <span
              aria-hidden={isSubmitting || undefined}
              className={`col-start-1 row-start-1 ${isSubmitting ? "invisible" : ""}`.trim()}
            >
              {t("submit")}
            </span>
            <span
              aria-hidden={!isSubmitting || undefined}
              className={`col-start-1 row-start-1 ${isSubmitting ? "" : "invisible"}`.trim()}
            >
              {tForm("submitting")}
            </span>
          </span>
        </Button>
      </div>
    </form>
  );
}

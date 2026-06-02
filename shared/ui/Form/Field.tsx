import type {
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
} from "react";

import { FieldLabel } from "@/shared/ui/FieldLabel";

import { FieldError } from "./FieldError";
import { FieldHint } from "./FieldHint";
import { formInputClass } from "./formStyles";

interface FieldShellProps {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  footer?: ReactNode;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  footer?: ReactNode;
  fieldClassName?: string;
}

interface TextAreaFieldProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: ReactNode;
  error?: string;
  hint?: string;
  footer?: ReactNode;
  fieldClassName?: string;
}

function getDescribedBy({
  describedBy,
  error,
  hint,
  id,
}: {
  describedBy?: string;
  error?: string;
  hint?: string;
  id: string;
}) {
  const parts = [
    describedBy,
    error ? `${id}-error` : undefined,
    hint ? `${id}-hint` : undefined,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : undefined;
}

function FieldShell({
  id,
  label,
  error,
  hint,
  footer,
  required,
  children,
  className = "",
}: FieldShellProps) {
  const hasMessages = Boolean(error) || Boolean(hint);
  const hasFooter = footer !== undefined && footer !== null;

  return (
    <div className={className}>
      <FieldLabel htmlFor={id} required={required}>{label}</FieldLabel>
      {children}

      {hasMessages || hasFooter ? (
        <div
          className={
            hasFooter ? "flex items-start justify-between gap-3" : undefined
          }
        >
          <div className="min-w-0">
            <FieldError id={`${id}-error`} message={error} />
            <FieldHint id={`${id}-hint`} message={hint} />
          </div>

          {hasFooter ? <div className="mt-1 shrink-0">{footer}</div> : null}
        </div>
      ) : null}
    </div>
  );
}

export function TextField({
  id,
  label,
  error,
  hint,
  footer,
  fieldClassName,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  required,
  ...inputProps
}: TextFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      footer={footer}
      required={required}
      className={fieldClassName}
    >
      <input
        {...inputProps}
        id={id}
        required={required}
        aria-invalid={ariaInvalid ?? Boolean(error)}
        aria-describedby={getDescribedBy({
          describedBy: ariaDescribedBy,
          error,
          hint,
          id,
        })}
        className={`${formInputClass(Boolean(error))} ${className}`.trim()}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  id,
  label,
  error,
  hint,
  footer,
  fieldClassName,
  className = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  required,
  ...textareaProps
}: TextAreaFieldProps) {
  return (
    <FieldShell
      id={id}
      label={label}
      error={error}
      hint={hint}
      footer={footer}
      required={required}
      className={fieldClassName}
    >
      <textarea
        {...textareaProps}
        id={id}
        required={required}
        aria-invalid={ariaInvalid ?? Boolean(error)}
        aria-describedby={getDescribedBy({
          describedBy: ariaDescribedBy,
          error,
          hint,
          id,
        })}
        className={`${formInputClass(Boolean(error))} ${className}`.trim()}
      />
    </FieldShell>
  );
}

import type { ReactNode } from "react";

interface FieldLabelProps {
  htmlFor: string;
  children: ReactNode;
  required?: boolean;
}

export function FieldLabel({ htmlFor, children, required }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-semibold text-ink-primary"
    >
      {children}
      {required && (
        <span className="ml-1 text-danger" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

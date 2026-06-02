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
      className="mb-2 block text-sm font-medium text-stone-700"
    >
      {children}
      {required && (
        <span className="ml-1 text-red-500" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}

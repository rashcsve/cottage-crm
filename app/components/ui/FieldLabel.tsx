import type { ReactNode } from "react";

interface FieldLabelProps {
  htmlFor: string;
  children: ReactNode;
}

export function FieldLabel({ htmlFor, children }: FieldLabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className="mb-2 block text-sm font-medium text-stone-700"
    >
      {children}
    </label>
  );
}

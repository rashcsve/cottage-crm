import { TriangleAlert } from "lucide-react";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;

  return (
    <p
      id={id}
      className="mt-1.5 flex items-start gap-1.5 text-xs font-semibold text-danger"
      role="alert"
    >
      <TriangleAlert className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </p>
  );
}

interface FormMessageProps {
  type: "success" | "error";
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
  const className =
    type === "success"
      ? "border border-success-200 bg-success-50 text-success-700"
      : "border border-danger-200 bg-danger-50 text-danger-700";
  const role = type === "success" ? "status" : "alert";
  const ariaLive = type === "success" ? "polite" : "assertive";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`mt-3 rounded-xl px-4 py-3 text-sm ${className}`}
    >
      {message}
    </div>
  );
}

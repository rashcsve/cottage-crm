interface FormMessageProps {
  type: "success" | "error";
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
  const className =
    type === "success"
      ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border border-red-200 bg-red-50 text-red-700";
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

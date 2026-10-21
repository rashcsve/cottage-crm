import { CircleCheck, TriangleAlert } from "lucide-react";

interface FormMessageProps {
  type: "success" | "error";
  message: string;
}

export function FormMessage({ type, message }: FormMessageProps) {
  const isSuccess = type === "success";
  const toneClass = isSuccess
    ? "border-success text-success"
    : "border-danger text-danger";
  const Icon = isSuccess ? CircleCheck : TriangleAlert;
  const role = isSuccess ? "status" : "alert";
  const ariaLive = isSuccess ? "polite" : "assertive";

  return (
    <div
      role={role}
      aria-live={ariaLive}
      className={`mt-3 flex items-start gap-2 border-l-[3px] py-1 pl-3 text-sm font-semibold ${toneClass}`}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}

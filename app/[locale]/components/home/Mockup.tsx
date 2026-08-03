import type { ReactNode } from "react";
import { CalendarRange, ListTodo, ShoppingCart } from "lucide-react";

const NAV_ITEMS = [
  { Icon: CalendarRange, key: "presence" },
  { Icon: CalendarRange, key: "calendar" },
  { Icon: ShoppingCart, key: "shopping" },
  { Icon: ListTodo, key: "tasks" },
] as const;

interface MockupFrameProps {
  activeStep: number;
  children: ReactNode;
}

export function MockupFrame({ activeStep, children }: MockupFrameProps) {
  return (
    <div
      aria-hidden="true"
      className="w-full max-w-md overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_40px_80px_-32px_rgba(28,25,23,0.18)]"
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="h-2.5 w-2.5 rounded-full bg-border-strong" />
        <span className="ml-3 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">
          Chata CRM
        </span>
      </div>

      <div className="flex gap-1 border-b border-border px-4 py-3">
        {NAV_ITEMS.map(({ Icon, key }, index) => (
          <span
            key={key}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors duration-200 ${
              index === activeStep
                ? "bg-ink text-white"
                : "text-ink-faint"
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
        ))}
      </div>

      <div className="relative h-72">{children}</div>
    </div>
  );
}

interface MockupStepContentProps {
  step: number;
}

export function MockupStepContent({ step }: MockupStepContentProps) {
  if (step === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded-2xl border border-success-200 bg-success-50 p-4">
          <span className="h-9 w-9 shrink-0 rounded-full bg-success-200 ring-2 ring-success-200" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-24 rounded-full bg-success-700/70" />
            <div className="h-2 w-32 rounded-full bg-success-700/30" />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-muted p-4">
          <span className="h-9 w-9 shrink-0 rounded-full bg-border-strong" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-28 rounded-full bg-border-strong" />
            <div className="h-2 w-20 rounded-full bg-border" />
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 28 }).map((_, index) => {
          const isHighlighted = index >= 11 && index <= 14;
          return (
            <span
              key={index}
              className={`aspect-square rounded-md ${
                isHighlighted ? "bg-ink" : "bg-muted"
              }`}
            />
          );
        })}
      </div>
    );
  }

  if (step === 2) {
    return (
      <ul className="space-y-2.5">
        {[true, true, false, false].map((checked, index) => (
          <li key={index} className="flex items-center gap-3">
            <span
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                checked
                  ? "border-ink bg-ink"
                  : "border-border-strong bg-transparent"
              }`}
            >
              {checked ? (
                <span className="h-1.5 w-2.5 -translate-y-px -rotate-45 border-b-2 border-l-2 border-white" />
              ) : null}
            </span>
            <span
              className={`h-2.5 rounded-full bg-border-strong ${
                index % 2 === 0 ? "w-32" : "w-24"
              }`}
            />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="space-y-3">
      {[0, 1, 2].map((index) => (
        <li
          key={index}
          className="flex items-start gap-3 rounded-xl border border-border bg-muted p-3"
        >
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-border-strong" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-3/4 rounded-full bg-border-strong" />
            <div className="h-2 w-1/2 rounded-full bg-border" />
          </div>
        </li>
      ))}
    </ul>
  );
}

interface MockupProps {
  activeStep: number;
}

export function Mockup({ activeStep }: MockupProps) {
  return (
    <MockupFrame activeStep={activeStep}>
      <div className="tour-mockup-content h-full p-5">
        <MockupStepContent step={activeStep} />
      </div>
    </MockupFrame>
  );
}

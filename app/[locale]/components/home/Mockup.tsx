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
      className="w-full max-w-md overflow-hidden rounded-card border border-border bg-surface"
    >
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <span className="h-2.5 w-2.5 rounded-full bg-ink-faint" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-faint" />
        <span className="h-2.5 w-2.5 rounded-full bg-ink-faint" />
        <span className="ml-3 font-mono text-xs text-ink-muted">
          Chata CRM
        </span>
      </div>

      <div className="flex gap-1 border-b border-border px-4 py-3">
        {NAV_ITEMS.map(({ Icon, key }, index) => (
          <span
            key={key}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-control transition-colors duration-200 ${
              index === activeStep
                ? "bg-accent text-on-accent"
                : "text-ink-muted"
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
        <div className="flex items-center gap-3 rounded-card border border-border bg-surface p-4">
          <span className="h-9 w-9 shrink-0 rounded-full bg-success" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-24 rounded-control bg-success" />
            <div className="h-2 w-32 rounded-control bg-muted" />
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-card border border-border bg-muted p-4">
          <span className="h-9 w-9 shrink-0 rounded-full bg-ink-faint" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-28 rounded-control bg-ink-faint" />
            <div className="h-2 w-20 rounded-control bg-border" />
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
              className={`aspect-square rounded-control ${
                isHighlighted ? "bg-accent" : "bg-muted"
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
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-control border-control ${
                checked
                  ? "border-accent bg-accent"
                  : "border-ink-faint bg-transparent"
              }`}
            >
              {checked ? (
                <span className="h-1.5 w-2.5 -translate-y-px -rotate-45 border-b-2 border-l-2 border-on-accent" />
              ) : null}
            </span>
            <span
              className={`h-2.5 rounded-control bg-ink-faint ${
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
          className="flex items-start gap-3 rounded-card border border-border bg-muted p-3"
        >
          <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full border-2 border-ink-faint" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-2.5 w-3/4 rounded-control bg-ink-faint" />
            <div className="h-2 w-1/2 rounded-control bg-border" />
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

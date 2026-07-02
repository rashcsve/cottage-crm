import { Surface } from "./Surface";

interface StatCardProps {
  label: string;
  value: string | number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Surface className="p-3.5">
      <p className="text-xs font-semibold uppercase tracking-tight text-ink-muted">
        {label}
      </p>
      <p className="mt-1.5 text-2xl font-semibold text-ink">{value}</p>
    </Surface>
  );
}

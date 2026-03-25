import { Surface } from "./Surface";

interface StatCardProps {
  label: string;
  value: number;
}

export function StatCard({ label, value }: StatCardProps) {
  return (
    <Surface className="p-4">
      <p className="text-xs font-semibold uppercase tracking-tight text-stone-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold  text-stone-900">{value}</p>
    </Surface>
  );
}

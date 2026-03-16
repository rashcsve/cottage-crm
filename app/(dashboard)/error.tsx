"use client";

export default function DashboardError({ reset }: { reset: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
      <h2 className="text-lg font-semibold">Něco se pokazilo</h2>
      <p className="mt-2 text-sm text-red-700">
        Nepodařilo se načíst obsah dashboardu.
      </p>

      <button
        type="button"
        onClick={() => reset()}
        className="mt-4 rounded-xl border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
      >
        Zkusit znovu
      </button>
    </div>
  );
}

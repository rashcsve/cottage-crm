import { SectionHeader } from "@/app/components/SectionHeader";
import { StatCard } from "@/app/components/ui/StatCard";
import { NewVisitForm } from "@/app/components/visits/NewVisitForm";
import { Visit } from "@/app/components/visits/types";
import { getVisitStatus } from "@/app/components/visits/utils";
import { VisitsList } from "@/app/components/visits/VisitsList";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { createClient } from "@/lib/supabase/server";

export default async function VisitsPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const canManage = isAdminRole(profile.role);

  const { data, error } = await supabase
    .from("visits")
    .select(
      "id, visitor_name, date_from, date_to, note, author, author_id, created_at"
    )
    .order("date_from", { ascending: true });

  if (error) throw new Error(`Nepodařilo se načíst návštěvy: ${error.message}`);

  const visits = (data ?? []) as Visit[];

  const stats = visits.reduce(
    (acc, visit) => {
      const status = getVisitStatus(visit.date_from, visit.date_to);

      if (status === "upcoming") acc.upcoming += 1;
      if (status === "current") acc.current += 1;

      return acc;
    },
    { upcoming: 0, current: 0 }
  );

  return (
    <>
      <SectionHeader title="Kalendář návštěv" />

      <div className="max-w-4xl">
        <section className="mb-8 grid gap-3 sm:grid-cols-2">
          <StatCard label="Plánováno" value={stats.upcoming} />
          <StatCard label="Právě teď" value={stats.current} />
        </section>

        {canManage && <NewVisitForm />}

        <section className="space-y-8">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-tight text-stone-500">
              Návštěvy
            </h3>

            <VisitsList
              visits={visits}
              emptyMessage="Zatím tu nejsou žádné návštěvy."
              canManageVisits={canManage}
            />
          </div>
        </section>
      </div>
    </>
  );
}

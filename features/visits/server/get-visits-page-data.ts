"use server";

import { getVisits } from "./queries";
import { calculateVisitStats } from "../domain/visit-status";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import type { VisitsPageData } from "../types/visits";
import { toDateOnlyString } from "@/lib/utils/date";

export async function getVisitsPageData(): Promise<VisitsPageData> {
  const today = toDateOnlyString(new Date());

  const [visits, profile] = await Promise.all([
    getVisits(today),
    getCurrentProfile(),
  ]);

  const stats = calculateVisitStats(visits);
  const canManage = isAdminRole(profile.role);

  return {
    visits,
    stats,
    canManage,
  };
}

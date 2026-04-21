import "server-only";

import { getAllVisits } from "./queries";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import type { VisitsPageData } from "../types/visits";
import { toDateOnlyString } from "@/lib/utils/date";

export async function getVisitsPageData(): Promise<VisitsPageData> {
  const today = toDateOnlyString(new Date());

  const [visits, profile] = await Promise.all([
    getAllVisits(today),
    getCurrentProfile(),
  ]);

  const canManage = isAdminRole(profile.role);

  return {
    visits,
    canManage,
    todayIso: today,
    currentUserName: profile.display_name,
  };
}

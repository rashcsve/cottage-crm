import "server-only";

import { getAllVisits, getCouples } from "./queries";
import { mapProfileRowToCouple } from "./mappers";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { isDemoModeEnabled } from "@/lib/demo/is-demo-mode";
import {
  E2E_MOCK_COUPLES,
  E2E_MOCK_USER_COUPLE,
  getE2EMockVisits,
} from "@/lib/e2e/mock-data";
import { isE2EMockModeEnabled } from "@/lib/e2e/mock-mode";
import type { VisitsPageData } from "../types/visits";
import { getTodayIso } from "@/lib/utils/date";

export async function getVisitsPageData(): Promise<VisitsPageData> {
  const today = getTodayIso();

  const [visits, profile, allCouples] = await Promise.all([
    isE2EMockModeEnabled() ? getE2EMockVisits() : getAllVisits(today),
    getCurrentProfile(),
    isE2EMockModeEnabled() ? E2E_MOCK_COUPLES : getCouples(),
  ]);

  const couples = isDemoModeEnabled()
    ? allCouples
    : allCouples.filter((couple) => couple.id !== "admin");
  const canManage = isAdminRole(profile.role);
  const currentUserCouple = isE2EMockModeEnabled()
    ? E2E_MOCK_USER_COUPLE
    : mapProfileRowToCouple(profile);

  return {
    visits,
    canManage,
    todayIso: today,
    currentUserName: profile.display_name,
    currentUserCouple,
    couples,
  };
}

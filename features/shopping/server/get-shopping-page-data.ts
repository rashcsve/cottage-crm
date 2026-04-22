import "server-only";

import { getAllShoppingItems } from "./queries";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import type { ShoppingPageData } from "../types/shopping";

export async function getShoppingPageData(): Promise<ShoppingPageData> {
  const [items, profile] = await Promise.all([
    getAllShoppingItems(),
    getCurrentProfile(),
  ]);

  const canManage = isAdminRole(profile.role);

  const pendingItems = items.filter((item) => !item.isChecked);
  const purchasedItems = items.filter((item) => item.isChecked);

  return {
    pendingItems,
    purchasedItems,
    pendingCount: pendingItems.length,
    purchasedCount: purchasedItems.length,
    totalCount: items.length,
    canManage,
  };
}

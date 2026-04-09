"use server";

import { getShoppingList } from "./queries";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { ShoppingPageData } from "../types/shopping";

export async function getShoppingPageData(): Promise<ShoppingPageData> {
  const [items, profile] = await Promise.all([
    getShoppingList(),
    getCurrentProfile(),
  ]);

  const canManage = isAdminRole(profile.role);

  const pendingItems = items.filter((item) => !item.is_checked);
  const purchasedItems = items.filter((item) => item.is_checked);

  return {
    pendingItems,
    purchasedItems,
    pendingCount: pendingItems.length,
    purchasedCount: purchasedItems.length,
    totalCount: items.length,
    canManage,
  };
}

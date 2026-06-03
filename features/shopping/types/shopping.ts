export type ShoppingFilter = "pending" | "purchased";

export interface ShoppingItem {
  id: number;
  title: string;
  isChecked: boolean;
  author: string;
  authorId: string;
  broughtBy: string | null;
  broughtById: string | null;
  createdAt: string;
}

export interface CreateShoppingItemInput {
  title: string;
}

export interface UpdateShoppingItemInput {
  id: number;
}

export interface ShoppingPageData {
  pendingItems: ShoppingItem[];
  purchasedItems: ShoppingItem[];
  pendingCount: number;
  purchasedCount: number;
  totalCount: number;
  canManage: boolean;
}

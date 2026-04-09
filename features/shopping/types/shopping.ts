export interface ShoppingItem {
  id: number;
  title: string;
  is_checked: boolean;
  author: string;
  author_id: string;
  brought_by: string | null;
  brought_by_id: string | null;
  created_at: string;
}

export type ShoppingItemStatus = "pending" | "purchased";
export type ShoppingListResponse = ShoppingItem[];

export interface CreateShoppingItemInput {
  title: string;
}

export interface UpdateShoppingItemInput {
  id: number;
  is_checked: boolean;
}

export interface ShoppingPageData {
  pendingItems: ShoppingItem[];
  purchasedItems: ShoppingItem[];
  pendingCount: number;
  purchasedCount: number;
  totalCount: number;
  canManage: boolean;
}

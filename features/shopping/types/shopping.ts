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

export type ShoppingListResponse = ShoppingItem[];

export interface CreateShoppingItemInput {
  title: string;
}

export interface UpdateShoppingItemInput {
  id: number;
  isChecked: boolean;
}

export interface ShoppingPageData {
  pendingItems: ShoppingItem[];
  purchasedItems: ShoppingItem[];
  pendingCount: number;
  purchasedCount: number;
  totalCount: number;
  canManage: boolean;
}

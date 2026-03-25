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

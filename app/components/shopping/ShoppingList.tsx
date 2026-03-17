import { ShoppingItemRow } from "./ShoppingItemRow";
import { ShoppingItem } from "./types";

interface ShoppingListProps {
  items: ShoppingItem[];
}

export function ShoppingList({ items }: ShoppingListProps) {
  if (items.length === 0) {
    return <p className="text-stone-500">Zatím tu nejsou žádné položky.</p>;
  }

  return (
    <section className="space-y-3">
      {items.map((item) => (
        <ShoppingItemRow item={item} key={item.id} />
      ))}
    </section>
  );
}

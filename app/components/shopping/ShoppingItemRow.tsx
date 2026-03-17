import { ShoppingItem } from "./types";

interface ShoppingItemRowProps {
  item: ShoppingItem;
}

export function ShoppingItemRow({ item }: ShoppingItemRowProps) {
  return (
    <article className="flex items-start justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <p
          className={
            item.is_checked ? "line-through text-stone-400" : "text-stone-800"
          }
        >
          {item.title}
        </p>

        <p className="mt-1 text-sm text-stone-500">Přidal(a): {item.author}</p>

        {item.brought_by && (
          <p className="mt-1 text-sm text-stone-500">
            Přivezl(a): {item.brought_by}
          </p>
        )}
      </div>

      <div className="shrink-0 text-xs text-stone-500">
        {item.is_checked ? "Vyřešeno" : "Chybí"}
      </div>
    </article>
  );
}

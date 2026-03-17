import { ShoppingItemActions } from "./ShoppingItemActions";
import { ShoppingItem } from "./types";

interface ShoppingItemRowProps {
  item: ShoppingItem;
  canManageItems: boolean;
}

export function ShoppingItemRow({
  item,
  canManageItems,
}: ShoppingItemRowProps) {
  return (
    <article className="rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={
              item.is_checked
                ? "text-base font-medium text-stone-400 line-through"
                : "text-base font-medium text-stone-900"
            }
          >
            {item.title}
          </p>

          <div className="mt-1 flex items-center gap-x-3 gap-y-1 text-sm text-stone-500">
            <span>Přidal(a): {item.author}</span>

            {item.brought_by && (
              <>
                <span className="text-stone-300">•</span>
                <span>Přivezl(a): {item.brought_by}</span>
              </>
            )}
          </div>

          {canManageItems && (
            <div className="mt-2">
              <ShoppingItemActions
                itemId={item.id}
                isChecked={item.is_checked}
              />
            </div>
          )}
        </div>

        <div className="shrink-0 text-xs font-medium text-stone-400">
          {item.is_checked ? "Vyřešeno" : "Chybí"}
        </div>
      </div>
    </article>
  );
}

import { ShoppingItemActions } from "@/app/components/shopping/ShoppingItemActions";
import { ShoppingItem } from "@/app/components/shopping/types";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ListRow } from "@/shared/ui/ListRow";
import { MetaText } from "@/shared/ui/MetaText";
import { InlineActions } from "@/shared/ui/InlineActions";

interface ShoppingItemRowProps {
  item: ShoppingItem;
  canManageItems: boolean;
}

export function ShoppingItemRow({
  item,
  canManageItems,
}: ShoppingItemRowProps) {
  return (
    <ListRow>
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

          <div className="mt-1 flex items-center gap-x-2 gap-y-1 text-xs text-stone-500">
            <MetaText>Přidal(a): {item.author}</MetaText>

            {item.brought_by && (
              <>
                <MetaText>•</MetaText>
                <MetaText>Přivezl(a): {item.brought_by}</MetaText>
              </>
            )}
          </div>

          {canManageItems && (
            <InlineActions>
              <ShoppingItemActions
                itemId={item.id}
                isChecked={item.is_checked}
              />
            </InlineActions>
          )}
        </div>

        <div className="shrink-0">
          <StatusBadge tone={item.is_checked ? "success" : "warning"}>
            {item.is_checked ? "Vyřešeno" : "Chybí"}
          </StatusBadge>
        </div>
      </div>
    </ListRow>
  );
}

import { ShoppingList } from "@/features/shopping/components/ShoppingList";
import type {
  ShoppingFilter,
  ShoppingItem,
} from "@/features/shopping/types/shopping";
import { Surface } from "@/shared/ui/Surface";

interface ShoppingGroupProps {
  label: string;
  items: ShoppingItem[];
  canManageItems: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  view: ShoppingFilter;
}

export function ShoppingGroup({
  label,
  items,
  canManageItems,
  emptyTitle,
  emptyDescription,
  view,
}: ShoppingGroupProps) {
  return (
    <section aria-label={label}>
      <Surface className="px-4 lg:px-6">
        <ShoppingList
          items={items}
          canManageItems={canManageItems}
          emptyTitle={emptyTitle}
          emptyDescription={emptyDescription}
          view={view}
        />
      </Surface>
    </section>
  );
}

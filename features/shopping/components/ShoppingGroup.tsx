import type { ReactNode } from "react";
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
  leadingRow?: ReactNode;
}

export function ShoppingGroup({
  label,
  items,
  canManageItems,
  emptyTitle,
  emptyDescription,
  view,
  leadingRow,
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
          leadingRow={leadingRow}
        />
      </Surface>
    </section>
  );
}

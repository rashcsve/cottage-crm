import { SectionHeader } from "@/app/components/SectionHeader";
import { NewShoppingItemForm } from "@/app/components/shopping/NewShoppingItemForm";
import { ShoppingList } from "@/app/components/shopping/ShoppingList";
import { ShoppingItem } from "@/app/components/shopping/types";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { isAdminRole } from "@/lib/auth/is-admin-role";
import { createClient } from "@/lib/supabase/server";

export default async function ShoppingPage() {
  const supabase = await createClient();
  const profile = await getCurrentProfile();
  const canManage = isAdminRole(profile.role);

  const { data, error } = await supabase
    .from("shopping_items")
    .select(
      "id, title, is_checked, author, author_id, brought_by, brought_by_id, created_at"
    )
    .order("created_at", { ascending: false });

  if (error)
    throw new Error(`Nepodařilo se načíst nákupní seznam: ${error.message}`);

  const items = (data ?? []) as ShoppingItem[];
  const missingItems = items.filter((item) => !item.is_checked);
  const resolvedItems = items.filter((item) => item.is_checked);

  return (
    <>
      <SectionHeader title="Seznam nákupů" />

      <section className="mb-6 flex items-center gap-4 text-sm text-stone-600">
        <p>
          Chybí: <strong>{missingItems.length}</strong>
        </p>
        <p>
          Vyřešeno: <strong>{resolvedItems.length}</strong>
        </p>
      </section>

      {canManage && <NewShoppingItemForm />}

      <section className="space-y-8">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Chybí
          </h3>
          <ShoppingList items={missingItems} canManageItems={canManage} />
        </div>

        <div className="mt-8">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">
            Vyřešeno
          </h3>
          <ShoppingList items={resolvedItems} canManageItems={canManage} />
        </div>
      </section>
    </>
  );
}

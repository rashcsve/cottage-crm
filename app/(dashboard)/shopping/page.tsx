import { SectionHeader } from "@/app/components/SectionHeader";
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
  const missingCount = items.filter((item) => !item.is_checked).length;
  const resolvedCount = items.length - missingCount;

  return (
    <>
      <SectionHeader title="Seznam nákupů" />

      <section className="mb-6 flex items-center gap-4 text-sm text-stone-600">
        <p>
          Chybí: <strong>{missingCount}</strong>
        </p>
        <p>
          Vyřešeno: <strong>{resolvedCount}</strong>
        </p>
      </section>

      {!canManage && (
        <p className="mb-6 text-sm text-stone-500">
          Máš přístup jen pro čtení.
        </p>
      )}

      <ShoppingList items={items} />
    </>
  );
}

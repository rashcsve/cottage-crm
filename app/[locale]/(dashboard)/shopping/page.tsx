import { NewShoppingItemForm } from "@/app/[locale]/components/shopping/NewShoppingItemForm";
import { ShoppingList } from "@/app/[locale]/components/shopping/ShoppingList";
import { ShoppingItem } from "@/app/[locale]/components/shopping/types";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/Page/PageHeader";
import { PageSection } from "@/shared/ui/PageSections";
import { StatCard } from "@/shared/ui/StatCard";
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
    <PageContent>
      <PageHeader title="Seznam nákupů" />

      <section className="mb-8 grid gap-3 sm:grid-cols-2">
        <StatCard label="Chybí" value={missingItems.length} />
        <StatCard label="Vyřešeno" value={resolvedItems.length} />
      </section>

      {canManage && <NewShoppingItemForm />}

      <PageSection title="Chybí">
        <ShoppingList items={missingItems} canManageItems={canManage} />
      </PageSection>

      <PageSection title="Vyřešeno">
        <ShoppingList items={resolvedItems} canManageItems={canManage} />
      </PageSection>
    </PageContent>
  );
}

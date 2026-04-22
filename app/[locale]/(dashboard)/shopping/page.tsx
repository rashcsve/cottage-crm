import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ShoppingPageBody } from "@/features/shopping/components/ShoppingPageBody";
import { ShoppingFilterSchema } from "@/features/shopping/schemas";
import { getShoppingPageData } from "@/features/shopping/server/get-shopping-page-data";
import { PageContent } from "@/shared/ui/page/PageContent";
import { PageHeader } from "@/shared/ui/page/PageHeader";

export const metadata: Metadata = {
  title: "Shopping List",
};

interface SearchParams {
  filter?: string | string[];
}

export default async function ShoppingPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await searchParamsPromise;
  const filterSchema = ShoppingFilterSchema.catch("pending");
  const activeFilter = filterSchema.parse(searchParams?.filter);

  const [data, t] = await Promise.all([
    getShoppingPageData(),
    getTranslations("shopping"),
  ]);

  return (
    <PageContent className="max-w-7xl space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />

      <ShoppingPageBody activeFilter={activeFilter} data={data} />
    </PageContent>
  );
}

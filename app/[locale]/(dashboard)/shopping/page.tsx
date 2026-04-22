import { getTranslations } from "next-intl/server";
import { ShoppingPageBody } from "@/features/shopping/components/ShoppingPageBody";
import { ShoppingFilterSchema } from "@/features/shopping/schemas";
import { getShoppingPageData } from "@/features/shopping/server/get-shopping-page-data";
import { PageLayout } from "@/shared/ui/page/PageLayout";
import { createPageMetadata } from "@/app/[locale]/metadata";

export const generateMetadata = createPageMetadata("shopping");

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
    <PageLayout
      title={t("pageTitle")}
      description={t("pageDescription")}
      size="wide"
    >
      <ShoppingPageBody activeFilter={activeFilter} data={data} />
    </PageLayout>
  );
}
